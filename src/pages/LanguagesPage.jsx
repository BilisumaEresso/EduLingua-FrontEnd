import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Search, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { getAllLanguages } from '../services/language';

// Flag emoji helper using country code (common languages only)
const flagMap = {
  english: '🇬🇧',
  french: '🇫🇷',
  spanish: '🇪🇸',
  german: '🇩🇪',
  arabic: '🇸🇦',
  mandarin: '🇨🇳',
  chinese: '🇨🇳',
  japanese: '🇯🇵',
  korean: '🇰🇷',
  portuguese: '🇵🇹',
  italian: '🇮🇹',
  russian: '🇷🇺',
  turkish: '🇹🇷',
  hindi: '🇮🇳',
  dutch: '🇳🇱',
  greek: '🇬🇷',
  polish: '🇵🇱',
  swedish: '🇸🇪',
  norwegian: '🇳🇴',
  danish: '🇩🇰',
  hebrew: '🇮🇱',
  persian: '🇮🇷',
  farsi: '🇮🇷',
};

const getFlag = (name = '') => flagMap[name.toLowerCase()] || '🌐';

const bgColors = [
  'from-indigo-500 to-purple-600',
  'from-fuchsia-500 to-pink-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-rose-500 to-red-600',
];

const LanguagesPage = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAllLanguages();
        const langs = res?.data?.langs || res?.data || [];
        setLanguages(langs);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = languages.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-100 dark:bg-fuchsia-900/20 rounded-full blur-3xl opacity-50 translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6">
              <Globe className="h-4 w-4" />
              Available Languages
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
              Which language will you{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">
                master next?
              </span>
            </h1>
            <p className="max-w-xl mx-auto text-lg text-slate-600 dark:text-slate-400 mb-10">
              Choose from our growing library of languages. Each one comes with structured tracks, AI tutor support, and interactive lessons.
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search languages..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Languages Grid */}
      <section className="pb-24 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {loading && (
            <div className="flex flex-col items-center py-24 gap-4 text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              <p>Loading languages...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-24">
              <p className="text-slate-500 dark:text-slate-400 text-lg">Could not load languages. Please try again later.</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-24">
              <p className="text-slate-500 dark:text-slate-400 text-lg">No languages found for "<strong>{search}</strong>"</p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((lang, idx) => (
                <motion.div
                  key={lang._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (idx % 6) * 0.05 }}
                >
                  <Link
                    to={`/tracks?lang=${lang._id}`}
                    className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Card Header */}
                    <div className={`h-28 bg-gradient-to-br ${bgColors[idx % bgColors.length]} relative overflow-hidden flex items-center justify-center`}>
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-6xl drop-shadow-lg">{getFlag(lang.name)}</span>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{lang.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <BookOpen className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {lang.learningCount ?? 'Multiple'} tracks available
                          </span>
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-colors">
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Ready to start your journey?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Create your free account and get access to your first language track today.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-full font-bold text-base transition-colors shadow-md shadow-indigo-500/25"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LanguagesPage;
