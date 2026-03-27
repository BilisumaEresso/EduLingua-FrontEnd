import { useState } from 'react';
import { GraduationCap, CheckCircle, Send, BookOpen, Users, Star } from 'lucide-react';
import { applyForTeacher } from '../services/auth';
import useAuthStore from '../store/authStore';
import { Link } from 'react-router-dom';

const perks = [
  { icon: BookOpen, label: 'Create custom learning tracks' },
  { icon: Users, label: 'Teach and mentor students worldwide' },
  { icon: Star, label: 'Get a verified Teacher badge' },
];

const TeacherApplication = () => {
  const { user, checkAuth } = useAuthStore();
  const [motivation, setMotivation] = useState('');
  const [experience, setExperience] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const alreadyApplied = user?.teacherRequested;
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin' || user?.role === 'super-admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await applyForTeacher({ motivation, experience, subject });
      await checkAuth();
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isTeacher) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">You're already a Teacher! 🎓</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Your teacher access is active. Head to your dashboard to start creating content.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  if (alreadyApplied || success) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Application Submitted!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Your application is under review. Our team will evaluate your profile and get back to you within a few business days.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-10">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-600 to-fuchsia-600 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
        <div className="relative max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1.5 rounded-full text-sm font-semibold mb-4">
            <GraduationCap className="w-4 h-4" />
            Educator Program
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">
            Become an EduLingua Teacher
          </h1>
          <p className="text-indigo-100 text-lg">
            Share your expertise, create curriculum, and help thousands of learners master a new language.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Perks */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Teacher Perks</h2>
          <div className="space-y-4">
            {perks.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">⚡ Review Timeline</p>
            <p className="text-sm text-amber-600 dark:text-amber-500">
              Applications are typically reviewed within 3–5 business days. You'll receive an email notification.
            </p>
          </div>
        </div>

        {/* Right: Application Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Your Application</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Primary Subject / Language
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="e.g. Swahili, Amharic, Afan Oromo..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Teaching Experience
                </label>
                <textarea
                  required
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                  placeholder="Describe your teaching background, certifications, years of experience..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Why do you want to teach on EduLingua?
                </label>
                <textarea
                  required
                  value={motivation}
                  onChange={e => setMotivation(e.target.value)}
                  rows={4}
                  minLength={50}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                  placeholder="Tell us your motivation and what value you'd bring to our learners..."
                />
                <p className="mt-1 text-xs text-slate-400">Minimum 50 characters</p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-2xl font-bold text-sm transition-colors shadow-md shadow-indigo-500/20 disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherApplication;
