import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame, Trophy, Target, ArrowRight, PlayCircle, BookOpen,
  Loader2, Plus, MessageSquare, Zap, Shield
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import userProgressService from '../services/userProgress';

const gradients = [
  'from-indigo-500 to-purple-600',
  'from-fuchsia-500 to-pink-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-rose-500 to-red-600',
];

const Dashboard = () => {
  const { user } = useAuthStore();
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userProgressService.getProgress()
      .then(res => {
        const data = res?.data?.progress || res?.data || res?.progress || [];
        setProgressList(Array.isArray(data) ? data : []);
      })
      .catch(() => setProgressList([]))
      .finally(() => setLoading(false));
  }, []);

  // Aggregate stats from progress list
  const totalXP = progressList.reduce((acc, p) => acc + (p.xp ?? 0), 0);
  const streak = user?.streak ?? progressList[0]?.streak ?? 0;
  const completedLessons = progressList.reduce((acc, p) => acc + (p.completedLessons?.length ?? 0), 0);
  const chatCount = user?.chatCount ?? 0;
  const chatLimit = user?.isPremium ? '∞' : '5';

  // First non-complete track for "continue" CTA
  const activeTrack = progressList.find(p => (p.progress ?? 0) < 100) || progressList[0];
  const firstName = user?.fullName?.split(' ')[0] || user?.username || 'Learner';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-8 opacity-20 hidden sm:block">
          <Trophy className="w-48 h-48 -mr-12 -mt-12" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-indigo-100 text-lg mb-8">
            {streak > 0 ? `You're on a ${streak}-day streak. Keep it up!` : "Start your streak today — learn something new!"}
          </p>
          <div className="flex flex-wrap gap-3">
            {activeTrack ? (
              <Link
                to={`/learning/${activeTrack.learning?._id || activeTrack.learning}`}
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-full font-bold hover:bg-indigo-50 transition-colors shadow-sm"
              >
                <PlayCircle className="w-5 h-5" />
                Continue Learning
              </Link>
            ) : (
              <Link
                to="/tracks"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-full font-bold hover:bg-indigo-50 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Start a Track
              </Link>
            )}
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white px-6 py-3 rounded-full font-bold transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              AI Tutor
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Tracks</h2>
              <Link to="/tracks" className="text-indigo-600 dark:text-indigo-400 font-medium text-sm flex items-center gap-1 hover:underline">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 gap-3 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              </div>
            ) : progressList.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center">
                <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="font-semibold text-slate-500 dark:text-slate-400 mb-4">No tracks started yet</p>
                <Link
                  to="/tracks"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" /> Browse Tracks
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {progressList.slice(0, 4).map((p, idx) => {
                  const trackId = p.learning?._id || p.learning;
                  const title = p.learning?.title || p.title || 'Learning Track';
                  const pct = Math.round(p.progress ?? 0);
                  return (
                    <motion.div
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
                        {p.completedLessons?.length > 0 && (
                          <p className="text-xs text-slate-400 mt-2">{p.completedLessons.length} lesson{p.completedLessons.length !== 1 ? 's' : ''} completed</p>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quick actions */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { to: '/chat', icon: MessageSquare, label: 'AI Tutor Chat', desc: 'Practice with AI', color: 'indigo' },
                { to: '/tracks', icon: BookOpen, label: 'Browse Tracks', desc: 'Find new languages', color: 'fuchsia' },
                ...((user?.role === 'admin' || user?.role === 'super-admin') ? [{ to: '/admin', icon: Shield, label: 'Admin Panel', desc: 'Manage system', color: 'rose' }] : []),
                { to: '/premium', icon: Zap, label: 'Go Premium', desc: 'Unlock everything', color: 'yellow', hide: user?.isPremium },
              ].filter(a => !a.hide).map(({ to, icon: Icon, label, desc, color }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md hover:border-${color}-300 dark:hover:border-${color}-700 transition-all group`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-500 flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
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
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Your Stats</h3>
            <div className="space-y-5">
              {[
                { icon: Flame, label: 'Day Streak', value: streak || '—', bg: 'orange' },
                { icon: Trophy, label: 'Total XP', value: totalXP || '—', bg: 'indigo' },
                { icon: BookOpen, label: 'Lessons Done', value: completedLessons || '—', bg: 'emerald' },
                { icon: Target, label: 'Tracks Active', value: progressList.length || '—', bg: 'fuchsia' },
              ].map(({ icon: Icon, label, value, bg }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${bg}-50 dark:bg-${bg}-900/20 text-${bg}-500 flex items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
                    <div className="text-sm font-medium text-slate-500">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Chat Quota */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">AI Chats Today</span>
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
                    style={{ width: `${Math.min((chatCount / 5) * 100, 100)}%` }}
                  />
                </div>
                {chatCount >= 5 ? (
                  <Link to="/premium" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Upgrade for unlimited chats →
                  </Link>
                ) : (
                  <p className="text-xs text-slate-400">{5 - chatCount} message{5 - chatCount !== 1 ? 's' : ''} remaining today</p>
                )}
              </>
            )}
            {user?.isPremium && (
              <p className="text-xs font-semibold text-yellow-500">⭐ Unlimited — Premium plan</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
