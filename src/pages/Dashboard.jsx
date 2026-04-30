import { useState, useEffect, createElement } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Flame, Trophy, Target, ArrowRight, PlayCircle, BookOpen,
  Loader2, Plus, MessageSquare, Zap, Shield, Gamepad2, Star
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import userProgressService from '../services/userProgress';
import { getGameProgress } from '../services/game';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid, 
  BarChart,
  Bar,
} from 'recharts';

const gradients = [
  'from-indigo-500 to-purple-600',
  'from-fuchsia-500 to-pink-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-rose-500 to-red-600',
];

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [progressList, setProgressList] = useState([]);
  const [gameProgress, setGameProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userProgressService.getProgress()
      .then(res => {
        const data = res?.data?.progress || res?.data || res?.progress || [];
        setProgressList(Array.isArray(data) ? data : []);
      })
      .catch(() => setProgressList([]))
      .finally(() => setLoading(false));

    if (user) {
      getGameProgress()
        .then(res => setGameProgress(res.data.progress || []))
        .catch(() => setGameProgress([]));
    }
  }, [user]);

  const computeTrackStats = (p) => {
    const levels = Array.isArray(p?.levelsProgress) ? p.levelsProgress : []
    const totalLevels = levels.length || 5
    const passedLevels = levels.filter((lp) => lp.status === "review" || lp.status === "passed").length
    const failedLevels = levels.filter((lp) => lp.status === "failed").length

    const lessonProgress = levels.flatMap((lp) => (Array.isArray(lp.lessonProgress) ? lp.lessonProgress : []))
    const lessonsDone = lessonProgress.filter((lp) => lp.status === "done").length
    const lessonsSkipped = lessonProgress.filter((lp) => lp.status === "skipped").length
    const lessonCompletionCount = lessonsDone + lessonsSkipped

    const pct = totalLevels ? Math.round((passedLevels / totalLevels) * 100) : 0
    return { totalLevels, passedLevels, failedLevels, lessonCompletionCount, pct, activePhase: p?.activePhase || "lessons" }
  }

  // Aggregate stats from progress list
  const totalXP = progressList.reduce((acc, p) => acc + (p.xp ?? 0), 0);
  const streak = user?.streak ?? progressList[0]?.streak ?? 0;
  const completedLessons = progressList.reduce((acc, p) => acc + (computeTrackStats(p).lessonCompletionCount ?? 0), 0);
  const chatCount = user?.chatCount ?? 0;
  const chatLimit = user?.isPremium ? '∞' : '30';
  
  const totalStars = gameProgress.reduce((acc, p) => acc + (p.stars ?? 0), 0);
  const mosaicLevels = gameProgress.filter(p => p.gameType === 'afro-mosaic').length;

  // First non-complete track for "continue" CTA
  const activeTrack = progressList.find((p) => computeTrackStats(p).pct < 100) || progressList[0];
  const activeTrackStats = activeTrack ? computeTrackStats(activeTrack) : null;
  const firstName = user?.fullName?.split(' ')[0] || user?.username || t('general.student');

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-8 opacity-20 hidden sm:block">
          <Trophy className="w-48 h-48 -mr-12 -mt-12" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">
            {t('dashboard.welcome')}, {firstName}! 👋
          </h1>
          <p className="text-indigo-100 text-lg mb-8">
            {streak > 0 
              ? t('dashboard.streak', { count: streak }) 
              : t('dashboard.noStreak')}
          </p>
          <div className="flex flex-wrap gap-3">
            {activeTrack ? (
              <Link
                to={`/learning/${activeTrack.learning?._id || activeTrack.learning}`}
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-full font-bold hover:bg-indigo-50 transition-colors shadow-sm"
              >
                <PlayCircle className="w-5 h-5" />
                {t('dashboard.continueLearning')}
              </Link>
            ) : (
              <Link
                to="/tracks"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-full font-bold hover:bg-indigo-50 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                {t('dashboard.startTrack')}
              </Link>
            )}
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white px-6 py-3 rounded-full font-bold transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              {t('dashboard.aiTutor')}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main content */}
        <div className="lg:col-span-2 space-y-8">

          {/* Active Tracks */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('dashboard.yourTracks')}</h2>
              <Link to="/tracks" className="text-indigo-600 dark:text-indigo-400 font-medium text-sm flex items-center gap-1 hover:underline">
                {t('dashboard.viewAll')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 gap-3 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              </div>
            ) : progressList.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center">
                <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="font-semibold text-slate-500 dark:text-slate-400 mb-4">{t('dashboard.noTracks')}</p>
                <Link
                  to="/tracks"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" /> {t('dashboard.browseTracks')}
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {progressList.slice(0, 4).map((p, idx) => {
                  const trackId = p.learning?._id || p.learning;
                  const title = p.learning?.title || p.title || t('nav.learningTracks');
                  const stats = computeTrackStats(p)
                  const pct = stats.pct
                  return (
                    <Motion.div
                      key={p._id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        to={`/learning/${trackId}`}
                        className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center`}>
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs font-bold text-slate-400">{pct}%</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {title}
                        </h3>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                          <div
                            className={`bg-gradient-to-r ${gradients[idx % gradients.length]} h-2 rounded-full transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {stats.lessonCompletionCount > 0 && (
                          <p className="text-xs text-slate-400 mt-2">
                            {t('dashboard.lessonsCompleted', { count: stats.lessonCompletionCount })}
                          </p>
                        )}
                      </Link>
                    </Motion.div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quick actions */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('dashboard.quickActions')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { to: '/chat', icon: MessageSquare, label: t('nav.aiTutorChat'), desc: t('dashboard.practiceAi'), color: 'indigo' },
                { to: '/tracks', icon: BookOpen, label: t('dashboard.browseTracks'), desc: t('dashboard.findLanguages'), color: 'fuchsia' },
                ...((user?.role === 'admin' || user?.role === 'super-admin') ? [{ to: '/admin', icon: Shield, label: t('nav.adminPanel'), desc: t('dashboard.manageSystem'), color: 'rose' }] : []),
                { to: '/premium', icon: Zap, label: t('nav.goPremium'), desc: t('dashboard.unlockEverything'), color: 'yellow', hide: user?.isPremium },
              ].filter(a => !a.hide).map(({ to, icon: Icon, label, desc, color }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md hover:border-${color}-300 dark:hover:border-${color}-700 transition-all group`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-500 flex items-center justify-center`}>
                    {createElement(Icon, { className: "w-5 h-5" })}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Stats sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">{t('dashboard.yourStats')}</h3>
            <div className="space-y-5">
              {[
                { icon: Flame, label: t('dashboard.dayStreak'), value: streak || '—', bg: 'orange' },
                { icon: Trophy, label: t('dashboard.totalXP'), value: totalXP || '—', bg: 'indigo' },
                { icon: BookOpen, label: t('dashboard.lessonsDone'), value: completedLessons || '—', bg: 'emerald' },
                { icon: Target, label: t('dashboard.tracksActive'), value: progressList.length || '—', bg: 'fuchsia' },
              ].map(({ icon: Icon, label, value, bg }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${bg}-50 dark:bg-${bg}-900/20 text-${bg}-500 flex items-center justify-center shrink-0`}>
                    {createElement(Icon, { className: "w-6 h-6" })}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
                    <div className="text-sm font-medium text-slate-500">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Game Mastery Stats */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-indigo-500" />
              {t('dashboard.gameMastery')}
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {totalStars} <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('dashboard.starsEarned')}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{mosaicLevels}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('dashboard.stagesClear')}</div>
                </div>
              </div>
              
              <Link 
                to="/game" 
                className="block w-full py-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-center text-xs font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
              >
                {t('dashboard.continueMosaic')}
              </Link>
            </div>
          </div>

          {/* Pro analytics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">{t('dashboard.proAnalytics')}</h3>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {activeTrackStats ? `${activeTrackStats.pct}%` : "—"} {t('dashboard.complete')}
              </div>
            </div>

            {activeTrack && (
              <>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart
                      data={(() => {
                        const events = (activeTrack?.levelsProgress || [])
                          .filter((lp) => lp.passedAt)
                          .slice()
                          .sort((a, b) => new Date(a.passedAt) - new Date(b.passedAt))

                        let cumulative = 0
                        return events.map((e) => {
                          const xpGain = Math.round((e.lastQuizScore ?? e.bestQuizScore ?? 0) / 2)
                          cumulative += xpGain
                          const dt = new Date(e.passedAt)
                          const label = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                          return { name: label, xp: cumulative }
                        })
                      })()}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="xp" stroke="#4f46e5" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-56 mt-6">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart
                      data={(() => {
                        const levels = Array.isArray(activeTrack?.levelsProgress) ? activeTrack.levelsProgress : []
                        const locked = levels.filter((lp) => lp.status === "locked").length
                        const active = levels.filter((lp) => lp.status === "active").length
                        const failed = levels.filter((lp) => lp.status === "failed").length
                        const review = levels.filter((lp) => lp.status === "review").length
                        return [
                          { name: t('chronosGrid.status.integrity').split(' ')[1] || "Locked", value: locked },
                          { name: t('chronosGrid.status.awaiting').split(' ')[0] || "Active", value: active },
                          { name: "Failed", value: failed },
                          { name: "Review", value: review },
                        ]
                      })()}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>

          {/* AI Chat Quota */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">{t('dashboard.aiChatsToday')}</span>
              </div>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                {chatCount} / {chatLimit}
              </span>
            </div>
            {!user?.isPremium && (
              <>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-3">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((chatCount / 30) * 100, 100)}%` }}
                  />
                </div>
                {chatCount >= 30 ? (
                  <Link to="/premium" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    {t('dashboard.upgradeUnlimited')} →
                  </Link>
                ) : (
                  <p className="text-xs text-slate-400">{t('dashboard.messagesRemaining', { count: 30 - chatCount })}</p>
                )}
              </>
            )}
            {user?.isPremium && (
              <p className="text-xs font-semibold text-yellow-500">⭐ {t('dashboard.premiumPlan')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
