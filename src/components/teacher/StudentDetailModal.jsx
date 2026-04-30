import React from 'react';
import Modal from '../Modal';
import { 
  User, Mail, Calendar, BarChart2, CheckCircle2, 
  XCircle, Clock, Award, BookOpen, Target, 
  Zap, BrainCircuit, Activity
} from 'lucide-react';

const StudentDetailModal = ({ isOpen, onClose, studentData }) => {
  if (!studentData) return null;

  const { user, levelsProgress = [], completedLessons = [], xp = 0, lastActivityDate, overallLevel } = studentData;

  const stats = [
    { label: 'Total XP', value: xp, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Levels', value: `${overallLevel}/5`, icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Lessons', value: completedLessons.length, icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Avg. Score', value: `${calculateAvgScore(levelsProgress)}%`, icon: Award, color: 'text-fuchsia-500', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20' },
  ];

  function calculateAvgScore(levels) {
    if (!levels || levels.length === 0) return 0;
    const scores = levels.filter(l => l.bestQuizScore !== undefined).map(l => l.bestQuizScore);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Performance Profile"
      size="lg"
    >
      <div className="space-y-8 pb-4">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-slate-800">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-500/20">
            {user?.fullName?.[0] || user?.username?.[0]}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{user?.fullName}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1.5 mt-1">
              <Mail className="w-4 h-4" /> {user?.email}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
              <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-sm">
                <Activity className="w-3 h-3 text-emerald-500" /> Active Learner
              </span>
              <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-sm">
                <Clock className="w-3 h-3 text-indigo-500" /> Joined {new Date(studentData.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{stat.label}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Detailed Progress */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <BrainCircuit className="w-5 h-5 text-indigo-500" />
            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">Curriculum Breakdown</h4>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {levelsProgress.length > 0 ? (
              levelsProgress.sort((a,b) => (a.levelId?.levelNumber || 0) - (b.levelId?.levelNumber || 0)).map((lp, idx) => (
                <div key={idx} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${
                      lp.status === 'passed' ? 'bg-emerald-50 text-emerald-600' : 
                      lp.status === 'failed' ? 'bg-rose-50 text-rose-600' :
                      lp.status === 'active' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'
                    }`}>
                      {lp.levelId?.levelNumber || idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{lp.levelId?.title || `Level ${idx + 1}`}</p>
                      <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                        Status: <span className={
                          lp.status === 'passed' ? 'text-emerald-500' : 
                          lp.status === 'active' ? 'text-indigo-500' : 'text-slate-400'
                        }>{lp.status}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${lp.bestQuizScore >= 70 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                      {lp.bestQuizScore || 0}%
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Best Quiz Score</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 italic text-sm">
                No level progress data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Activity Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400 px-2">
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Last active {new Date(lastActivityDate).toLocaleDateString()}</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {completedLessons.length} lessons finished</span>
        </div>
      </div>
    </Modal>
  );
};

export default StudentDetailModal;
