import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  BarChart2, 
  ChevronRight,
  User,
  Clock,
  Eye,
  Loader2
} from 'lucide-react';
import { getTeacherStudents, getStudentDetail } from '../../services/teacher';
import { toast } from 'react-hot-toast';
import StudentDetailModal from '../../components/teacher/StudentDetailModal';

const TeacherStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await getTeacherStudents();
      setStudents(res.data.students || []);
    } catch (err) {
      // toast handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (studentProgressId) => {
    setIsDetailLoading(true);
    setIsModalOpen(true);
    try {
      const res = await getStudentDetail(studentProgressId);
      setSelectedStudent(res.data.progress);
    } catch (err) {
      setIsModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Students</h1>
          <p className="text-slate-500 mt-1">Manage and monitor progress of students enrolled in your track.</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Users className="w-5 h-5 text-indigo-500" />
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Total Active</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{students.length} Learners</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4">
          Showing <span className="text-indigo-600 dark:text-indigo-400">{filteredStudents.length}</span> results
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((progress) => (
            <div 
              key={progress._id} 
              onClick={() => handleViewDetails(progress._id)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-7 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-all group cursor-pointer relative overflow-hidden"
            >
              {/* Decorative background circle */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl group-hover:bg-indigo-100 transition-colors" />

              <div className="flex items-start justify-between mb-8 relative">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-3xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xl shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    {progress.user.fullName[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-900 dark:text-white truncate text-lg tracking-tight">{progress.user.fullName}</h3>
                    <p className="text-xs font-bold text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3 text-indigo-400" /> {progress.user.email}
                    </p>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-all">
                  <Eye className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-5 relative">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Course Progress</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{progress.progressPercentage}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                      style={{ width: `${progress.progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-5 border-t border-slate-50 dark:border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase font-black text-slate-400 tracking-tighter">Last Active</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                        {progress.updatedAt ? new Date(progress.updatedAt).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <BarChart2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase font-black text-slate-400 tracking-tighter">Completed</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                        {progress.completedLessons?.length || 0} Lessons
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Users className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white">No students found</h3>
            <p className="text-slate-500 font-medium mt-2 max-w-xs mx-auto">Try adjusting your search filters or check if anyone has enrolled in your track.</p>
          </div>
        )}
      </div>

      <StudentDetailModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudent(null);
        }}
        studentData={selectedStudent}
      />

      {/* Detail Loading Overlay */}
      {isDetailLoading && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-white/40 dark:bg-slate-950/40 backdrop-blur-[2px]">
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            <p className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-widest">Loading Profile...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudents;
