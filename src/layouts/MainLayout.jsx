import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { BookOpen, Gamepad2, LogIn, Menu, X, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';

const MainLayout = () => {
  const { user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navLinks = [
    { name: 'Features', path: '/#features' },
    { name: 'Languages', path: '/languages' },
    { name: 'Tracks', path: '/explore' },
  ];
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">EduLingua</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600 dark:text-slate-300">
              <Link to="/#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</Link>
              <Link to="/languages" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Languages</Link>
              <Link to="/explore" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Tracks</Link>
              <Link to="/game" className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Gamepad2 className="h-4 w-4" />
                Mini-Game
              </Link>
            </nav>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link 
                to={user ? "/dashboard" : "/login"} 
                className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {user ? (
                  <>
                    <LayoutDashboard className="h-4 w-4 sm:hidden" />
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Dash</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 sm:hidden" />
                    <span>Log in</span>
                  </>
                )}
              </Link>
              {!user && (
                <Link to="/signup" className="hidden xs:inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-all active:scale-95">
                  Get Started
                </Link>
              )}
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden"
            >
              <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-2 py-1"
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="/game"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-lg font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-2 py-1"
                >
                  <Gamepad2 className="h-5 w-5" />
                  Mini-Game
                </Link>
                {!user && (
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="mt-2 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-base font-medium text-white shadow-lg hover:bg-indigo-700 transition-all active:scale-95 text-center"
                  >
                    Get Started
                  </Link>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <BookOpen className="h-5 w-5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">EduLingua</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
            <Link to="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
