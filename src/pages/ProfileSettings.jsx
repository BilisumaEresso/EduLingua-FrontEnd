import { useState, useEffect } from 'react';
import { User, Lock, Trash2, Save, Globe, UserCircle, CheckCircle, AlertCircle, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore';
import { updateUser, changePassword, deleteAccount } from '../services/auth';
import { getAllLanguages } from '../services/language';

const TAB_GENERAL = 'general';
const TAB_SECURITY = 'security';

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-medium transition-all ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
    {type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none">&times;</button>
  </div>
);

const ProfileSettings = () => {
  const { t } = useTranslation();
  const { user, checkAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState(TAB_GENERAL);
  const [languages, setLanguages] = useState([]);
  const [toast, setToast] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // General form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [nativeLanguage, setNativeLanguage] = useState(user?.nativeLanguage?._id || user?.nativeLanguage || '');
  const [savingGeneral, setSavingGeneral] = useState(false);

  // Security form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    getAllLanguages().then(res => {
      if (res?.data) setLanguages(res.data?.langs || res.data || []);
    }).catch(() => {});
  }, []);

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setSavingGeneral(true);
    try {
      await updateUser({ fullName, username, nativeLanguage });
      await checkAuth();
      showToast(t('profile.successUpdate'));
    } catch (err) {
      showToast(err?.response?.data?.message || t('profile.errorUpdate'), 'error');
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast(t('profile.passwordMismatch'), 'error');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      showToast(t('profile.successPassword'));
    } catch (err) {
      showToast(err?.response?.data?.message || t('profile.errorPassword'), 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await deleteAccount();
      useAuthStore.getState().logout();
      window.location.href = '/';
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete account.', 'error');
      setDeletingAccount(false);
    }
  };

  const tabs = [
    { key: TAB_GENERAL, label: t('profile.general'), icon: User },
    { key: TAB_SECURITY, label: t('profile.security'), icon: Lock },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('profile.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('profile.subtitle')}</p>
      </div>

      {/* Profile Summary Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-3xl p-6 text-white flex items-center gap-5 shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <UserCircle className="w-9 h-9 text-white" />
        </div>
        <div>
          <p className="text-lg font-bold">{user?.fullName || user?.name || 'Your Name'}</p>
          <p className="text-indigo-100 text-sm">@{user?.username || 'username'}</p>
          <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${user?.isPremium ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 text-white'}`}>
            {user?.isPremium ? '⭐ Premium' : user?.role || t('general.student')}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === tab.key ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-8">
          {/* General Tab */}
          {activeTab === TAB_GENERAL && (
            <form onSubmit={handleSaveGeneral} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('profile.fullName')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder={t('auth.fullNamePlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('profile.username')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder={t('auth.usernamePlaceholder')}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('profile.email')}</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-400 text-sm cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-slate-400">{t('profile.emailNote')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('profile.nativeLanguage')}</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={nativeLanguage}
                    onChange={e => setNativeLanguage(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
                  >
                    <option value="" disabled>{t('auth.selectLanguage')}</option>
                    {languages.map(lang => (
                      <option key={lang._id} value={lang._id}>{lang.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingGeneral}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {savingGeneral ? t('profile.saving') : t('profile.saveChanges')}
                </button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === TAB_SECURITY && (
            <div className="space-y-10">
              {/* Change Password */}
              <form onSubmit={handleChangePassword} className="space-y-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('profile.changePassword')}</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('profile.currentPassword')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder={t('auth.passwordPlaceholder')}
                    />
                    <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('profile.newPassword')}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        placeholder={t('profile.minCharacters')}
                      />
                      <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('profile.confirmPassword')}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${confirmPassword && confirmPassword !== newPassword ? 'border-red-400' : 'border-slate-300 dark:border-slate-700'}`}
                        placeholder={t('auth.passwordPlaceholder')}
                      />
                    </div>
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p className="mt-1 text-xs text-red-500">{t('profile.passwordMismatch')}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
                  >
                    <Lock className="w-4 h-4" />
                    {savingPassword ? t('profile.updating') : t('profile.updatePassword')}
                  </button>
                </div>
              </form>

              {/* Danger Zone */}
              <div className="border border-red-200 dark:border-red-900/40 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  <h3 className="text-base font-bold text-red-600 dark:text-red-400">{t('profile.dangerZone')}</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {t('profile.deleteDesc')}
                </p>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('profile.deleteAccount')}
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">{t('profile.confirmDelete')}</p>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount}
                      className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
                    >
                      {deletingAccount ? t('profile.deleting') : t('profile.yesDelete')}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-medium"
                    >
                      {t('profile.cancel')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
