import { useState, useEffect } from 'react';
import { getTeacherTrack } from '../../services/teacher';
import { createLevel, updateLevel, deleteLevelPermanently, toggleLevelStatus } from '../../services/level';
import { createLesson, deleteLesson, updateLesson } from '../../services/lesson';
import {
  Plus,
  Trash2,
  Save,
  ChevronLeft,
  FileText,
  HelpCircle,
  Edit3,
  Layers,
  ChevronDown,
  ChevronUp,
  Play,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import LevelModal from '../../components/teacher/LevelModal';
import LessonModal from '../../components/teacher/LessonModal';
import ConfirmModal from '../../components/ConfirmModal';

const TrackEditor = () => {
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedLevel, setExpandedLevel] = useState(null);
  const navigate = useNavigate();

  // Modals state
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [targetLevelId, setTargetLevelId] = useState(null);

  const [levelActionLoading, setLevelActionLoading] = useState(false);

  const [confirmDeleteModal, setConfirmDeleteModal] = useState({ isOpen: false, id: null, type: 'level' });

  const fetchTrack = async () => {
    try {
      const res = await getTeacherTrack();
      setTrack(res.data.track);
    } catch {
      // Interceptor handles error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrack();
  }, []);

  const handleOpenLevelModal = (level = null) => {
    setEditingLevel(level);
    setIsLevelModalOpen(true);
  };

  const handleSaveLevel = async (formData) => {
    setLevelActionLoading(true);
    try {
      if (editingLevel) {
        await updateLevel(editingLevel._id, formData);
        toast.success("Level updated successfully");
      } else {
        const nextLevel = (track.levels?.length || 0) + 1;
        if (nextLevel > 5 && !formData.levelNumber) {
           toast.error("Maximum 5 levels allowed.");
           return;
        }
        await createLevel({
          ...formData,
          learning: track._id,
          order: formData.levelNumber || nextLevel
        });
        toast.success("New level created!");
      }
      setIsLevelModalOpen(false);
      fetchTrack();
    } catch {
      // Interceptor handles error
    } finally {
      setLevelActionLoading(false);
    }
  };

  const handleToggleStatus = async (levelId, currentStatus) => {
    try {
      await toggleLevelStatus(levelId);
      toast.success(`Level ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchTrack();
    } catch {}
  };

  const handleToggleLessonStatus = async (lessonId, currentStatus) => {
    try {
      await updateLesson(lessonId, { isActive: !currentStatus });
      toast.success(`Lesson ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchTrack();
    } catch {}
  };

  const handleDeletePermanent = async () => {
    const { id, type } = confirmDeleteModal;
    setLevelActionLoading(true);
    try {
      if (type === 'level') {
        await deleteLevelPermanently(id);
        toast.success("Level deleted permanently");
      } else {
        await deleteLesson(id);
        toast.success("Lesson deleted permanently");
      }
      setConfirmDeleteModal({ isOpen: false, id: null, type: 'level' });
      fetchTrack();
    } catch {
      // Interceptor
    } finally {
      setLevelActionLoading(false);
    }
  };

  const handleOpenLessonModal = (levelId) => {
    setTargetLevelId(levelId);
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (formData) => {
    setLevelActionLoading(true);
    try {
      await createLesson({
        ...formData,
        level: targetLevelId,
        teacher: track.teacher?._id || track.teacher
      });
      toast.success("Lesson created!");
      setIsLessonModalOpen(false);
      fetchTrack();
    } catch {
      // Interceptor
    } finally {
      setLevelActionLoading(false);
    }
  };

  const handleReorderLevel = async (level, direction) => {
    const currentIndex = track.levels.findIndex(l => l._id === level._id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= track.levels.length) return;

    const targetLevel = track.levels[targetIndex];

    // Swap levelNumbers
    try {
      setLevelActionLoading(true);
      const originalNum = level.levelNumber;
      const targetNum = targetLevel.levelNumber;

      // We use a temporary high number to avoid uniqueness collision
      await updateLevel(level._id, { levelNumber: 9999 });
      await updateLevel(targetLevel._id, { levelNumber: originalNum });
      await updateLevel(level._id, { levelNumber: targetNum });

      toast.success("Levels reordered");
      fetchTrack();
    } catch {
      toast.error("Failed to reorder levels");
    } finally {
      setLevelActionLoading(false);
    }
  };

  const handleReorderLesson = async (levelId, lesson, direction) => {
    const level = track.levels.find(l => l._id === levelId);
    const currentIndex = level.lessons.findIndex(ls => ls._id === lesson._id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= level.lessons.length) return;

    const targetLesson = level.lessons[targetIndex];

    try {
      setLevelActionLoading(true);
      const originalOrder = lesson.order;
      const targetOrder = targetLesson.order;

      // Swap orders
      await updateLesson(lesson._id, { order: 9999 });
      await updateLesson(targetLesson._id, { order: originalOrder });
      await updateLesson(lesson._id, { order: targetOrder });

      toast.success("Lessons reordered");
      fetchTrack();
    } catch {
      toast.error("Failed to reorder lessons");
    } finally {
      setLevelActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!track) return <div className="text-center py-20">No track found.</div>;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Curriculum Editor</h1>
          <p className="text-slate-500">Managing Track: <span className="font-bold text-indigo-600">{track.title}</span></p>
        </div>
        <button
          onClick={() => handleOpenLevelModal()}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add New Level
        </button>
      </div>

      <div className="space-y-6">
        {track.levels.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No levels created yet. Start by adding Level 1.</p>
          </div>
        ) : (
          track.levels.map((level) => (
            <div key={level._id} className={`bg-white dark:bg-slate-900 border ${level.isActive ? 'border-slate-200 dark:border-slate-800' : 'border-rose-100 dark:border-rose-900/30 opacity-75'} rounded-3xl overflow-hidden shadow-sm hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all`}>
              <div className="flex items-center">
                <button
                  onClick={() => setExpandedLevel(expandedLevel === level._id ? null : level._id)}
                  className="flex-1 p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${level.isActive ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 text-slate-400'} flex items-center justify-center font-black text-lg transition-colors`}>
                      {level.levelNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">Level {level.levelNumber}: {level.title}</h3>
                        {!level.isActive && (
                          <span className="flex items-center gap-1 text-[10px] bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border border-rose-100 dark:border-rose-900/50">
                            <EyeOff className="w-2.5 h-2.5" /> Deactivated
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{level.difficulty}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-bold text-indigo-500">{level.lessons?.length || 0} Lessons</span>
                        <span className="text-xs text-slate-400">•</span>
                        {level.quiz ? (
                          <span className="text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Quiz Ready ({level.quiz.questionPool?.length || 0})
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border border-slate-100 dark:border-slate-800 flex items-center gap-1">
                            <HelpCircle className="w-2.5 h-2.5" /> No Quiz
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {expandedLevel === level._id ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                </button>
                <div className="pr-6 flex items-center gap-1">
                  <div className="flex flex-col gap-1 mr-4">
                    <button
                      onClick={() => handleReorderLevel(level, 'up')}
                      disabled={track.levels.indexOf(level) === 0}
                      className="p-1 text-slate-300 hover:text-indigo-600 disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleReorderLevel(level, 'down')}
                      disabled={track.levels.indexOf(level) === track.levels.length - 1}
                      className="p-1 text-slate-300 hover:text-indigo-600 disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(level._id, level.isActive)}
                    className={`p-2 rounded-xl transition-all ${level.isActive ? 'text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                    title={level.isActive ? "Deactivate" : "Activate"}
                  >
                    {level.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleOpenLevelModal(level)}
                    className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteModal({ isOpen: true, id: level._id, type: 'level' })}
                    className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {expandedLevel === level._id && (
                <div className="p-6 pt-0 border-t border-slate-50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="space-y-3 mt-6">
                    {level.lessons?.length > 0 ? (
                      level.lessons.map((lesson) => (
                        <div key={lesson._id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl group hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                              <Play className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-700 dark:text-slate-200">{lesson.title}</span>
                              <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">
                                {lesson.sections?.length || 0} Sections • {
                                  level.quiz?.questionPool?.some(q => q.lesson === lesson._id || q.lesson?._id === lesson._id) 
                                    ? 'Covered in Quiz' 
                                    : 'Not in Quiz'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-0.5 mr-2">
                               <button
                                 onClick={() => handleReorderLesson(level._id, lesson, 'up')}
                                 disabled={level.lessons.indexOf(lesson) === 0}
                                 className="p-1.5 text-slate-300 hover:text-indigo-600 disabled:opacity-30"
                               >
                                 <ArrowUp className="w-3.5 h-3.5" />
                               </button>
                               <button
                                 onClick={() => handleReorderLesson(level._id, lesson, 'down')}
                                 disabled={level.lessons.indexOf(lesson) === level.lessons.length - 1}
                                 className="p-1.5 text-slate-300 hover:text-indigo-600 disabled:opacity-30"
                               >
                                 <ArrowDown className="w-3.5 h-3.5" />
                               </button>
                            </div>
                            <button
                              onClick={() => handleToggleLessonStatus(lesson._id, lesson.isActive)}
                              className={`p-2 rounded-xl transition-all ${lesson.isActive ? 'text-slate-300 hover:text-rose-500' : 'text-emerald-500'}`}
                              title={lesson.isActive ? "Deactivate" : "Activate"}
                            >
                              {lesson.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => navigate(`/teacher/edit-lesson/${lesson._id}`)}
                              className="flex items-center gap-2 px-3 py-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold text-xs transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit Content
                            </button>
                            <button
                              onClick={() => setConfirmDeleteModal({ isOpen: true, id: lesson._id, type: 'lesson' })}
                              className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-slate-400 text-sm italic">
                        No lessons yet. Add your first lesson below.
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    <button
                      onClick={() => handleOpenLessonModal(level._id)}
                      className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-900 transition-all font-bold text-sm"
                    >
                      <Plus className="w-5 h-5" />
                      Add Manual Lesson
                    </button>
                    <button
                      onClick={() => toast.loading("AI is thinking... (Generating Lesson)", { duration: 2000 })}
                      className="flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-indigo-50 to-fuchsia-50 dark:from-indigo-950/20 dark:to-fuchsia-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl text-indigo-600 dark:text-indigo-400 hover:shadow-xl transition-all font-black text-sm group"
                    >
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Generate with AI
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <LevelModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        onSave={handleSaveLevel}
        level={editingLevel}
        isLoading={levelActionLoading}
      />

      <LessonModal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        onSave={handleSaveLesson}
        isLoading={levelActionLoading}
      />

      <ConfirmModal
        isOpen={confirmDeleteModal.isOpen}
        onClose={() => setConfirmDeleteModal({ ...confirmDeleteModal, isOpen: false })}
        onConfirm={handleDeletePermanent}
        title={`Delete ${confirmDeleteModal.type === 'level' ? 'Level' : 'Lesson'}?`}
        message={`Are you sure you want to permanently delete this ${confirmDeleteModal.type}? All associated data will be lost.`}
        isLoading={levelActionLoading}
      />
    </div>
  );
};

export default TrackEditor;
