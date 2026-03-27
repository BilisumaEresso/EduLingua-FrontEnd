import { useState, useEffect } from 'react';
import {
  Users, GraduationCap, BookOpen, TrendingUp,
  ArrowUpRight, ArrowDownRight, Loader2, ShieldCheck,
  UserPlus, MessageSquare, Zap, Globe, Sparkles, AlertCircle, Power
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getDashboardStats } from '../../services/admin';
import useAuthStore from '../../store/authStore';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
 const {user}=useAuthStore()
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        console.log(res)
        setStats(res?.data?.stats || res?.data || null);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
            <motion.div
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
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</h3>
                {stat.sub && <span className="text-xs font-medium text-slate-400">{stat.sub}</span>}
              </div>
            </motion.div>
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
              <div className="h-48 flex items-end gap-2 px-2">
                {stats?.userGrowth?.map((day, i) => {
                  const max = Math.max(...stats.userGrowth.map(d => d.count), 1);
                  const height = (day.count / max) * 100;
                  return (
                    <div key={day._id} className="flex-1 flex flex-col items-center gap-2 group relative">
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {day.count}
                       </div>
                       <div
                        className="w-full bg-indigo-500/20 group-hover:bg-indigo-500/40 rounded-t-lg transition-all"
                        style={{ height: `${height}%`, minHeight: '4px' }}
                       />
                       <span className="text-[10px] font-bold text-slate-400 rotate-45 mt-2 origin-left truncate max-w-[40px] whitespace-nowrap">
                        {day._id.split('-').slice(1).join('/')}
                       </span>
                    </div>
                  );
                })}
                {(!stats?.userGrowth || stats.userGrowth.length === 0) && (
                   <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm italic">No data available for chart</div>
                )}
              </div>
            </section>

            {/* Popular Languages */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Popular Languages
              </h3>
              <div className="space-y-4">
                {stats?.popularLanguages?.map((lang, i) => (
                  <div key={lang.name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-500">
                      #{i+1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm font-bold mb-1">
                        <span>{lang.name}</span>
                        <span className="text-indigo-600">{lang.count} learners</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${(lang.count / stats.popularLanguages[0].count) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {(!stats?.popularLanguages || stats.popularLanguages.length === 0) && (
                   <div className="text-center py-8 text-slate-400 italic">No enrollment data yet</div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Charts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent System Activity</h3>
          <div className="space-y-6">
            {[
              { icon: UserPlus, text: 'New user "sarah_j" registered', time: '12 mins ago', color: 'blue' },
              { icon: ShieldCheck, text: 'Promoted "john_doe" to Teacher', time: '45 mins ago', color: 'purple' },
              { icon: Zap, text: 'Level "Intermediate Swahili" updated', time: '2 hours ago', color: 'orange' },
              { icon: MessageSquare, text: 'AI context cache cleared', time: '5 hours ago', color: 'rose' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className={`w-10 h-10 rounded-full bg-${activity.color}-50 dark:bg-${activity.color}-900/20 text-${activity.color}-500 flex items-center justify-center shrink-0`}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{activity.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
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
                      onClick={() => alert("System Lockdown initiated...")}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-50 text-rose-600 font-bold text-sm hover:bg-rose-100 transition-all border border-rose-100"
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
                    {stats.topTeachers.map((teacher, i) => (
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
