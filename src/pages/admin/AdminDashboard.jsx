import { useState, useEffect, useRef } from 'react';
import {
  Users, GraduationCap, BookOpen, TrendingUp,
  ArrowUpRight, ArrowDownRight, Loader2, ShieldCheck,
  UserPlus, MessageSquare, Zap, Globe, Sparkles, AlertCircle, Power
} from 'lucide-react';
import { motion as Motion, animate, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { getDashboardStats } from '../../services/admin';
import api from '../../services/api';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const AnimatedCounter = ({ value, duration = 1.5 }) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      if (nodeRef.current) nodeRef.current.textContent = value;
      return;
    }
    const controls = animate(0, num, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => {
        if (nodeRef.current) nodeRef.current.textContent = Math.round(v).toString();
      }
    });
    return () => controls.stop();
  }, [value, duration]);

  return <span ref={nodeRef}>0</span>;
};

const getActivityStyling = (type) => {
  switch(type) {
    case 'auth': return { icon: UserPlus, color: 'blue' };
    case 'security': return { icon: ShieldCheck, color: 'purple' };
    case 'content': return { icon: Zap, color: 'orange' };
    case 'system': return { icon: MessageSquare, color: 'rose' };
    case 'quiz': return { icon: Sparkles, color: 'emerald' };
    case 'chat': return { icon: BookOpen, color: 'indigo' };
    default: return { icon: AlertCircle, color: 'slate' };
  }
};

const timeAgo = (dateStr) => {
  if (!dateStr) return 'just now';
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return `${Math.max(seconds, 1)} secs ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
 const {user}=useAuthStore()
  useEffect(() => {
    const fetchStats = async (isInitial = false) => {
      try {
        const res = await getDashboardStats();
        setStats(res?.data?.stats || res?.data || null);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    // Fast initial fetch
    fetchStats(true);

    // Live polling every 5 seconds (5000ms)
    const intervalId = setInterval(() => {
      fetchStats(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const handleLockdown = async () => {
    try {
      const res = await api.put('/admin/shut-system');
      toast.success(res.data?.message || 'Emergency Lockdown initiated');
    } catch (err) {
      toast.error('Failed to initiate lockdown');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || '0',
      change: '+12%',
      isUp: true,
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Teachers',
      value: stats?.totalTeachers || '0',
      change: '+3',
      isUp: true,
      icon: GraduationCap,
      color: 'purple'
    },
    {
      label: 'Learning Tracks',
      value: stats?.totalTracks || stats?.totalLessons || '0',
      change: '0%',
      isUp: true,
      icon: BookOpen,
      color: 'rose'
    },
    {
      label: 'AI Chat Sessions',
      value: stats?.totalChatSessions || stats?.activeSessions || '0',
      change: '+18%',
      isUp: true,
      icon: TrendingUp,
      color: 'emerald'
    },
    {
      label: 'Total Languages',
      value: stats?.totalLanguages || '0',
      sub: `${stats?.activeLanguages || 0} active`,
      icon: Globe,
      color: 'orange'
    },
    {
      label: 'Premium Users',
      value: stats?.totalPremium || '0',
      icon: Zap,
      color: 'yellow'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">System Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">High-level metrics and system health at a glance.</p>
      </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <Motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 flex items-center justify-center shadow-sm`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                {stat.change && (
                  <div className={`flex items-center gap-1 text-xs font-bold ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </div>
                )}
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  <AnimatedCounter value={stat.value} />
                </h3>
                {stat.sub && <span className="text-xs font-medium text-slate-400">{stat.sub}</span>}
              </div>
            </Motion.div>
          ))}
        </div>

        {/* Super Admin Insights */}
        {user?.role === 'super-admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Growth Chart */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  User Growth (7 Days)
                </h3>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  {stats?.userGrowth?.length ? (
                    <AreaChart
                      data={(stats.userGrowth || []).map((d) => ({
                        date: d._id,
                        count: d.count,
                      }))}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dy={8} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                      <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm italic">
                      No data available for chart
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
            </section>

            {/* Popular Languages */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Popular Languages
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  {stats?.popularLanguages?.length ? (
                    <BarChart
                      data={stats.popularLanguages}
                      layout="vertical"
                      margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12, fill: '#334155', fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="#a855f7" radius={[0, 10, 10, 0]} barSize={24} />
                    </BarChart>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm italic">
                      No enrollment data yet
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
            </section>

            {/* Quiz Insights */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm lg:col-span-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Quiz Attempts (7 Days)
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  {stats?.quizAttemptsLast7Days?.length ? (
                    <LineChart data={stats.quizAttemptsLast7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dy={8} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} />
                      <Line yAxisId="left" type="monotone" dataKey="attempts" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 7 }} />
                      <Line yAxisId="right" type="monotone" dataKey="passRate" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 7 }} />
                    </LineChart>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm italic">
                      No quiz attempt data
                    </div>
                  )}
                </ResponsiveContainer>
              </div>

              <div className="mt-4 text-sm text-slate-600 dark:text-slate-300 font-semibold">
                Retake Rate: {typeof stats?.retakeRate === "number" ? `${stats.retakeRate.toFixed(0)}%` : "—"}
              </div>
            </section>

            {/* Level Pass Rate */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm lg:col-span-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                Level Pass Rate (Top Levels)
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  {stats?.levelPassRate?.length ? (
                    <BarChart
                      data={stats.levelPassRate.map((r) => ({
                        name: `L${r.levelNumber}`,
                        title: r.title,
                        passRate: r.passRate,
                        attempts: r.attempts,
                      }))}
                      layout="vertical"
                      margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" width={50} tick={{ fontSize: 12, fill: '#334155', fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="passRate" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={24} />
                    </BarChart>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm italic">
                      No pass-rate data
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        )}

        {/* Charts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent System Activity</h3>
          <div className="space-y-6 overflow-hidden">
            <AnimatePresence initial={false}>
            {(stats?.activityLogs || []).map((log) => {
              const styleProps = getActivityStyling(log.type);
              const Icon = styleProps.icon;
              const color = styleProps.color;
              return (
              <Motion.div 
                key={log._id} 
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                className="flex gap-4 items-start"
              >
                <div className={`w-10 h-10 rounded-full bg-${color}-50 dark:bg-${color}-900/20 text-${color}-500 flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="pb-3">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{log.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{timeAgo(log.createdAt)}</p>
                </div>
              </Motion.div>
            )})}
            </AnimatePresence>
            {(!stats?.activityLogs || stats.activityLogs.length === 0) && (
              <div className="text-center text-slate-400 text-sm italic py-8">
                No system activity recorded yet.
              </div>
            )}
          </div>
        </div>

          {/* Quick Actions / System Status */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6">System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Backend API</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">AI Model</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Optimal
                  </span>
                </div>
                {user?.role === 'super-admin' && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                    <button
                      onClick={handleLockdown}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all border border-rose-100 dark:border-rose-900/30"
                    >
                      <Power className="w-4 h-4" />
                      Emergency Lockdown
                    </button>
                  </div>
                )}
              </div>
            </div>

            {user?.role === 'super-admin' && stats?.topTeachers && (
               <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-500" />
                    Top Teachers
                  </h3>
                  <div className="space-y-4">
                    {stats.topTeachers.map((teacher) => (
                      <div key={teacher.email} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-indigo-500">
                          {teacher.name?.[0] || 'T'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{teacher.name}</p>
                          <p className="text-xs text-slate-500 truncate">{teacher.lessonCount} lessons</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            )}
          </div>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">System Controls</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm">Bulk Invite</p>
                <p className="text-xs text-slate-500">Send mass emails</p>
              </div>
            </button>
            <button className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm">Security Audit</p>
                <p className="text-xs text-slate-500">View access logs</p>
              </div>
            </button>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
             <button className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity">
                Generate Monthly Report
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
