import { useState, useEffect } from 'react';
import { 
  Users, Search, Shield, UserX, UserCheck, 
  MoreVertical, MoreHorizontal, Loader2, Mail, 
  ChevronLeft, ChevronRight, CheckCircle2, XCircle
} from 'lucide-react';
import { getAllUsers, promoteUser, demoteUser, fireTeacher } from '../../services/admin';
import useAuthStore from '../../store/authStore';

const UserManagement = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [limit] = useState(10);

  useEffect(() => {
    fetchUsers(pagination.page);
  }, [pagination.page]);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAllUsers(page, limit);
      const data = res?.data || res;
      setUsers(data.users || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: data.users?.length || 0 });
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFire = async (id) => {
    if (!window.confirm("Are you sure you want to fire this teacher? They will be demoted to a regular learner.")) return;
    setProcessingId(id);
    try {
      await fireTeacher(id);
      await fetchUsers(pagination.page);
    } catch (error) {
      alert("Action failed: " + (error.response?.data?.message || "ServerError"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDemote = async (id) => {
    if (!window.confirm("Are you sure you want to demote this admin?")) return;
    setProcessingId(id);
    try {
      await demoteUser(id);
      await fetchUsers(pagination.page);
    } catch (error) {
      alert("Demotion failed: " + (error.response?.data?.message || "ServerError"));
    } finally {
      setProcessingId(null);
    }
  };

  const handlePromote = async (id) => {
    setProcessingId(id);
    try {
      await promoteUser(id);
      await fetchUsers(pagination.page);
    } catch (error) {
      alert("Promotion failed: " + (error.response?.data?.message || "ServerError"));
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(usr => 
    usr.username?.toLowerCase().includes(search.toLowerCase()) ||
    usr.email?.toLowerCase().includes(search.toLowerCase()) ||
    usr.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400">View and manage all system users and their roles.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((usr) => (
                  <tr key={usr._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 shrink-0">
                          {usr.fullName?.[0] || usr.username?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{usr.fullName || usr.username}</p>
                          <p className="text-xs text-slate-500 truncate">{usr.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-tight ${
                        usr.role === 'super-admin' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                        usr.role === 'admin' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                        usr.role === 'teacher' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {usr.isActive ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <XCircle className="w-4 h-4" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {usr._id !== currentUser._id && (
                        <div className="flex justify-end gap-2">
                          {usr.role === 'learner' ? (
                            <button 
                              onClick={() => handlePromote(usr._id)}
                              disabled={processingId === usr._id}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                              title="Promote to Admin"
                            >
                              {processingId === usr._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                            </button>
                          ) : usr.role === 'teacher' ? (
                            <button 
                              onClick={() => handleFire(usr._id)}
                              disabled={processingId === usr._id}
                              className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                              title="Fire Teacher"
                            >
                              {processingId === usr._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                            </button>
                          ) : usr.role === 'admin' && currentUser.role === 'super-admin' ? (
                            <button 
                              onClick={() => handleDemote(usr._id)}
                              disabled={processingId === usr._id}
                              className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                              title="Demote to Learner"
                            >
                              {processingId === usr._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                            </button>
                          ) : null}
                          <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500">
            Showing {filteredUsers.length} of {pagination.total} users (Page {pagination.page} of {pagination.totalPages})
          </p>
          <div className="flex gap-2">
            <button 
              disabled={!pagination.hasPrev || loading} 
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              disabled={!pagination.hasNext || loading}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
