import { useState, useEffect } from 'react';
import { 
  Users, Search, Shield, UserX, UserCheck, 
  MoreVertical, MoreHorizontal, Loader2, Mail, 
  ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  Crown, Eye, Filter
} from 'lucide-react';
import { getAllUsers } from '../../services/admin';
import useAuthStore from '../../store/authStore';
import AdminUserDetailModal from '../../components/admin/AdminUserDetailModal';

const UserManagement = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Pagination & Filtering
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [limit] = useState(10);
  const [activeTab, setActiveTab] = useState('all'); // all, learners, teachers, admins

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAllUsers(page, limit);
      const data = res?.data || res;
      setUsers(data.users || []);
      setPagination(data.pagination || { 
        page: 1, 
        totalPages: 1, 
        total: data.users?.length || 0,
        hasNext: false,
        hasPrev: false
      });
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.page);
  }, [pagination.page]);

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUpdate = () => {
    fetchUsers(pagination.page);
  };

  const filteredUsers = users.filter(usr => {
    const matchesSearch = 
      usr.username?.toLowerCase().includes(search.toLowerCase()) ||
      usr.email?.toLowerCase().includes(search.toLowerCase()) ||
      usr.fullName?.toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'learners') return matchesSearch && usr.role === 'learner';
    if (activeTab === 'teachers') return matchesSearch && usr.role === 'teacher';
    if (activeTab === 'admins') return matchesSearch && (usr.role === 'admin' || usr.role === 'super-admin');
    return matchesSearch;
  });

  const tabs = [
    { id: 'all', label: 'All Users', icon: Users },
    { id: 'learners', label: 'Learners', icon: UserCheck },
    { id: 'teachers', label: 'Teachers', icon: Shield },
    { id: 'admins', label: 'Admins', icon: Crown },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">User Infrastructure</h1>
          <p className="text-slate-500 font-medium mt-1">Global oversight and administrative control of all system accounts.</p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, username..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
            <Filter className="w-3.5 h-3.5" /> Showing {filteredUsers.length} Users
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5">Identity</th>
                <th className="px-8 py-5">Clearance / Role</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Records</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
                    <p className="mt-4 text-xs font-black text-slate-400 uppercase tracking-widest">Accessing Databases...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">No accounts found matching your query.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((usr) => (
                  <tr key={usr._id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/20 transition-all cursor-pointer" onClick={() => handleOpenModal(usr)}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-black text-slate-500 group-hover:scale-110 transition-transform shadow-inner">
                          {usr.fullName?.[0] || usr.username?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">{usr.fullName || usr.username}</p>
                          <p className="text-xs font-bold text-slate-400 truncate flex items-center gap-1.5">
                            <Mail className="w-3 h-3" /> {usr.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border transition-all ${
                        usr.role === 'super-admin' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30' :
                        usr.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900/30' :
                        usr.role === 'teacher' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30' :
                        'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:border-slate-700'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${usr.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${usr.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {usr.isActive ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        {usr.isPremium && (
                          <span className="flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase tracking-widest">
                            <Crown className="w-3 h-3 fill-current" /> Premium
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Joined</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                          {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100 dark:group-hover:border-indigo-900/50 transition-all shadow-sm group-hover:shadow-indigo-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(usr);
                        }}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Identity Count: <span className="text-slate-900 dark:text-white">{filteredUsers.length} / {pagination.total}</span>
          </p>
          <div className="flex gap-2">
            <button 
              disabled={!pagination.hasPrev || loading} 
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <div className="flex items-center px-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black text-indigo-600">
              {pagination.page} / {pagination.totalPages}
            </div>
            <button 
              disabled={!pagination.hasNext || loading}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 transition-all active:scale-95"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {selectedUser && (
        <AdminUserDetailModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={selectedUser}
          onUpdate={handleUpdate}
          currentAdmin={currentUser}
        />
      )}
    </div>
  );
};

export default UserManagement;
