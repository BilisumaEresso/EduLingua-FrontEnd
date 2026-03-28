import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Layers, ArrowRight, Loader2, Trophy, Target } from 'lucide-react';
import userProgressService from '../services/userProgress';

const gradients = [
  'from-indigo-500 to-purple-600',
  'from-fuchsia-500 to-pink-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-rose-500 to-red-600',
];

const ProgressPage = () => {
  const [progressList, setProgressList] = useState([]);
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
  }, []);

  const totalXP = progressList.reduce((acc, p) => acc + (p.xp ?? 0), 0);
  const totalLessons = progressList.reduce((acc, p) => acc + (p.completedLessons?.length ?? 0), 0);
  const completed = progressList.filter(p => (p.progress ?? 0) >= 100).length;
  const inProgress = progressList.filter(p => (p.progress ?? 0) < 100).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Progress</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track your learning journey across all enrolled tracks.</p>
      </div>

      {/* Summary Stats */}
      {!loading && progressList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total XP', value: totalXP, icon: Trophy, color: 'indigo' },
            { label: 'Lessons Done', value: totalLessons, icon: CheckCircle2, color: 'emerald' },
            { label: 'Tracks Active', value: inProgress, icon: Layers, color: 'fuchsia' },
            { label: 'Tracks Finished', value: completed, icon: Target, color: 'orange' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-500 flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
              <div className="text-sm font-medium text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Progress List */}
      {loading && (
        <div className="flex items-center justify-center py-24 gap-3 text-slate-500">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
          <span>Loading your progress...</span>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-24">
          <p className="text-slate-500 dark:text-slate-400">Could not load progress. Please try again.</p>
        </div>
      )}

      {!loading && !error && progressList.length === 0 && (
        <div className="text-center py-24 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
          <BookOpen className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">No progress yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Enroll in a learning track to start your journey.</p>
          <Link
            to="/tracks"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-full font-bold transition-colors"
          >
            Browse Tracks <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {!loading && !error && progressList.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Enrolled Tracks</h2>
          {progressList.map((p, idx) => {
            const trackId = p.learning?._id || p.learning;
            const title = p.learning?.title || p.title || 'Learning Track';
            const targetLang = p.learning?.targetLanguage;
            const langName = targetLang?.name || '';
            const flag = targetLang?.metadata?.flag || '';
            
            // Calculate progress percentage dynamically
            const completedCount = p.completedLessons?.length ?? 0;
            const totalLessonsInTrack = p.learning?.levels?.reduce((sum, level) => sum + (level.lessons?.length || 0), 0) || 1;
            const pct = Math.min(100, Math.round((completedCount / totalLessonsInTrack) * 100));
            
            const isComplete = pct >= 100;

            return (
              <div
                key={p._id || idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-6"
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
                    {isComplete && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    {completedCount} lesson{completedCount !== 1 ? 's' : ''} completed
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
                  {isComplete ? 'Review' : 'Continue'}
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
