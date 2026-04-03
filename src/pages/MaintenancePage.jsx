import React, { useState } from 'react';
import { Lock, Settings, Key } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const MaintenancePage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    setLoading(true);
    try {
      await api.put('/admin/shut-system');
      window.dispatchEvent(new Event('system-online'));
      toast.success('System unlocked! Services restored.');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error('Failed to unlock system');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center relative shadow-lg shadow-indigo-500/10">
          <Settings className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-[spin_4s_linear_infinite]" />
          <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white p-2 rounded-full ring-4 ring-slate-50 dark:ring-slate-950">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          We'll be right back
        </h1>
        
        <p className="text-lg text-slate-600 dark:text-slate-400">
          The system is currently undergoing scheduled maintenance. Services are temporarily unavailable for a moment.
          <br/><br/>
          <strong>Please come back later.</strong>
        </p>
      </div>

      {user?.role === 'super-admin' && (
        <button
          onClick={handleUnlock}
          disabled={loading}
          className="absolute bottom-8 right-8 flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-medium hover:scale-105 transition-transform shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <Key className="w-4 h-4" />
          {loading ? 'Unlocking...' : 'Emergency Unlock'}
        </button>
      )}
    </div>
  );
};

export default MaintenancePage;
