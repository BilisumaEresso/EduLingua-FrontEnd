import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';
import { 
  User, Mail, Shield, Trash2, Crown, 
  UserMinus, UserPlus, Save, Loader2,
  Activity, Book, Map, Languages, GraduationCap,
  AlertCircle
} from 'lucide-react';
import { 
  updateUserInfo, 
  deleteUserPermanently, 
  togglePremium, 
  enrollUserInTrack, 
  unenrollUserFromTrack,
  promoteUser,
  demoteUser,
  fireTeacher,
  getAllTracks
} from '../../services/admin';
import { toast } from 'react-hot-toast';

const AdminUserDetailModal = ({ isOpen, onClose, user, onUpdate, currentAdmin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState('');
  
  // Confirmations
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    type: '', 
    title: '', 
    message: '',
    action: null
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        username: user.username || ''
      });
      fetchTracks();
    }
  }, [user, isOpen]);

  const fetchTracks = async () => {
    try {
      const res = await getAllTracks();
      setTracks(res.data.tracks || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateUserInfo(user._id, formData);
      toast.success("User info updated");
      onUpdate();
    } catch (err) {
      // toast by interceptor
    } finally {
      setIsUpdating(false);
    }
  };

  const runAction = async (actionFn, successMsg) => {
    setIsActionLoading(true);
    try {
      await actionFn();
      toast.success(successMsg);
      onUpdate();
      setConfirmModal({ isOpen: false });
    } catch (err) {
      // toast by interceptor
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTogglePremium = () => runAction(() => togglePremium(user._id), `User is now ${user.isPremium ? 'Individual' : 'Premium'}`);
  
  const handleDelete = () => setConfirmModal({
    isOpen: true,
    type: 'danger',
    title: 'Delete User Permanently?',
    message: 'This will erase the user and all their progress, chat history, and logs. This cannot be undone.',
    action: () => runAction(() => deleteUserPermanently(user._id), "User deleted forever"),
  });

  const handlePromote = () => runAction(() => promoteUser(user._id), "User promoted to Admin");
  const handleDemote = () => runAction(() => demoteUser(user._id), "Admin demoted to Learner");
  const handleFire = () => runAction(() => fireTeacher(user._id), "Teacher fired and demoted to Learner");

  const handleEnroll = async () => {
    if (!selectedTrack) return toast.error("Select a track first");
    runAction(() => enrollUserInTrack(user._id, selectedTrack), "User enrolled in track");
  };

  const handleUnenroll = (trackId) => {
    setConfirmModal({
      isOpen: true,
      type: 'warning',
      title: 'Remove from Track?',
      message: 'This will delete the user\'s progress in this specific track.',
      action: () => runAction(() => unenrollUserFromTrack(user._id, trackId), "User removed from track"),
    });
  };

  if (!user) return null;

  const isSuper = currentAdmin?.role === 'super-admin';
  const isTargetSuper = user.role === 'super-admin';
  const isTargetAdmin = user.role === 'admin';
  const canModifyRole = isSuper && !isTargetSuper;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Administrative Control"
      size="xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info & Update */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-center">
            <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center text-3xl font-black mx-auto mb-4 shadow-xl shadow-indigo-500/20">
              {user.fullName?.[0] || user.username?.[0]}
            </div>
            <h3 className="font-black text-slate-900 dark:text-white truncate">{user.fullName}</h3>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              user.role === 'super-admin' ? 'bg-rose-100 text-rose-600' :
              user.role === 'admin' ? 'bg-indigo-100 text-indigo-600' :
              user.role === 'teacher' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
            }`}>
              {user.role}
            </span>
          </div>

          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Edit Information</h4>
            <div className="space-y-3">
              <input 
                type="text" 
                value={formData.fullName} 
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                placeholder="Full Name"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="Email Address"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <input 
                type="text" 
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})}
                placeholder="Username"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Right Columns: Actions & Track Management */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> Role & Status
              </h4>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={handleTogglePremium}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    user.isPremium ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Crown className={`w-4 h-4 ${user.isPremium ? 'fill-current' : ''}`} />
                  {user.isPremium ? 'Revoke Premium' : 'Make Premium'}
                </button>

                {canModifyRole && user.role === 'learner' && (
                  <button onClick={handlePromote} className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Promote to Admin
                  </button>
                )}
                {canModifyRole && user.role === 'admin' && (
                  <button onClick={handleDemote} className="px-4 py-2 rounded-xl bg-orange-50 text-orange-700 text-xs font-bold flex items-center gap-2">
                    <UserMinus className="w-4 h-4" /> Demote to Learner
                  </button>
                )}
                {isSuper && user.role === 'teacher' && (
                  <button onClick={handleFire} className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Fire Teacher
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 rounded-3xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/20 dark:bg-rose-900/10 space-y-4">
              <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" /> Danger Zone
              </h4>
              <button 
                onClick={handleDelete}
                disabled={isTargetSuper}
                className="w-full py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-500 disabled:opacity-50 transition-all shadow-lg shadow-rose-500/20"
              >
                <Trash2 className="w-4 h-4" /> Permanent Delete User
              </button>
            </div>
          </div>

          {/* Track Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Map className="w-3.5 h-3.5" /> Track Enrollment
              </h4>
            </div>

            <div className="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-6">
              {/* Manual Enrollment */}
              <div className="flex flex-col sm:flex-row gap-3">
                <select 
                  value={selectedTrack}
                  onChange={e => setSelectedTrack(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a track to enroll...</option>
                  {tracks.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.sourceLanguage?.name} → {t.targetLanguage?.name} ({t.title})
                    </option>
                  ))}
                </select>
                <button 
                  onClick={handleEnroll}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all shrink-0 shadow-lg shadow-indigo-500/20"
                >
                  Enroll User
                </button>
              </div>

              {/* Progress Table placeholder or simple list */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Active Enrollments</p>
                {/* Note: In a real scenario, we might need a separate API to get user's active tracks, 
                    but here we'll assume they are populated or just show a message */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800 overflow-hidden">
                  <div className="p-4 text-center text-slate-400 text-xs italic">
                    Manage tracks from this panel to forcefully enroll or erase student data.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        isLoading={isActionLoading}
      />
    </Modal>
  );
};

export default AdminUserDetailModal;
