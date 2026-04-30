import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Layers, ArrowRight, Loader2, Trophy, Target, Gamepad2, Star, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import userProgressService from '../services/userProgress';
import { getGameProgress } from '../services/game';

const gradients = [
  'from-indigo-500 to-purple-600',
  'from-fuchsia-500 to-pink-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-rose-500 to-red-600',
];

const ProgressPage = () => {
  const { t } = useTranslation();
  const [progressList, setProgressList] = useState([]);
  const [gameProgress, setGameProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    userProgressService.getProgress()
      .then(res => {
        const rawData = res?.data?.progress || res?.data || res?.progress || [];
        // Handle single object vs array
        const list = Array.isArray(rawData) ? rawData : (rawData && typeof rawData === 'object' ? [rawData] : []);
        setProgressList(list);
      })
      .catch((e) => {
        console.error("Progress fetch error:", e);
        setError(true);
      })
      .finally(() => setLoading(false));

    getGameProgress()
      .then(res => setGameProgress(res.data.progress || []))
      .catch(() => setGameProgress([]));
  }, []);

  const computeTrackStats = (p) => {
    const levels = Array.isArray(p?.levelsProgress) ? p.levelsProgress : []
    const totalLevels = levels.length || 5
    const passedLevels = levels.filter((lp) => lp.status === "review" || lp.status === "passed").length

    const lessonProgress = levels.flatMap((lp) => (Array.isArray(lp.lessonProgress) ? lp.lessonProgress : []))
    const lessonsDone = lessonProgress.filter((lp) => lp.status === "done").length
    const lessonsSkipped = lessonProgress.filter((lp) => lp.status === "skipped").length
    const lessonCompletionCount = lessonsDone + lessonsSkipped

    const pct = totalLevels ? Math.round((passedLevels / totalLevels) * 100) : 0
    return { totalLevels, passedLevels, lessonCompletionCount, pct, isComplete: pct >= 100 }
  }

  const totalXP = progressList.reduce((acc, p) => acc + (p.xp ?? 0), 0);
  const totalLessons = progressList.reduce((acc, p) => acc + (computeTrackStats(p).lessonCompletionCount ?? 0), 0);

  // Progress indicators
  const tracksWithStats = progressList.map(p => {
    return { ...p, ...computeTrackStats(p) };
  });

  const completedTracks = tracksWithStats.filter(t => t.isComplete).length;
  const activeTracks = tracksWithStats.filter(t => !t.isComplete).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('progress.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('progress.subtitle')}</p>
      </div>

      {/* Summary Stats */}
      {!loading && progressList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: t('progress.totalXP'), value: totalXP, icon: Trophy, color: 'indigo' },
            { label: t('progress.lessonsDone'), value: totalLessons, icon: CheckCircle2, color: 'emerald' },
            { label: t('progress.tracksActive'), value: activeTracks, icon: Layers, color: 'fuchsia' },
            { label: t('progress.tracksFinished'), value: completedTracks, icon: Target, color: 'orange' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-500 flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
              <div className="text-sm font-medium text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Game Achievements Summary */}
      {!loading && gameProgress.length > 0 && (
        <section className="bg-[#121212] border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                   <Gamepad2 size={20} />
                 </div>
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">{t('progress.mosaicMaster')}</h2>
              </div>
              <p className="text-slate-400 font-medium">{t('progress.historicalStatus')}</p>
            </div>

            <div className="flex gap-10">
              <div className="text-center">
                <div className="text-4xl font-black text-white flex items-center justify-center gap-2">
                  {gameProgress.reduce((acc, p) => acc + (p.stars ?? 0), 0)}
                  <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{t('progress.totalStars')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-white">
                  {gameProgress.filter(p => p.gameType === 'afro-mosaic').length + gameProgress.filter(p => p.gameType === 'chronos-grid').length}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{t('progress.totalStages')}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link 
                to="/game"
                className="px-6 py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={14} /> AfroMosaic
              </Link>
              <Link 
                to="/chronos-grid"
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
              >
                <Layers size={14} /> ChronosGrid
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Progress List */}
      {loading && (
        <div className="flex items-center justify-center py-24 gap-3 text-slate-500">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
          <span>{t('progress.loading')}</span>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-24">
          <p className="text-slate-500 dark:text-slate-400">{t('progress.error')}</p>
        </div>
      )}

      {!loading && !error && progressList.length === 0 && (
        <div className="text-center py-24 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
          <BookOpen className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">{t('progress.noProgress')}</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{t('progress.enrollDesc')}</p>
          <Link
            to="/tracks"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-full font-bold transition-colors"
          >
            {t('progress.browseTracks')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {!loading && !error && progressList.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('progress.enrolledTracks')}</h2>
          {tracksWithStats.map((p, idx) => {
            const trackId = p.learning?._id || p.learning;
            const title = p.learning?.title || p.title || t('nav.learningTracks');
            const targetLang = p.learning?.targetLanguage;
            const langName = targetLang?.name || '';
            const flag = targetLang?.metadata?.flag || '';
            const currentLevelTitle = p.currentLevel?.title || `Level ${p.overallLevel || 1}`;

            const completedCount = p.lessonCompletionCount ?? 0;
            const pct = p.pct;
            const isComplete = p.isComplete;

            return (
              <div
                key={p._id || idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center shrink-0 shadow-md`}>
                  <BookOpen className="w-7 h-7 text-white" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{title}</h3>
                    {langName && (
                      <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        {flag && <span>{flag}</span>}
                        {langName}
                      </span>
                    )}
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">
                      {currentLevelTitle}
                    </span>
                    {isComplete && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {t('progress.completed')}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    {t('dashboard.lessonsCompleted', { count: completedCount })}
                    {p.xp ? ` • ${p.xp} XP earned` : ''}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${gradients[idx % gradients.length]} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0">{pct}%</span>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  to={`/learning/${trackId}`}
                  className={`shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                    isComplete
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                  }`}
                >
                  {isComplete ? t('progress.review') : t('progress.continue')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProgressPage;
