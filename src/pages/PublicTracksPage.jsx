import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Search, Globe, Layers, Lock, ArrowRight, Loader2, ChevronRight } from 'lucide-react';
import { getAllLearnings } from '../services/learning';
import { getAllLanguages } from '../services/language';

const levelColors = {
  beginner: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  intermediate: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  advanced: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

const gradients = [
  'from-indigo-500 to-purple-600',
  'from-fuchsia-500 to-pink-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-rose-500 to-red-600',
];

const PublicTracksPage = () => {
  const [searchParams] = useSearchParams();
  const langFilter = searchParams.get('lang');

  const [tracks, setTracks] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedLang, setSelectedLang] = useState(langFilter || '');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tracksRes, langsRes] = await Promise.all([
          getAllLearnings(),
          getAllLanguages(),
        ]);
        setTracks(tracksRes?.data?.learnings || tracksRes?.data || []);
        setLanguages(langsRes?.data?.langs || langsRes?.data || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filtered = tracks.filter(track => {
    const matchesSearch = track.title?.toLowerCase().includes(search.toLowerCase()) ||
      track.description?.toLowerCase().includes(search.toLowerCase());
    const matchesLang = !selectedLang || track.language?._id === selectedLang || track.language === selectedLang;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-slate-50 dark:bg-slate-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-60 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-fuchsia-100 dark:bg-fuchsia-900/10 rounded-full blur-3xl opacity-60 -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6">
              <Layers className="h-4 w-4" />
              Learning Tracks
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
              Structured paths to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">fluency</span>
            </h1>
            <p className="max-w-xl mx-auto text-lg text-slate-600 dark:text-slate-400 mb-4">
              Browse our library of expert-curated learning tracks. Each track contains structured levels, interactive lessons, and AI-powered quizzes.
            </p>

            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-1 text-sm text-slate-500 mb-10">
              <Link to="/languages" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Languages</Link>
              <ChevronRight className="w-4 h-4" />
              <span>All Tracks</span>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search tracks..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm"
                />
              </div>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  value={selectedLang}
                  onChange={e => setSelectedLang(e.target.value)}
                  className="pl-9 pr-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm appearance-none min-w-[160px]"
                >
                  <option value="">All Languages</option>
                  {languages.map(l => (
                    <option key={l._id} value={l._id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tracks Grid */}
      <section className="flex-1 pb-24 pt-8 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {loading && (
            <div className="flex flex-col items-center py-24 gap-4 text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              <p>Loading tracks...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-24">
              <p className="text-slate-500 dark:text-slate-400 text-lg">Could not load tracks. Please try again later.</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-24">
              <Layers className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No tracks found</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Try adjusting your search or filter.</p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Showing <strong className="text-slate-700 dark:text-slate-300">{filtered.length}</strong> track{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((track, idx) => {
                  const level = track.level?.toLowerCase() || 'beginner';
                  return (
                    <motion.div
                      key={track._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: (idx % 6) * 0.05 }}
                    >
                      <Link
                        to="/signup"
                        className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
                      >
                        {/* Card header gradient */}
                        <div className={`h-2 w-full bg-gradient-to-r ${gradients[idx % gradients.length]}`} />

                        <div className="p-6 flex flex-col gap-4 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center shrink-0 shadow-md`}>
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelColors[level] || levelColors.beginner}`}>
                              {track.level || 'Beginner'}
                            </span>
                          </div>

                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug mb-1">
                              {track.title}
                            </h3>
                            {track.language?.name && (
                              <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-2">
                                <Globe className="w-3.5 h-3.5" />
                                {track.language.name}
                              </div>
                            )}
                            {track.description && (
                              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                {track.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-1.5 text-sm text-slate-500">
                              <Layers className="w-4 h-4" />
                              <span>{track.levelsCount ?? track.sections?.length ?? '—'} levels</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              <Lock className="w-3.5 h-3.5" />
                              Sign in to enroll
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
          <h2 className="text-3xl font-extrabold mb-4 tracking-tight">
            Start your first track for free
          </h2>
          <p className="text-indigo-100 mb-8 text-lg">
            Create an account to enroll in any track and begin your language learning journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 px-8 py-3.5 rounded-full font-bold text-base hover:bg-indigo-50 transition-colors"
            >
              Create Free Account <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-3.5 rounded-full font-bold text-base transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicTracksPage;
