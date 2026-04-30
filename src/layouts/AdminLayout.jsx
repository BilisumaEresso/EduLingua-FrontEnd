import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import LanguageDropdown from "../components/LanguageDropdown";
import useAuthStore from "../store/authStore";

const AdminLayout = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: t("nav.overview"), path: "/admin", icon: LayoutDashboard, exact: true },
    { name: t("nav.users"), path: "/admin/users", icon: Users },
    { name: t("nav.teachers"), path: "/admin/teachers", icon: GraduationCap },
    { name: t("nav.content"), path: "/admin/content", icon: BookOpen },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-200 dark:border-slate-800">
        <img className="h-12 w-auto" src="/logo.png" alt="EduLingua Logo" />
        <div>
          <span className="font-extrabold text-slate-900 dark:text-white text-sm">
            EduLingua
          </span>
          <span className="ml-1.5 text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded-full">
            ADMIN
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {navItems.map(({ name, path, icon: Icon, exact }) => (
          <NavLink
            key={path}
            to={path}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              }`
            }
            onClick={() => setMobileOpen(false)}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {name}
          </NavLink>
        ))}

        {/* Back to app */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            {t("nav.backToApp")}
          </Link>
        </div>
      </nav>

      {/* Language Switcher */}
      <div className="px-4 pb-3">
        <LanguageDropdown />
      </div>

      {/* User footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-1">
          <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center shrink-0 text-xs font-bold">
            {user?.fullName?.[0] || user?.username?.[0] || "A"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {user?.fullName || user?.username}
            </p>
            <p className="text-xs text-rose-500 font-medium capitalize">
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t("general.signOut")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="w-60 hidden lg:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 fixed inset-y-0">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-60 h-full bg-white dark:bg-slate-900 flex flex-col shadow-2xl">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-60">
        {/* Mobile topbar */}
        <header className="lg:hidden h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-rose-500" />
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {t("nav.adminPanel")}
              </span>
            </div>
          </div>
          <LanguageDropdown />
        </header>

        <main className="flex-1 p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
