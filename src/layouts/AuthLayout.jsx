import { Outlet, Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-slate-950">
      {/* Left side Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8 hidden lg:flex">
            <Link to="/" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="h-8 w-8" />
              <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">EduLingua</span>
            </Link>
          </div>
          <Outlet />
        </div>
      </div>

      {/* Right side Image / Graphic */}
      <div className="relative hidden w-0 flex-1 lg:block relative z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-700"></div>
        {/* Decorative elements */}
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-white/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-indigo-500/20 blur-3xl rounded-full"></div>
        
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md text-white/90">
            <h2 className="text-4xl font-bold mb-6 tracking-tight">Master languages naturally with AI tutoring.</h2>
            <p className="text-lg text-white/80 leading-relaxed">
              Join thousands of learners unlocking their potential through personalized tracks, interactive lessons, and real-time chat practice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
