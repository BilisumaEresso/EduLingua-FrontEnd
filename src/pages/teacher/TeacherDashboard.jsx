import { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Plus,
  Play,
  Settings
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getTeacherStats } from '../../services/teacher';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getTeacherStats();
        setStats(res.data.stats);
      } catch (err) {
        console.error('Failed to fetch teacher stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('teacher.noTrack')}</h2>
        <p className="text-slate-500 mt-2">{t('teacher.contactAdmin')}</p>
      </div>
    );
  }

  const statCards = [
    { label: t('teacher.totalStudents'), value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('teacher.activeLessons'), value: stats.totalLessons, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: t('teacher.quizzesCreated'), value: stats.totalQuizzes, icon: GraduationCap, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
    { label: t('teacher.avgCompletion'), value: '78%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('teacher.dashboard')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t('teacher.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/teacher/edit-track"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            <Settings className="w-4 h-4" />
            {t('teacher.manageTrack')}
          </Link>
          <Link
            to="/teacher/create-lesson"
            className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-2.5 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('teacher.newLesson')}
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Student Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">{t('teacher.recentActivity')}</h2>
            <Link to="/teacher/students" className="text-sm text-indigo-600 font-semibold hover:underline">{t('teacher.viewAll')}</Link>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                      {activity.user.fullName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{activity.user.fullName}</p>
                      <p className="text-xs text-slate-500">{activity.user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{activity.progressPercentage}% {t('dashboard.complete')}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3" />
                      {new Date(activity.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-slate-500">{t('teacher.noActivity')}</div>
            )}
          </div>
        </div>

        {/* AI Assistant Quick Actions */}
        <div className="bg-gradient-to-br from-indigo-600 to-fuchsia-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 flex flex-col">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
            <Plus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('teacher.aiAssistant')}</h2>
          <p className="text-indigo-100 text-sm mb-8 leading-relaxed">
            {t('teacher.aiAssistantDesc')}
          </p>
          
          <div className="mt-auto space-y-3">
            <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-between px-4">
              {t('teacher.genQuiz')}
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="w-full bg-white text-indigo-600 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-between px-4 shadow-lg shadow-white/10">
              {t('teacher.newAiSection')}
              <Play className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
