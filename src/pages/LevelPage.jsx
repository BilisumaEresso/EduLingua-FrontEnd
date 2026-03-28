import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Lock, CheckCircle, ChevronLeft, Flag, Loader2, BookOpen, Star } from 'lucide-react';
import { getLearningById } from '../services/learning';
import { getAllLevels } from '../services/level';

const LevelPage = () => {
  const { id } = useParams(); // learningId
  const [track, setTrack] = useState(null);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trackRes, levelsRes] = await Promise.all([
          getLearningById(id),
          getAllLevels({ learningId: id }),
        ]);
        setTrack(trackRes?.data?.learning || trackRes?.data || null);
        const rawLevels = levelsRes?.data?.levels || levelsRes?.data || [];
        setLevels(rawLevels);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span>Loading track...</span>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500">Track not found.</p>
        <Link to="/tracks" className="mt-4 inline-block text-indigo-600 font-medium hover:underline">← Back to Tracks</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/tracks" className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{track.title}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
            {track.targetLanguage?.name && (
              <span className="flex items-center gap-1">
                {track.targetLanguage?.metadata?.flag && <span>{track.targetLanguage.metadata.flag}</span>}
                <BookOpen className="w-4 h-4" /> {track.targetLanguage.name}
              </span>
            )}
            <span>{levels.length} levels</span>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {levels.length === 0 && (
        <div className="text-center py-24">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No levels found for this track yet.</p>
        </div>
      )}

      {/* Duolingo-style path */}
      {levels.length > 0 && (
        <div className="relative pt-8 pb-16">
          {/* Path line */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 border-l-4 border-dashed border-slate-200 dark:border-slate-700 z-0" />

          <div className="space-y-16 relative z-10">
            {levels.map((level, idx) => {
              const isCompleted = level.isCompleted ?? false;
              const isLocked = level.isLocked ?? (idx > 0 && !levels[idx - 1]?.isCompleted && !levels[idx - 1]?.isLocked === false);
              const isCurrent = !isCompleted && !isLocked;
              const alignRight = idx % 2 === 0;

              let nodeClass = 'w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer ';
              if (isCompleted) {
                nodeClass += 'bg-emerald-500 border-white dark:border-slate-900 text-white';
              } else if (isCurrent) {
                nodeClass += 'bg-indigo-600 border-white dark:border-slate-900 text-white ring-4 ring-indigo-500/30';
              } else {
                nodeClass += 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 cursor-not-allowed';
              }

              const nodeIcon = isCompleted
                ? <CheckCircle className="w-8 h-8" />
                : isLocked
                ? <Lock className="w-8 h-8" />
                : <Star className="w-8 h-8" />;

              const linkTarget = isLocked ? '#' : `/lesson/${level._id}`;

              return (
                <div key={level._id} className={`flex items-center w-full ${alignRight ? 'justify-end' : 'justify-start'}`}>
                  <div className={`w-1/2 flex items-center ${alignRight ? 'justify-start pl-8 sm:pl-16' : 'justify-end pr-8 sm:pr-16 relative'}`}>

                    {/* Node */}
                    {alignRight ? (
                      <div className="absolute left-0 -translate-x-1/2 flex justify-center">
                        <Link to={linkTarget} className={nodeClass} onClick={e => isLocked && e.preventDefault()}>
                          {nodeIcon}
                        </Link>
                      </div>
                    ) : (
                      <div className="absolute right-0 translate-x-1/2 flex justify-center">
                        <Link to={linkTarget} className={nodeClass} onClick={e => isLocked && e.preventDefault()}>
                          {nodeIcon}
                        </Link>
                      </div>
                    )}

                    {/* Card */}
                    <div className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-6 w-full max-w-sm ${
                      isCurrent ? 'border-indigo-200 dark:border-indigo-800/50 shadow-md shadow-indigo-500/5' : 'border-slate-200 dark:border-slate-800'
                    } ${isLocked ? 'opacity-50' : ''}`}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Level {level.levelNumber || level.order || idx + 1}</span>
                        {level.difficulty && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            level.difficulty === 'master' ? 'bg-amber-100 text-amber-700' :
                            level.difficulty === 'advanced' ? 'bg-rose-100 text-rose-700' :
                            level.difficulty === 'intermediate' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {level.difficulty}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">{level.title}</h3>
                      {level.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{level.description}</p>
                      )}
                      {isLocked ? (
                        <div className="flex items-center gap-2 py-2 text-sm text-slate-400 font-medium whitespace-nowrap">
                          <Lock className="w-4 h-4" /> 
                          <span>{level.unlockCondition?.minScore || 70}% on prev level to unlock</span>
                        </div>
                      ) : (
                        <Link
                          to={`/lesson/${level._id}`}
                          className={`block w-full text-center py-2 rounded-xl font-bold text-sm transition-colors ${
                            isCompleted
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                          }`}
                        >
                          {isCompleted ? 'Review Level' : 'Start Level'}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* End Flag */}
            <div className="flex justify-center mt-8 relative z-10">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                <Flag className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelPage;
