import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLessonById, updateLesson } from '../../services/lesson';
import { getTeacherTrack } from '../../services/teacher';
import { generateSections as generateAiSections, generateQuiz as generateAiQuiz } from '../../services/ai';
import { createSection, updateSection, deleteSection } from '../../services/section';
import { createQuiz, updateQuiz, deleteQuiz } from '../../services/quiz';
import {
  Plus,
  Trash2,
  Save,
  ChevronLeft,
  FileText,
  HelpCircle,
  BookOpen,
  Languages,
  MessageSquare,
  Lightbulb,
  Sparkles,
  Loader2,
  Settings2,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  Target,
  Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import QuizQuestionModal from '../../components/teacher/QuizQuestionModal';
import ConfirmModal from '../../components/ConfirmModal';

const LessonContentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sections');

  // Modals state
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, type: 'section' });
  const [fullTrack, setFullTrack] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    fetchLesson();
    fetchFullTrack();
  }, [id]);

  const fetchFullTrack = async () => {
    try {
      const res = await getTeacherTrack();
      setFullTrack(res.data.track);
    } catch {}
  };

  const fetchLesson = async () => {
    try {
      const res = await getLessonById(id);
      setLesson(res.data.lesson);
    } catch {
      // Interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async (type = 'explanation') => {
    setIsActionLoading(true);
    try {
      const order = (lesson.sections?.length || 0) + 1;
      await createSection({
        lesson: id,
        title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        objective: lesson.objective || 'Educational objective',
        order,
        contentBlocks: [{
          type: type,
          payload: { text: '' }
        }]
      });
      toast.success('Block added');
      fetchLesson();
    } catch {
      // Interceptor
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteSection = async () => {
    const { id: sectionId } = confirmDelete;
    setIsActionLoading(true);
    try {
      await deleteSection(sectionId);
      toast.success("Section removed");
      setConfirmDelete({ isOpen: false });
      fetchLesson();
    } catch {
      // Interceptor
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateSectionText = async (section, text) => {
    try {
      // For simplicity, we update the first content block
      const updatedBlocks = [...(section.contentBlocks || [])];
      if (updatedBlocks.length === 0) {
        updatedBlocks.push({ type: 'explanation', payload: { text } });
      } else {
        updatedBlocks[0].payload = { ...updatedBlocks[0].payload, text };
      }

      await updateSection(section._id, { contentBlocks: updatedBlocks });
      toast.success("Saved");
      fetchLesson();
    } catch {
      // Interceptor
    }
  };

  const handleToggleSectionStatus = async (sectionId, currentStatus) => {
    try {
      await updateSection(sectionId, { isActive: !currentStatus });
      toast.success(`Section ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchLesson();
    } catch {}
  };

  const handleAiSynthesis = async () => {
    setIsActionLoading(true);
    const toastId = toast.loading("AI is generating 10 sections... This may take a moment.");
    try {
      await generateAiSections({ lessonId: id, maxSections: 10 });
      toast.success("Curriculum generated successfully!", { id: toastId });
      fetchLesson();
    } catch (error) {
      toast.error("AI generation failed. Please try again.", { id: toastId });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAiQuizGeneration = async () => {
    setIsActionLoading(true);
    const toastId = toast.loading("AI is generating 30 quiz questions... This may take a moment.");
    try {
      await generateAiQuiz({ lessonId: id });
      toast.success("Quiz pool generated successfully!", { id: toastId });
      fetchLesson();
    } catch (error) {
      toast.error("AI quiz generation failed. Please try again.", { id: toastId });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSaveQuizQuestion = async (formData) => {
    setIsActionLoading(true);
    try {
      // Check if quiz exists for this level (or lesson)
      // For simplicity, we add to lesson.quizPool if available
      const nextLevel = lesson.level?._id || lesson.level;
      await updateQuiz(lesson.level?._id, {
         questionPool: [...(lesson.quizPool || []), formData]
      });
      toast.success("Question added to quiz pool!");
      setIsQuizModalOpen(false);
      fetchLesson();
    } catch (err) {
      // If quiz doesn't exist, create it
      try {
        await createQuiz({
          level: lesson.level?._id || lesson.level,
          questionPool: [formData]
        });
        toast.success("Quiz created and question added!");
        setIsQuizModalOpen(false);
        fetchLesson();
      } catch (e) {}
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
    </div>
  );

  if (!lesson) return <div className="text-center py-20 text-slate-500">Lesson not found.</div>;

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {/* Curriculum Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-80' : 'w-0 -translate-x-full'}`}>
        <div className="h-full flex flex-col p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" /> Curriculum
            </h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
              <PanelLeftClose size={18} className="text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            {fullTrack?.levels.map((level) => (
              <div key={level._id} className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-2">
                   Level {level.levelNumber}
                </div>
                <div className="space-y-1">
                  {level.lessons.map((ls) => (
                    <button
                      key={ls._id}
                      onClick={() => navigate(`/teacher/edit-lesson/${ls._id}`)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${ls._id === id ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 border border-indigo-100 dark:border-indigo-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${ls._id === id ? 'bg-indigo-600 shadow-sm shadow-indigo-500/50' : 'bg-slate-200'}`} />
                      <span className="text-xs font-bold truncate">{ls.title}</span>
                      {ls._id === id && <ChevronRight size={14} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-0'}`}>
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-8 left-8 z-[60] w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl text-indigo-600 hover:scale-105 transition-all animate-in fade-in zoom-in"
          >
            <PanelLeftOpen size={20} />
          </button>
        )}

        <div className="max-w-5xl mx-auto px-8 py-12 space-y-8 pb-32">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/teacher/edit-track')}
                className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm active:scale-95"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{lesson.title}</h1>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-tighter border border-indigo-100 dark:border-indigo-900/50">
                    Lesson Editor
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-1">Curating knowledge blocks and knowledge checks.</p>
              </div>
            </div>
          </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur border border-slate-100 dark:border-slate-800 rounded-[1.5rem] w-fit">
        {[
          { id: 'sections', label: 'Knowledge Blocks', icon: FileText },
          { id: 'quiz', label: 'Knowledge Check', icon: HelpCircle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-md ring-1 ring-black/5'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'sections' ? (
        <div className="space-y-6">
          {lesson.sections?.length > 0 ? (
            lesson.sections.sort((a,b) => a.order - b.order).map((section) => (
              <div key={section._id} className={`bg-white dark:bg-slate-900 border ${section.isActive ? 'border-slate-200 dark:border-slate-800' : 'border-rose-100 dark:border-rose-900/30 opacity-75'} rounded-[2.5rem] p-8 shadow-sm group hover:border-indigo-200 transition-all`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 flex items-center justify-center">
                      {section.contentBlocks?.[0]?.type === 'translation' ? <Languages size={20} /> : section.contentBlocks?.[0]?.type === 'example' ? <MessageSquare size={20} /> : section.contentBlocks?.[0]?.type === 'hint' ? <Lightbulb size={20} /> : <BookOpen size={20} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <input
                          className="font-black text-slate-900 dark:text-white bg-transparent border-none focus:ring-0 outline-none text-lg p-0"
                          defaultValue={section.title}
                          onBlur={(e) => updateSection(section._id, { title: e.target.value })}
                          placeholder="Block Title..."
                        />
                        {!section.isActive && (
                          <span className="flex items-center gap-1 text-[8px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                            <EyeOff size={10} /> Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        {section.contentBlocks?.[0]?.type || 'explanation'} BLOCK • ORDER {section.order}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => handleToggleSectionStatus(section._id, section.isActive)}
                      className={`p-2 rounded-xl transition-all ${section.isActive ? 'text-slate-300 hover:text-rose-500' : 'text-emerald-500'}`}
                      title={section.isActive ? "Deactivate" : "Activate"}
                    >
                      {section.isActive ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ isOpen: true, id: section._id, type: 'section' })}
                      className="p-2 text-slate-300 hover:text-rose-500 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <textarea
                  className="w-full min-h-[150px] p-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none font-medium text-slate-700 dark:text-slate-300"
                  defaultValue={section.contentBlocks?.[0]?.payload?.text || ''}
                  onBlur={(e) => handleUpdateSectionText(section, e.target.value)}
                  placeholder="Enter the lesson content here..."
                />
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
              <FileText className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Empty Lesson</h3>
              <p className="text-slate-500 font-medium mt-2">Start adding knowledge blocks below to build your curriculum.</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-6">
            {[
              { type: 'explanation', icon: BookOpen, label: 'Explanation', bg: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20', border: 'hover:border-indigo-200' },
              { type: 'translation', icon: Languages, label: 'Translation', bg: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20', border: 'hover:border-emerald-200' },
              { type: 'example', icon: MessageSquare, label: 'Example', bg: 'hover:bg-amber-50 dark:hover:bg-amber-900/20', border: 'hover:border-amber-200' },
              { type: 'hint', icon: Lightbulb, label: 'Hint', bg: 'hover:bg-rose-50 dark:hover:bg-rose-900/20', border: 'hover:border-rose-200' },
              { type: 'ai', icon: Sparkles, label: 'AI Synthesis', special: true },
            ].map(item => (
              <button
                key={item.type}
                onClick={() => item.type === 'ai' ? handleAiSynthesis() : handleAddSection(item.type)}
                className={`flex flex-col items-center justify-center gap-4 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 transition-all active:scale-95 ${item.special ? 'bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white border-none shadow-xl shadow-indigo-500/20 hover:scale-105' : `${item.bg} ${item.border}`}`}
              >
                <item.icon size={32} className={item.special ? 'animate-pulse' : ''} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${item.special ? 'text-white' : ''}`}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-500 flex items-center justify-center shadow-inner">
                 <HelpCircle className="w-5 h-5" />
               </div>
               <div>
                 <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Question Pool</h2>
                 <p className="text-xs font-medium text-slate-500">Managing {lesson.quizPool?.length || 0} questions for this level.</p>
               </div>
             </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAiQuizGeneration}
                  disabled={isActionLoading}
                  className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles size={16} /> AI Generate
                </button>
                <button
                  onClick={() => setIsQuizModalOpen(true)}
                  className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95"
                >
                  <Plus size={16} /> Add Question
                </button>
              </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {lesson.quizPool?.length > 0 ? (
              lesson.quizPool.map((q, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between group hover:border-indigo-200 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{q.questionText}</p>
                      <div className="flex items-center gap-3 mt-1">
                         <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{q.difficulty}</span>
                         <span className="text-[10px] text-slate-300">•</span>
                         <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{q.correctAnswer}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                      <Settings2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 text-center bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                <HelpCircle className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white">No Quiz Data</h3>
                <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">This lesson doesn't have a knowledge check yet. Questions added here will appear in the level-end quiz.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <QuizQuestionModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onSave={handleSaveQuizQuestion}
        isLoading={isActionLoading}
      />

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
        onConfirm={handleDeleteSection}
        title="Delete Content Block?"
        message="This will permanently remove this knowledge block and all its content from the lesson."
        isLoading={isActionLoading}
      />

      {/* Global Action Loading Overlay */}
      {isActionLoading && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-white/40 dark:bg-slate-950/40 backdrop-blur-[2px]">
           <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
              <p className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-widest">Processing...</p>
           </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default LessonContentEditor;
