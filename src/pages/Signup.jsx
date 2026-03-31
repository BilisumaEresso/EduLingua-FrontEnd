import { BookOpen, Briefcase, Globe, Loader2, Lock, Mail, User, UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllLanguages } from '../services/language';
import useAuthStore from '../store/authStore';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [accountType, setAccountType] = useState('individual');
  const [languages, setLanguages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetchingLanguages, setFetchingLanguages] = useState(true);

  const { signup } = useAuthStore();
  const navigate = useNavigate();
useEffect(() => {
  if(useAuthStore.getState().user){
    navigate('/dashboard');
  }
}, []);
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const data = await getAllLanguages();
        console.log(data)
        if (data && data.data) {
          setLanguages(data.data.langs);
          if (data.data.length > 0) {
            setNativeLanguage(data.data[0]._id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch languages", error);
      } finally {
        setFetchingLanguages(false);
      }
    };
    fetchLanguages();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    await signup({ username, fullName, email, password, nativeLanguage, accountType });
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="w-full">
      <div className="lg:hidden mb-8 flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400">
        <BookOpen className="h-8 w-8" />
        <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">EduLingua</span>
      </div>
      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center lg:text-left">
        Create an account
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 text-center lg:text-left">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
          Sign in
        </Link>
      </p>

      <div className="mt-8">
        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
              Username
            </label>
            <div className="relative mt-2 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <UserCircle className="h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-md border-0 py-2.5 pl-10 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="johndoe123"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
              Full name
            </label>
            <div className="relative mt-2 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="block w-full rounded-md border-0 py-2.5 pl-10 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
              Email address
            </label>
            <div className="relative mt-2 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-0 py-2.5 pl-10 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
              Native Language
            </label>
            <div className="relative mt-2 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Globe className="h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
              <select
                required
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value)}
                disabled={fetchingLanguages}
                className="block w-full rounded-md border-0 py-2.5 pl-10 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:opacity-50"
              >
                {fetchingLanguages ? (
                  <option value="">Loading languages...</option>
                ) : (
                  <>
                    <option value="" disabled>Select your language</option>
                    {languages.map((lang) => (
                      <option key={lang._id} value={lang._id}>
                        {lang.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
              Account Type
            </label>
            <div className="relative mt-2 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Briefcase className="h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
              <select
                required
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="block w-full rounded-md border-0 py-2.5 pl-10 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="student">Student</option>
                <option value="enterprise">Enterprise</option>
                <option value="individual">Individual</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
              Password
            </label>
            <div className="relative mt-2 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-2.5 pl-10 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
