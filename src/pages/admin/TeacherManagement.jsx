import { useState, useEffect } from 'react';
import { 
  GraduationCap, Check, X, Search, Loader2, 
  ExternalLink, Mail, Calendar, AlertCircle, 
  CheckCircle2, XCircle, Info, Globe, Settings2
} from 'lucide-react';
import { getAllUsers, acceptTeacher, rejectTeacher } from '../../services/admin';
import { getAllLanguages } from '../../services/language';
import { toast } from 'react-hot-toast';

const TeacherManagement = () => {
  const [applications, setApplications] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [manualSetup, setManualSetup] = useState({}); // { userId: { src: '', tgt: '' } }

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [userRes, langRes] = await Promise.all([
        getAllUsers(1, 50),
        getAllLanguages()
      ]);
      
      const userData = userRes?.data || userRes;
      const allUsers = userData.users || [];
      setApplications(allUsers.filter(u => u.teacherRequested || u.role === 'teacher'));
      setLanguages(langRes.data.langs || []);
    } catch {
      // Interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await getAllUsers(1, 50);
      const data = res?.data || res;
      setApplications((data.users || []).filter(u => u.teacherRequested || u.role === 'teacher'));
    } catch {
      // Silent refresh failure
    }
  };

  const handleAction = async (id, action) => {
    setProcessingId(id);
    try {
      if (action === 'accept') {
        const app = applications.find(a => a._id === id);
        const manual = manualSetup[id] || {};
        
        const payload = {
          sourceLanguage: manual.src || app.nativeLanguage?._id || app.nativeLanguage,
          targetLanguage: manual.tgt || app.teachingLanguage?._id || app.teachingLanguage,
          trackTitle: `Learn ${app.teacherApplicationData?.requestedSubject || manual.tgtName || 'Target Language'}`,
          trackDescription: `Professional language track curated by ${app.fullName}`
        };

        // Client-side validation — show immediately without waiting for API
        if (!payload.sourceLanguage || !payload.targetLanguage) {
          toast.error("Please select both source and target languages.");
          setProcessingId(null);
          return;
        }

        await acceptTeacher(id, payload);
        toast.success("Teacher approved and track assigned!");
      } else {
        await rejectTeacher(id);
        toast.success("Application rejected.");
      }
      await fetchApplications();
    } catch {
      // Interceptor handles the error toast
    } finally {
      setProcessingId(null);
    }
  };

  const updateManual = (id, field, value) => {
    setManualSetup(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const filteredApps = applications.filter(app => {
    if (filter === 'pending') return app.role === 'learner' && app.teacherRequested;
    if (filter === 'accepted') return app.role === 'teacher';
    return true;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Teacher Management</h1>
        <p className="text-slate-500 dark:text-slate-400">Review and configure specialized teaching tracks.</p>
      </div>

      <div className="flex flex-wrap gap-4">
        {[
          { id: 'pending', label: 'Pending Review', icon: Info, color: 'indigo' },
          { id: 'accepted', label: 'Active Teachers', icon: CheckCircle2, color: 'emerald' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all border ${
              filter === cat.id 
                ? `bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400`
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center">
            <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No {filter} applications found.</p>
          </div>
        ) : (
          filteredApps.map((app) => (
            <div key={app._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                <GraduationCap className="w-8 h-8 text-indigo-500" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{app.fullName || app.username}</h3>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <Globe className="w-3 h-3" />
                    {app.nativeLanguage?.name || 'Unknown'} → {app.teacherApplicationData?.requestedSubject || app.teachingLanguage?.name || 'TBD'}
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {app.email}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
                
                {app.teacherApplicationData && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 text-sm">
                      <p className="font-bold text-slate-400 text-xs uppercase mb-2 flex items-center gap-1">Experience</p>
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{app.teacherApplicationData.experience}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 text-sm">
                      <p className="font-bold text-slate-400 text-xs uppercase mb-2 flex items-center gap-1">Motivation</p>
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{app.teacherApplicationData.motivation}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 min-w-[240px]">
                {filter === 'pending' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Settings2 className="w-3 h-3" /> Track Setup Fallback
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <select 
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] px-2 py-1.5 outline-none"
                        value={manualSetup[app._id]?.src || app.nativeLanguage?._id || ''}
                        onChange={(e) => updateManual(app._id, 'src', e.target.value)}
                      >
                        <option value="">Source</option>
                        {languages.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                      </select>
                      <select 
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] px-2 py-1.5 outline-none"
                        value={manualSetup[app._id]?.tgt || app.teachingLanguage?._id || ''}
                        onChange={(e) => {
                          const name = languages.find(l => l._id === e.target.value)?.name;
                          updateManual(app._id, 'tgt', e.target.value);
                          updateManual(app._id, 'tgtName', name);
                        }}
                      >
                        <option value="">Target</option>
                        {languages.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {filter === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleAction(app._id, 'reject')}
                        disabled={processingId === app._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-all"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                      <button
                        onClick={() => handleAction(app._id, 'accept')}
                        disabled={processingId === app._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 font-bold text-xs transition-all shadow-lg shadow-indigo-500/20"
                      >
                        {processingId === app._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Approve
                      </button>
                    </>
                  ) : (
                    <button className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 font-bold text-sm transition-all">
                      <ExternalLink className="w-4 h-4" /> Manage Track
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherManagement;
