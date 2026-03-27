import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Compass, BookOpen, Globe, Search, ArrowRight, Lock, CheckCircle, Loader2, PlayCircle, Plus } from 'lucide-react';
import { getAllLearnings } from '../services/learning';
import { getAllLanguages } from '../services/language';
import userProgressService from '../services/userProgress';

const gradients = [
  'from-indigo-500 to-purple-600',
  'from-fuchsia-500 to-pink-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-rose-500 to-red-600',
];

const levelBadge = {
  beginner: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  intermediate: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  advanced: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

const LearningTracks = () => {
  const [searchParams] = useSearchParams();
  const [tracks, setTracks] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [myProgress, setMyProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedLang, setSelectedLang] = useState(searchParams.get('lang') || '');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tracksRes, langsRes, progressRes] = await Promise.allSettled([
          getAllLearnings(),
          getAllLanguages(),
          userProgressService.getProgress(),
        ]);
        setTracks(tracksRes.value?.data?.learnings || tracksRes.value?.data || []);
        setLanguages(langsRes.value?.data?.langs || langsRes.value?.data || []);
        setMyProgress(progressRes.value?.data?.progress || progressRes.value?.progress || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const enrolledIds = myProgress.map(p => p.learning?._id || p.learning || p._id);

  const handleEnroll = async (trackId) => {
    setEnrolling(trackId);
    try {
      await userProgressService.startLearningTrack({ learningId: trackId });
      const progressRes = await userProgressService.getProgress();
      setMyProgress(progressRes?.data?.progress || progressRes?.progress || []);
    } catch (e) {
      console.error(e);
    } finally {
      setEnrolling(null);
    }
  };

  const filtered = tracks.filter(t => {
    const matchesSearch = t.title?.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    const matchesLang = !selectedLang || t.language?._id === selectedLang || t.language === selectedLang;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Learning Tracks</h1>
          <p className="text-slate-500 dark:text-slate-400">Discover and enroll in language learning paths</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tracks..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={selectedLang}
            onChange={e => setSelectedLang(e.target.value)}
            className="pl-9 pr-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none min-w-[160px]"
          >
            <option value="">All Languages</option>
            {languages.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24 gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span>Loading tracks...</span>
        </div>
      )}

      {/* Tracks Grid */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-24">
          <Compass className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg font-medium">No tracks found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search or language filter.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((track, idx) => {
            const isEnrolled = enrolledIds.includes(track._id);
            const progressEntry = myProgress.find(p => (p.learning?._id || p.learning) === track._id);
            const progressPct = progressEntry?.progress ?? 0;
            const level = track.level?.toLowerCase() || 'beginner';

            return (
              <div
                key={track._id}
                className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
              >
                {/* Card Header */}
                <div className={`h-28 bg-gradient-to-br ${gradients[idx % gradients.length]} relative overflow-hidden flex items-end p-5`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative flex items-center justify-between w-full">
                    <span className="text-white/90 text-sm font-semibold">
                      {track.language?.name || 'Language'}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur`}>
                      {track.level || 'Beginner'}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {track.title}
                    </h3>
                    {track.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{track.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>{track.levelsCount ?? '—'} levels</span>
                    </div>
                    {isEnrolled && (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        <span>Enrolled</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                    {isEnrolled ? (
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                          <span>Progress</span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${gradients[idx % gradients.length]} rounded-full transition-all`} style={{ width: `${progressPct}%` }} />
                        </div>
                        <Link
                          to={`/learning/${track._id}`}
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
                        >
                          <PlayCircle className="w-4 h-4" />
                          Continue Learning
                        </Link>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEnroll(track._id)}
                        disabled={enrolling === track._id}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-60"
                      >
                        {enrolling === track._id ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Enrolling...</>
                        ) : (
                          <><Plus className="w-4 h-4" /> Enroll Now</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LearningTracks;
