import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, Compass, MessageSquare, LogOut, Swords, User, Settings, Crown, GraduationCap, BarChart2, Shield } from 'lucide-react';
import useAuthStore from '../store/authStore';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Learning Tracks', path: '/tracks', icon: Compass },
    { name: 'My Progress', path: '/progress', icon: BarChart2 },
    { name: 'AI Tutor Chat', path: '/chat', icon: MessageSquare },
  ];

  const bottomNavItems = [
    { name: 'Account Settings', path: '/settings', icon: Settings },
    ...((user?.role === 'admin' || user?.role === 'super-admin') ? [{ name: 'System Admin', path: '/admin', icon: Shield }] : []),
    ...(!user?.isPremium ? [{ name: 'Go Premium', path: '/premium', icon: Crown, highlight: true }] : []),
    ...(user?.role === 'learner' && !user?.teacherRequested ? [{ name: 'Become a Teacher', path: '/become-teacher', icon: GraduationCap }] : []),
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 flex-col hidden lg:flex border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="h-6 w-6" />
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">EduLingua</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
          
          <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <Link 
              to="/game"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-fuchsia-600 dark:text-fuchsia-400 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-500/10 transition-all duration-200"
            >
              <Swords className="h-5 w-5" />
              Play Mini-Game
            </Link>
            {bottomNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    item.highlight
                      ? 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-500/10'
                      : isActive
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.name}
                {item.highlight && <span className="ml-auto text-xs bg-yellow-400 text-yellow-900 font-bold px-1.5 py-0.5 rounded-full">NEW</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Link to="/settings" className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
            <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user?.fullName || user?.name || 'Student'}
              </span>
              <span className="text-xs text-slate-400 truncate">@{user?.username || 'user'}</span>
            </div>
            <Settings className="h-4 w-4 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur z-20">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="h-6 w-6" />
          </Link>
          <div className="flex items-center gap-2">
            {(user?.role === 'admin' || user?.role === 'super-admin') && (
              <Link to="/admin" className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg">
                <Shield className="h-5 w-5" />
              </Link>
            )}
            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
