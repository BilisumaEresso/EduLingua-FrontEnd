import { useState } from 'react';
import { Check, Zap, MessageSquare, BookOpen, Star, Lock, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { upgradeToPremium } from '../services/auth';

const freeFeatures = [
  '5 AI chat messages per day',
  'Access to free learning tracks',
  'Basic progress tracking',
  'Translation mini-game',
];

const premiumFeatures = [
  'Unlimited AI Tutor conversations',
  'All premium learning tracks',
  'Advanced analytics & insights',
  'Priority support',
  'Offline content access',
  'Early access to new features',
];

const PremiumUpgrade = () => {
  const { user, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      await upgradeToPremium();
      await checkAuth();
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.isPremium || success) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Crown className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">You're Premium! 🎉</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Enjoy unlimited access to all features of EduLingua. The world's languages are yours to explore.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold transition-colors"
        >
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 border border-yellow-200 dark:border-yellow-800">
          <Sparkles className="w-4 h-4" />
          Upgrade to Premium
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Learn without limits
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Get unlimited AI tutor access, all learning tracks, and powerful tools to accelerate your language journey.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Free</p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
              <span className="text-slate-400 mb-1">/month</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Get started with the basics.</p>
          </div>
          <ul className="space-y-3 mb-8">
            {freeFeatures.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <Check className="w-4 h-4 text-slate-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <div className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-semibold text-center">
            Your current plan
          </div>
        </div>

        {/* Premium Card */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-500/30 overflow-hidden">
          {/* Decorative blob */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

          <div className="relative mb-6">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-semibold text-indigo-200 uppercase tracking-wider">Premium</p>
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">BEST VALUE</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-extrabold">$9.99</span>
              <span className="text-indigo-200 mb-1">/month</span>
            </div>
            <p className="text-sm text-indigo-200 mt-2">Everything you need to master a language.</p>
          </div>

          <ul className="space-y-3 mb-8 relative">
            {premiumFeatures.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-indigo-50">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                {f}
              </li>
            ))}
          </ul>

          {error && (
            <p className="text-sm text-red-200 bg-red-900/30 rounded-xl px-4 py-2 mb-4">{error}</p>
          )}

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="relative w-full py-3.5 rounded-2xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {loading ? 'Processing...' : 'Upgrade Now'}
          </button>
          <p className="text-center text-xs text-indigo-200 mt-3">Cancel anytime. No hidden fees.</p>
        </div>
      </div>

      {/* Feature Highlights */}
      <div>
        <h2 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-8">Why go Premium?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: MessageSquare, color: 'indigo', title: 'Unlimited AI Tutor', desc: 'Chat with your AI language tutor as much as you want, anytime.' },
            { icon: BookOpen, color: 'fuchsia', title: 'All Tracks Unlocked', desc: 'Access every learning track across all languages without restrictions.' },
            { icon: Star, color: 'yellow', title: 'Advanced Progress', desc: 'Deep analytics to understand your strengths and where to focus.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <div className={`w-10 h-10 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-500 flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Teacher CTA */}
      <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-white">Are you an educator?</h3>
          <p className="text-slate-400 text-sm mt-1">Apply to become a teacher and get special access to create curriculum and teach students.</p>
        </div>
        <Link
          to="/become-teacher"
          className="shrink-0 inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          Apply Now <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default PremiumUpgrade;
