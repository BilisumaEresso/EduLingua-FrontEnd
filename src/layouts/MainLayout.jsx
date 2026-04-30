import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Gamepad2,
  LayoutDashboard,
  LogIn,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet } from "react-router-dom";
import LanguageDropdown from "../components/LanguageDropdown";
import useAuthStore from "../store/authStore";

const MainLayout = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: t("nav.features"), path: "/#features" },
    { name: t("nav.languages"), path: "/languages" },
    { name: t("nav.tracks"), path: "/explore" },
  ];
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400"
            >
              <img
                className="h-12 w-auto"
                src="/logo.png"
                alt="EduLingua Logo"
              />
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                EduLingua
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600 dark:text-slate-300">
              <Link
                to="/#features"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {t("nav.features")}
              </Link>
              <Link
                to="/languages"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {t("nav.languages")}
              </Link>
              <Link
                to="/explore"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {t("nav.tracks")}
              </Link>
              <Link
                to="/game"
                className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Gamepad2 className="h-4 w-4" />
                {t("nav.mosaicGame")}
              </Link>
            </nav>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Language Switcher */}
              <div className="hidden md:flex">
                <LanguageDropdown />
              </div>

              <Link
                to={user ? "/dashboard" : "/login"}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {user ? (
                  <>
                    <LayoutDashboard className="h-4 w-4 sm:hidden" />
                    <span className="hidden sm:inline">{t("nav.dashboard")}</span>
                    <span className="sm:hidden">{t("nav.dash")}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 sm:hidden" />
                    <span>{t("nav.login")}</span>
                  </>
                )}
              </Link>
              {!user && (
                <Link
                  to="/signup"
                  className="hidden xs:inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-all active:scale-95"
                >
                  {t("nav.getStarted")}
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
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
                  {t("nav.mosaicGame")}
                </Link>
                {!user && (
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="mt-2 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-base font-medium text-white shadow-lg hover:bg-indigo-700 transition-all active:scale-95 text-center"
                  >
                    {t("nav.getStarted")}
                  </Link>
                )}
                {/* Language Switcher in mobile menu */}
                <div className="px-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <LanguageDropdown />
                </div>
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
            <span className="font-medium text-slate-900 dark:text-slate-100">
              EduLingua
            </span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
            <Link
              to="/privacy"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              to="/terms"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
