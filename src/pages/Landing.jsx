import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Brain, Target, 
  ArrowRight, Sparkles, Zap, Shield, Globe
} from 'lucide-react';
import { getAllLanguages } from '../services/language';

const flagMap = {
  english: '🇬🇧', french: '🇫🇷', spanish: '🇪🇸', german: '🇩🇪',
  arabic: '🇸🇦', mandarin: '🇨🇳', chinese: '🇨🇳', japanese: '🇯🇵',
  korean: '🇰🇷', portuguese: '🇵🇹', italian: '🇮🇹', russian: '🇷🇺',
  turkish: '🇹🇷', hindi: '🇮🇳', dutch: '🇳🇱',
};
const getFlag = (name = '') => flagMap[name.toLowerCase()] || '🌐';
const gradients = [
  'from-indigo-500 to-purple-600', 'from-fuchsia-500 to-pink-600',
  'from-sky-500 to-blue-600', 'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600', 'from-rose-500 to-red-600',
];

const Landing = () => {
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    getAllLanguages()
      .then(res => setLanguages((res?.data?.langs || res?.data || []).slice(0, 6)))
      .catch(() => {});
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-50 dark:bg-indigo-900/20 blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-fuchsia-50 dark:bg-fuchsia-900/20 blur-3xl opacity-50"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Introducing EduLingua AI 2.0</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8">
              Learn Languages <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">Smarter with AI</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10">
              Master any language organically through immersive AI conversations, personalized learning paths, and intelligent feedback.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/game" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white dark:bg-slate-900 px-8 py-3.5 text-base font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950">
                Try Mini-Game
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Everything you need to reach fluency
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Our AI-powered platform adapts to your learning style, providing exactly what you need to progress faster.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Brain className="h-6 w-6 text-indigo-600" />,
                title: "AI-Powered Lessons",
                desc: "Dynamic curriculum that shapes itself around your strengths and weaknesses in real-time."
              },
              {
                icon: <Target className="h-6 w-6 text-fuchsia-600" />,
                title: "Personalized Paths",
                desc: "Follow structured tracks designed to take you from beginner to fluent naturally."
              },
              {
                icon: <MessageSquare className="h-6 w-6 text-teal-600" />,
                title: "Real-time Chat Tutor",
                desc: "Practice conversing with an AI companion that corrects your grammar and vocabulary instantly."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              How EduLingua Works
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-indigo-100 dark:bg-indigo-900/30 -translate-x-1/2"></div>
            
            <div className="space-y-16 relative">
              {[
                {
                  step: "01",
                  title: "Choose your languages",
                  desc: "Select your native language and the target language you want to master.",
                  icon: <Globe className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                },
                {
                  step: "02",
                  title: "Learn the fundamentals",
                  desc: "Progress through an AI-curated track of vocabulary, grammar, and pronunciation lessons.",
                  icon: <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                },
                {
                  step: "03",
                  title: "Practice in real-life scenarios",
                  desc: "Chat with your AI tutor in immersive role-play situations to build conversational confidence.",
                  icon: <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                }
              ].map((step, i) => (
                <div key={i} className={`flex flex-col md:flex-row gap-8 items-center ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                  <div className={`md:w-1/2 flex ${i % 2 !== 0 ? 'justify-start md:pl-12' : 'justify-end md:pr-12'}`}>
                    <div className="text-center md:text-left bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 max-w-sm w-full relative z-10 hover:-translate-y-1 transition-transform">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-2xl font-bold text-indigo-100 dark:text-indigo-900/50">{step.step}</span>
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                          {step.icon}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400">{step.desc}</p>
                    </div>
                  </div>
                  {/* Center Dot */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-white dark:bg-slate-950 rounded-full border-4 border-indigo-100 dark:border-slate-800 items-center justify-center z-10">
                    <div className="w-4 h-4 rounded-full bg-indigo-600"></div>
                  </div>
                  <div className="md:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white dark:bg-slate-900">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Loved by learners worldwide
            </h2>
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl overflow-hidden pb-10">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Sarah K.", role: "French Learner", text: "EduLingua completely changed how I learn languages. The AI chat feels like talking to a real native speaker!" },
                { name: "David M.", role: "Japanese Learner", text: "The personalized learning paths adapted directly to my weak spots. I've progressed faster in 3 months than I did in a year of conventional classes." },
                { name: "Elena R.", role: "Spanish Learner", text: "Finally an app that isn't just flashcards. The contextual learning and mini-games make everything stick." }
              ].map((t, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-100 dark:border-slate-800">
                  <div className="flex gap-1 text-amber-400 mb-4">
                    {[1,2,3,4,5].map(star => <span key={star}>★</span>)}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-6 italic">"{t.text}"</p>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{t.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </section>

      {/* Languages Showcase */}
      {languages.length > 0 && (
        <section className="py-24 bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Choose your language
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                We support a growing list of languages, each with structured tracks and AI-powered tutoring.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
              {languages.map((lang, idx) => (
                <motion.div
                  key={lang._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Link
                    to={`/languages`}
                    className={`group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${gradients[idx % gradients.length]} text-white hover:scale-105 transition-transform shadow-md`}
                  >
                    <span className="text-4xl">{getFlag(lang.name)}</span>
                    <span className="text-sm font-bold text-white/90">{lang.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center">
              <Link
                to="/languages"
                className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:gap-3 transition-all"
              >
                View all languages <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Ready to become fluent?</h2>
          <p className="text-indigo-100 text-lg mb-10">
            Join thousands of learners already using EduLingua to master new languages with the power of AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 px-8 py-4 rounded-full font-bold text-base hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Start for Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-full font-bold text-base transition-colors"
            >
              Explore Tracks
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
