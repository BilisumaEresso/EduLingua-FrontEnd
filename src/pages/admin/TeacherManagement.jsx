import { useState, useEffect } from 'react';
import { 
  GraduationCap, Check, X, Search, Loader2, 
  ExternalLink, Mail, Calendar, AlertCircle, 
  CheckCircle2, XCircle, Info
} from 'lucide-react';
import { getAllUsers, acceptTeacher, rejectTeacher } from '../../services/admin';

const TeacherManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState('pending'); // pending, accepted, rejected

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      // Fetch users (ideally this would be a specific applications endpoint)
      // For now, we fetch a large first page to find applicants
      const res = await getAllUsers(1, 50);
      const data = res?.data || res;
      const allUsers = data.users || [];
      
      setApplications(allUsers.filter(u => u.teacherRequested || u.role === 'teacher'));
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setProcessingId(id);
    try {
      if (action === 'accept') {
        await acceptTeacher(id);
      } else {
        await rejectTeacher(id);
      }
      await fetchApplications();
    } catch (error) {
      alert(`Action failed: ${error.response?.data?.message || "ServerError"}`);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApps = applications.filter(app => {
    if (filter === 'pending') return app.role === 'learner' && app.teacherRequested;
    if (filter === 'accepted') return app.role === 'teacher';
    if (filter === 'rejected') return app.role === 'learner' && !app.teacherRequested; // This is a bit tricky with current schema
    return true;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Teacher Applications</h1>
        <p className="text-slate-500 dark:text-slate-400">Review and manage users who want to contribute as teachers.</p>
      </div>

      {/* Stats / Filters */}
      <div className="flex flex-wrap gap-4">
        {[
          { id: 'pending', label: 'Pending Review', icon: Info, color: 'indigo' },
          { id: 'accepted', label: 'Accepted Teachers', icon: CheckCircle2, color: 'emerald' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all border ${
              filter === cat.id 
                ? `bg-${cat.color}-50 border-${cat.color}-200 text-${cat.color}-600 dark:bg-${cat.color}-900/20 dark:border-${cat.color}-800 dark:text-${cat.color}-400`
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center">
            <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No {filter} applications found.</p>
          </div>
        ) : (
          filteredApps.map((app) => (
            <div key={app._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <GraduationCap className="w-8 h-8 text-slate-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{app.fullName || app.username}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                    {app.nativeLanguage || 'Unknown Lang'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {app.email}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Applied on {new Date(app.updatedAt).toLocaleDateString()}</span>
                </div>
                
                {/* Motivation / Experience placeholder - if backend provides a specific field */}
                {app.teacherBio && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 text-sm text-slate-600 dark:text-slate-300">
                    <p className="font-bold text-slate-400 text-xs uppercase mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Statement of Interest
                    </p>
                    {app.teacherBio}
                  </div>
                )}
              </div>

              <div className="flex gap-3 shrink-0">
                {filter === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleAction(app._id, 'reject')}
                      disabled={processingId === app._id}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-900/20 font-bold text-sm transition-all"
                    >
                      {processingId === app._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(app._id, 'accept')}
                      disabled={processingId === app._id}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-sm transition-all shadow-sm"
                    >
                      {processingId === app._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Approve
                    </button>
                  </>
                ) : (
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm transition-all">
                    <ExternalLink className="w-4 h-4" /> View Profile
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherManagement;
