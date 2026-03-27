import { useState, useEffect } from 'react';
import { 
  Users, GraduationCap, BookOpen, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Loader2, ShieldCheck, 
  UserPlus, MessageSquare, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getDashboardStats } from '../../services/admin';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
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
      value: stats?.totalTracks || '0', 
      change: '0%', 
      isUp: true, 
      icon: BookOpen, 
      color: 'rose' 
    },
    { 
      label: 'Active Sessions', 
      value: stats?.activeSessions || '0', 
      change: '+18%', 
      isUp: true, 
      icon: TrendingUp, 
      color: 'emerald' 
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">System Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">High-level metrics and system health at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.change}
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Mock (Real data would come from another endpoint) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent System Activity</h3>
          <div className="space-y-6">
            {[
              { icon: UserPlus, text: 'New user "sarah_j" registered', time: '12 mins ago', color: 'blue' },
              { icon: ShieldCheck, text: 'Promoted "john_doe" to Teacher', time: '45 mins ago', color: 'purple' },
              { icon: Zap, text: 'Level "Intermediate French" updated', time: '2 hours ago', color: 'orange' },
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
