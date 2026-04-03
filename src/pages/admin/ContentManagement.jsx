import {
  BookOpen, Globe, Layers, Book, Plus,
  Edit2, Trash2, Loader2, Save, X,
  ChevronRight, ArrowLeft, Filter, AlertCircle,
  Eye, EyeOff, ToggleLeft as Toggle, Sparkles, Brain, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import aiService from '../../services/ai.js';
import { createSectionsBulk } from '../../services/section.js';

// Services
import { addLanguage, updateLanguage, deleteLanguage } from '../../services/language';
import { getAllLanguages} from '../../services/admin';
import { getAllLearnings, createLearning, updateLearning, deleteLearning } from '../../services/learning';
import { getAllLevels, createLevel, updateLevel, deleteLevel } from '../../services/level';
import { getAllLessons, createLesson, updateLesson, deleteLesson } from '../../services/lesson';
import { getAllSections, createSection, updateSection, deleteSection } from '../../services/section';
import { getAllQuizzes, createQuiz, updateQuiz, deleteQuiz, saveQuiz } from '../../services/quiz';
import { useState,useEffect } from 'react';

const ContentManagement = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('languages'); // languages, learnings, levels, lessons
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const [languages, setLanguages] = useState([]);
  const [learningsList, setLearningsList] = useState([]);
  const [levelsList, setLevelsList] = useState([]);
  const [lessonsList, setLessonsList] = useState([]);
  const [quizzesList, setQuizzesList] = useState([]);

  // Selection state for hierarchical filtering
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');

  // Form State
  const [formData, setFormData] = useState({});

  // AI Modal/Status State
  const [showAIModal, setShowAIModal] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [generatedSections, setGeneratedSections] = useState([]);
  const [generatedQuizQuestions, setGeneratedQuizQuestions] = useState([]);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    // Fetch base data for dropdowns
    const fetchBaseData = async () => {
      try {
        const langRes = await getAllLanguages();
        setLanguages(langRes?.data?.langs || langRes?.data || []);

        if (activeTab !== 'languages') {
          const learnRes = await getAllLearnings();
          setLearningsList(learnRes?.data?.learnings || learnRes?.data || []);

          if (activeTab === 'lessons' || activeTab === 'sections') {
            const levelRes = await getAllLevels();
            setLevelsList(levelRes?.data?.levels || levelRes?.data || []);

            if (activeTab === 'sections') {
              const lessonRes = await getAllLessons();
              setLessonsList(lessonRes?.data?.lessons || lessonRes?.data || []);
            }
            if (activeTab === 'quizzes') {
               // No longer need lessons for quizzes tab, we filter by level
            }
          }
        }
      } catch (e) {
        console.error("Baseline fetch failed:", e);
      }
    };
    fetchBaseData();
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedLang, selectedTrack, selectedLevel, selectedLesson]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'languages') {
        res = await getAllLanguages();
        setData(res?.data?.langs || res?.data || []);
      } else if (activeTab === 'learnings') {
        res = await getAllLearnings();
        const learnings = res?.data?.learnings || res?.data || [];
        setData(selectedLang ? learnings.filter(l => (l.language?._id || l.language) === selectedLang) : learnings);
        console.log(res?.data?.learnings || res?.data || [])
      } else if (activeTab === 'levels') {
        res = await getAllLevels(selectedTrack ? { learningId: selectedTrack } : {});
        setData(res?.data?.levels || res?.data || []);
        console.log(res?.data?.levels || res?.data || [])
      } else if (activeTab === 'lessons') {
        res = await getAllLessons(selectedLevel 
          ? { levelId: selectedLevel, activeOnly: false } 
          : { activeOnly: false }
        );
        setData(res?.data?.lessons || res?.data || []);
      } else if (activeTab === 'sections') {
        res = await getAllSections(selectedLesson ? { lessonId: selectedLesson } : {});
        setData(res?.data?.sections || res?.data || []);
      } else if (activeTab === 'quizzes') {
        res = await getAllQuizzes(selectedLevel ? { levelId: selectedLevel } : {});
        setData(res?.data?.quizzes || res?.data || []);
      }
    } catch (error) {
      console.error(`Failed to fetch ${activeTab}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'languages') {
        if (editingItem) await updateLanguage(editingItem._id, formData);
        else await addLanguage(formData);
      } else if (activeTab === 'learnings') {
        if (editingItem) await updateLearning(editingItem._id, formData);
        else await createLearning(formData);
      } else if (activeTab === 'levels') {
        if (editingItem) await updateLevel(editingItem._id, formData);
        else await createLevel(formData);
      } else if (activeTab === 'lessons') {
        if (editingItem) await updateLesson(editingItem._id, formData);
        else await createLesson(formData);
      } else if (activeTab === 'sections') {
        if (editingItem) await updateSection(editingItem._id, formData);
        else await createSection(formData);
      } else if (activeTab === 'quizzes') {
        if (editingItem) await updateQuiz(editingItem._id, formData);
        else await saveQuiz(formData);
      }
      setEditingItem(null);
      setIsAdding(false);
      setFormData({});
      fetchData();
    } catch (error) {
      alert("Save failed: " + (error.response?.data?.message || "Error"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) return;
    try {
      if (activeTab === 'languages') await deleteLanguage(id);
      else if (activeTab === 'learnings') await deleteLearning(id);
      else if (activeTab === 'levels') await deleteLevel(id);
      else if (activeTab === 'lessons') await deleteLesson(id);
      else if (activeTab === 'sections') await deleteSection(id);
      else if (activeTab === 'quizzes') await deleteQuiz(id);
      fetchData();
    } catch (error) {
      alert("Delete failed.");
    }
  };

   const toggleLanguageStatus = async (lang) => {
    if (user?.role !== 'super-admin') return;
    try {
      setProcessingId(lang._id);
      await updateLanguage(lang._id, { isActive: !lang.isActive });
      fetchData();
    } catch (error) {
      alert("Toggle failed.");
    } finally {
      setProcessingId(null);
    }
  };

  const [processingId, setProcessingId] = useState(null);

  const startEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingItem(null);
    // Pre-fill relation IDs if filtered
    setFormData({
      ...(activeTab === 'learnings' && selectedLang ? { targetLanguage: selectedLang } : {}),
      ...(activeTab === 'levels' && selectedTrack ? { learning: selectedTrack } : {}),
      ...(activeTab === 'lessons' && selectedLevel ? { level: selectedLevel } : {}),
      ...(activeTab === 'sections' && selectedLesson ? { lesson: selectedLesson } : {}),
      ...(activeTab === 'learnings' ? { aiConfig: { difficultyCurve: 'linear' }, isActive: true } : {}),
      ...(activeTab === 'levels' ? { difficulty: 'beginner', unlockCondition: { minScore: 70, requiredLessonsCompleted: 0 }, aiConfig: { focusAreas: [], complexityBoost: 1 }, isActive: true } : {}),
      ...(activeTab === 'lessons' ? { aiContext: { difficulty: 'easy', generated: false }, isActive: false, teacher: user._id } : {}),
      ...(activeTab === 'sections' ? { contentBlocks: [], skills: [], isActive: true } : {}),
      ...(activeTab === 'quizzes' ? { questionPool: [], passingScore: 80, level: selectedLevel } : {}),
    });
  };

  const handleGenerateAISections = async () => {
    if (!editingItem?._id) return;
    setGeneratingAI(true);
    try {
      const res = await aiService.generateSections({ lessonId: editingItem._id, maxSections: 10 });
      setGeneratedSections(res?.data?.sections || res?.sections || []);
      setShowAIModal(true);
    } catch (error) {
      alert("AI Generation failed: " + (error.response?.data?.message || "Error"));
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSaveGeneratedSections = async () => {
    if (generatedSections.length === 0) return;
    setSaveLoading(true);
    try {
      await createSectionsBulk({
        lessonId: editingItem._id,
        sections: generatedSections
      });
      setShowAIModal(false);
      setGeneratedSections([]);
      alert("Sections saved successfully!");
    } catch (error) {
      alert("Failed to save sections: " + (error.response?.data?.message || "Error"));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveGeneratedQuiz = async () => {
    if (generatedQuizQuestions.length === 0) return;
    setSaveLoading(true);
    try {
      // Map AI fields to schema fields
      const mappedQuestions = generatedQuizQuestions.map(q => ({
        questionText: q.question,
        correctAnswer: q.answer,
        options: q.options || [],
        questionType: 'multiple_choice',
        difficulty: 'medium',
        skills: ['vocabulary'], // Default or derived
        isAiGenerated: true,
        section: null // Optional link
      }));

      await saveQuiz({
        lessonId: editingItem._id,
        questions: mappedQuestions
      });
      setShowAIModal(false);
      setGeneratedQuizQuestions([]);
      alert("Quiz questions saved successfully!");
      fetchData();
    } catch (error) {
      alert("Failed to save quiz: " + (error.response?.data?.message || "Error"));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleGenerateAIQuiz = async () => {
    if (!editingItem?._id) return;
    setGeneratingAI(true);
    try {
      const res = await aiService.generateQuiz({ lessonId: editingItem._id });
      // Controller returns { quiz: { questions: [...] } }
      const quizResult = res?.data?.quiz || res?.quiz;
      console.log(res)
      setGeneratedQuizQuestions(quizResult?.questions || []);
      setGeneratedSections([]);
      setShowAIModal(true);
    } catch (error) {
      alert("AI Quiz generation failed: " + (error.response?.data?.message || "Error"));
    } finally {
      setGeneratingAI(false);
    }
  };

  const tabs = [
    { id: 'languages', label: 'Languages', icon: Globe },
    { id: 'learnings', label: 'Tracks', icon: Layers },
    { id: 'levels', label: 'Levels', icon: BookOpen },
    { id: 'lessons', label: 'Lessons', icon: Book },
    { id: 'sections', label: 'Sections', icon: CheckCircle },
    { id: 'quizzes', label: 'Quizzes', icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Curriculum Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Structure the learning experience from languages down to individual lessons.</p>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add {activeTab.slice(0, -1)}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setEditingItem(null);
              setIsAdding(false);
            }}
            className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: List View */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters if not on languages tab */}
          {activeTab !== 'languages' && (
            <div className="flex flex-wrap gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mr-2">
                 <Filter className="w-3 h-3" /> Filter By:
               </div>
                {activeTab === 'learnings' && (
                  <select
                     value={selectedLang}
                     onChange={e => setSelectedLang(e.target.value)}
                     className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="">All Languages</option>
                    {languages.map(l => (
                      <option key={l._id} value={l._id}>{l.name}</option>
                    ))}
                  </select>
                )}
                {activeTab === 'levels' && (
                  <select
                     value={selectedTrack}
                     onChange={e => setSelectedTrack(e.target.value)}
                     className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="">All Tracks</option>
                    {learningsList.map(t => (
                      <option key={t._id} value={t._id}>{t.title}</option>
                    ))}
                  </select>
                )}
                {activeTab === 'lessons' && (
                  <select
                     value={selectedLevel}
                     onChange={e => setSelectedLevel(e.target.value)}
                     className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="">All Levels</option>
                    {levelsList.map(l => (
                      <option key={l._id} value={l._id}>L{l.levelNumber}: {l.title}</option>
                    ))}
                  </select>
                )}
                {activeTab === 'quizzes' && (
                  <select
                     value={selectedLevel}
                     onChange={e => setSelectedLevel(e.target.value)}
                     className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="">All Levels</option>
                    {levelsList.map(l => (
                      <option key={l._id} value={l._id}>L{l.levelNumber}: {l.title}</option>
                    ))}
                  </select>
                )}
               {/* Simplified selection for now */}
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>
            ) : data.length === 0 ? (
              <div className="py-20 text-center text-slate-400">No {activeTab} found.</div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.map((item) => (
                  <li key={item._id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                         {activeTab === 'languages' ? <Globe className="w-5 h-5 text-slate-400" /> : <Layers className="w-5 h-5 text-slate-400" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate">
                          {activeTab === 'languages' && item.metadata?.flag && <span className="mr-2">{item.metadata.flag}</span>}
                          {activeTab === 'sections' && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 font-medium whitespace-nowrap text-xs">
                                [{lessonsList.find(l => l._id === (item.lesson?._id || item.lesson))?.title || 'Lesson'}] {item.order}.
                              </span>
                              <span className="font-bold text-slate-900 dark:text-white truncate">{item.title}</span>
                              {item.isActive === false && (
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded border border-slate-200">HIDDEN</span>
                              )}
                            </div>
                          )}
                          {activeTab === 'quizzes' && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 font-medium whitespace-nowrap text-xs">
                                [{levelsList.find(lvl => lvl._id === (item.level?._id || item.level))?.title || 'Level'}]
                              </span>
                              <span className="font-bold text-slate-900 dark:text-white truncate">{item.title}</span>
                            </div>
                          )}
                          {activeTab !== 'sections' && activeTab !== 'quizzes' && (item.title || item.name)}
                          {item.isActive === false && activeTab !== 'sections' && (
                             <span className="ml-2 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">HIDDEN</span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500 truncate mt-1">
                          {activeTab === 'learnings' ? (
                            `Target: ${languages.find(l => l._id === (item.targetLanguage?._id || item.targetLanguage))?.name || 'Unknown'}`
                          ) : activeTab === 'levels' ? (
                            `Difficulty: ${item.difficulty?.charAt(0).toUpperCase() + item.difficulty?.slice(1) || 'Unknown'} | Lessons: ${item.lessons?.length || 0}`
                          ) : activeTab === 'lessons' ? (
                            `Topic: ${item.aiContext?.topic || 'N/A'} | Difficulty: ${item.aiContext?.difficulty?.toUpperCase() || 'EASY'}`
                          ) : activeTab === 'sections' ? (
                             `Blocks: ${item.contentBlocks?.length || 0} | Skills: ${item.skills?.join(', ') || 'None'}`
                          ) : activeTab === 'quizzes' ? (
                             `Questions: ${item.questionPool?.length || 0} | Passing Score: ${item.passingScore || 80}%`
                          ) : (
                            item.description || item.code || 'No description'
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {activeTab === 'languages' && user?.role === 'super-admin' && (
                          <button
                            onClick={() => toggleLanguageStatus(item)}
                            disabled={processingId === item._id}
                            className={`p-2 rounded-lg transition-colors ${item.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                            title={item.isActive ? 'Deactivate Language' : 'Activate Language'}
                          >
                            {processingId === item._id ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                              item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button onClick={() => startEdit(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {activeTab === 'languages' && (
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm ${
                          item.isActive ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}>
                          {item.isActive ? 'Active' : 'Hidden'}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: Edit/Add Form */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {(isAdding || editingItem) ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md sticky top-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {editingItem ? `Edit ${activeTab.slice(0, -1)}` : `New ${activeTab.slice(0, -1)}`}
                  </h3>
                  <button onClick={() => { setIsAdding(false); setEditingItem(null); setFormData({}); }} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  {/* Common Fields */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{activeTab === 'languages' ? 'Name' : 'Title'}</label>
                    <input
                      required
                      type="text"
                      value={formData.name || formData.title || ''}
                      onChange={e => setFormData({...formData, [activeTab === 'languages' ? 'name' : 'title']: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                    />
                  </div>

                  {activeTab === 'levels' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Learning Track</label>
                        <select
                          required
                          value={formData.learning?._id || formData.learning || ''}
                          onChange={e => setFormData({...formData, learning: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                        >
                          <option value="">Select Track</option>
                          {learningsList.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Level Number (1-5)</label>
                          <input
                            required
                            type="number"
                            min="1"
                            max="5"
                            value={formData.levelNumber || ''}
                            onChange={e => setFormData({...formData, levelNumber: parseInt(e.target.value)})}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Display Order</label>
                          <input
                            required
                            type="number"
                            value={formData.order || ''}
                            onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Difficulty</label>
                        <select
                          required
                          value={formData.difficulty || 'beginner'}
                          onChange={e => setFormData({...formData, difficulty: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="elementary">Elementary</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="master">Master</option>
                        </select>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progression Rules</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Min Score (%)</label>
                            <input
                              type="number"
                              value={formData.unlockCondition?.minScore || 70}
                              onChange={e => setFormData({...formData, unlockCondition: { ...formData.unlockCondition, minScore: parseInt(e.target.value) }})}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Req. Lessons</label>
                            <input
                              type="number"
                              value={formData.unlockCondition?.requiredLessonsCompleted || 0}
                              onChange={e => setFormData({...formData, unlockCondition: { ...formData.unlockCondition, requiredLessonsCompleted: parseInt(e.target.value) }})}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI & Specialization</h4>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Focus Areas</label>
                          <div className="grid grid-cols-2 gap-2">
                            {['vocabulary', 'grammar', 'conversation', 'listening'].map(area => (
                              <label key={area} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.aiConfig?.focusAreas?.includes(area)}
                                  onChange={e => {
                                    const current = formData.aiConfig?.focusAreas || [];
                                    const next = e.target.checked ? [...current, area] : current.filter(a => a !== area);
                                    setFormData({...formData, aiConfig: { ...formData.aiConfig, focusAreas: next }});
                                  }}
                                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
                                />
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 capitalize">{area}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Complexity Boost</label>
                          <input
                            type="number"
                            step="0.1"
                            value={formData.aiConfig?.complexityBoost || 1}
                            onChange={e => setFormData({...formData, aiConfig: { ...formData.aiConfig, complexityBoost: parseFloat(e.target.value) }})}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <input
                          type="checkbox"
                          id="isLevelActive"
                          checked={formData.isActive !== false}
                          onChange={e => setFormData({...formData, isActive: e.target.checked})}
                          className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
                        />
                        <label htmlFor="isLevelActive" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                          Active & Visible to learners
                        </label>
                      </div>
                    </>
                  )}

                  {activeTab === 'lessons' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parent Level</label>
                        <select
                          required
                          value={formData.level?._id || formData.level || ''}
                          onChange={e => setFormData({...formData, level: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                        >
                          <option value="">Select Level</option>
                          {levelsList.map(l => <option key={l._id} value={l._id}>L{l.levelNumber}: {l.title}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Order inside Level</label>
                        <input
                          required
                          type="number"
                          value={formData.order || ''}
                          onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Learning Objective</label>
                        <textarea
                          required
                          rows={2}
                          value={formData.objective || ''}
                          onChange={e => setFormData({...formData, objective: e.target.value})}
                          placeholder="e.g. Learn basic greetings in daily conversation"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                        />
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI & Tutor Context</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Topic</label>
                            <input
                              required
                              type="text"
                              value={formData.aiContext?.topic || ''}
                              onChange={e => setFormData({...formData, aiContext: { ...formData.aiContext, topic: e.target.value }})}
                              placeholder="e.g. Greetings"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">AI Difficulty</label>
                            <select
                              value={formData.aiContext?.difficulty || 'easy'}
                              onChange={e => setFormData({...formData, aiContext: { ...formData.aiContext, difficulty: e.target.value }})}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teacher Specific Instruction</label>
                          <textarea
                            rows={3}
                            value={formData.aiContext?.teacherPrompt || ''}
                            onChange={e => setFormData({...formData, aiContext: { ...formData.aiContext, teacherPrompt: e.target.value }})}
                            placeholder="Specific instructions for the AI tutor during this lesson..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <input
                          type="checkbox"
                          id="isLessonActive"
                          checked={formData.isActive || false}
                          onChange={e => setFormData({...formData, isActive: e.target.checked})}
                          className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
                        />
                        <label htmlFor="isLessonActive" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                          Lesson Active & Visible
                        </label>
                      </div>

                      {editingItem && (
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">AI Content Power-Ups</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={handleGenerateAISections}
                              disabled={generatingAI}
                              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all border border-indigo-100 dark:border-indigo-900/20"
                            >
                              {generatingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                              Generate Sections
                            </button>
                            <button
                              type="button"
                              onClick={handleGenerateAIQuiz}
                              disabled={generatingAI}
                              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-900/40 text-fuchsia-600 dark:text-fuchsia-400 font-bold text-xs hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/60 transition-all border border-fuchsia-100 dark:border-fuchsia-900/20"
                            >
                              {generatingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />}
                              Generate Quiz
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-400 text-center">AI uses lesson objective & topic to build curriculum.</p>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === 'quizzes' && (
                     <>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parent Level</label>
                          <select
                            required
                            value={formData.level?._id || formData.level || ''}
                            onChange={e => setFormData({...formData, level: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                          >
                            <option value="">Select Level</option>
                            {levelsList.map(lvl => (
                              <option key={lvl._id} value={lvl._id}>
                                L{lvl.levelNumber}: {lvl.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Passing Score (%)</label>
                          <input
                            required
                            type="number"
                            min="0"
                            max="100"
                            value={formData.passingScore || 80}
                            onChange={e => setFormData({...formData, passingScore: parseInt(e.target.value)})}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                          />
                        </div>

                        {/* Question Pool Editor */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question Pool</h4>
                            <button
                              type="button"
                              onClick={() => {
                                const current = formData.questionPool || [];
                                setFormData({
                                  ...formData,
                                  questionPool: [...current, {
                                    questionText: '',
                                    questionType: 'multiple_choice',
                                    options: ['', '', '', ''],
                                    correctAnswer: '',
                                    difficulty: 'easy',
                                    skills: [],
                                    isAiGenerated: false
                                  }]
                                });
                              }}
                              className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add Question
                            </button>
                          </div>

                          <div className="space-y-4">
                            {formData.questionPool?.map((q, qIdx) => (
                              <div key={qIdx} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 space-y-3 relative group/qbox">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...formData.questionPool];
                                    next.splice(qIdx, 1);
                                    setFormData({...formData, questionPool: next});
                                  }}
                                  className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover/qbox:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>

                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-bold text-slate-400">{qIdx + 1}</span>
                                  <select
                                    value={q.questionType}
                                    onChange={e => {
                                      const next = [...formData.questionPool];
                                      next[qIdx].questionType = e.target.value;
                                      setFormData({...formData, questionPool: next});
                                    }}
                                    className="text-[10px] font-bold bg-transparent border-none text-indigo-600 uppercase tracking-widest p-0 cursor-pointer focus:ring-0"
                                  >
                                    <option value="multiple_choice">Multiple Choice</option>
                                    <option value="text_input">Text Input</option>
                                    <option value="voice_match">Voice Match</option>
                                  </select>
                                </div>

                                <textarea
                                  value={q.questionText || ''}
                                  onChange={e => {
                                    const next = [...formData.questionPool];
                                    next[qIdx].questionText = e.target.value;
                                    setFormData({...formData, questionPool: next});
                                  }}
                                  placeholder="Question text..."
                                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border-none rounded-lg focus:ring-1 focus:ring-indigo-500"
                                  rows={2}
                                />

                                {q.questionType === 'multiple_choice' && (
                                  <div className="grid grid-cols-2 gap-2">
                                    {(q.options || ['', '', '', '']).map((opt, oIdx) => (
                                      <input
                                        key={oIdx}
                                        type="text"
                                        value={opt}
                                        onChange={e => {
                                          const next = [...formData.questionPool];
                                          const nextOpts = [...(next[qIdx].options || ['', '', '', ''])];
                                          nextOpts[oIdx] = e.target.value;
                                          next[qIdx].options = nextOpts;
                                          setFormData({...formData, questionPool: next});
                                        }}
                                        placeholder={`Option ${oIdx + 1}`}
                                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border-none rounded-lg focus:ring-1 focus:ring-indigo-500"
                                      />
                                    ))}
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={q.correctAnswer || ''}
                                    onChange={e => {
                                      const next = [...formData.questionPool];
                                      next[qIdx].correctAnswer = e.target.value;
                                      setFormData({...formData, questionPool: next});
                                    }}
                                    placeholder="Correct Answer"
                                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/30 rounded-lg focus:ring-1 focus:ring-emerald-500"
                                  />
                                  <select
                                    value={q.difficulty || 'easy'}
                                    onChange={e => {
                                      const next = [...formData.questionPool];
                                      next[qIdx].difficulty = e.target.value;
                                      setFormData({...formData, questionPool: next});
                                    }}
                                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border-none rounded-lg focus:ring-1 focus:ring-indigo-500"
                                  >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                  </select>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                  <div className="flex flex-wrap gap-2">
                                    {['vocabulary', 'grammar', 'conversation', 'listening'].map(skill => (
                                      <label key={skill} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={q.skills?.includes(skill)}
                                          onChange={e => {
                                            const next = [...formData.questionPool];
                                            const currentSkills = next[qIdx].skills || [];
                                            next[qIdx].skills = e.target.checked
                                              ? [...currentSkills, skill]
                                              : currentSkills.filter(s => s !== skill);
                                            setFormData({...formData, questionPool: next});
                                          }}
                                          className="w-3 h-3 rounded text-rose-500 focus:ring-rose-500"
                                        />
                                        <span className="text-[9px] font-bold text-slate-500 uppercase">{skill}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                     </>
                   )}

                  {activeTab === 'learnings' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Source Language</label>
                          <select
                            required
                            value={formData.sourceLanguage?._id || formData.sourceLanguage || ''}
                            onChange={e => setFormData({...formData, sourceLanguage: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                          >
                            <option value="">Select Source</option>
                            {languages.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Language</label>
                          <select
                            required
                            value={formData.targetLanguage?._id || formData.targetLanguage || ''}
                            onChange={e => setFormData({...formData, targetLanguage: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                          >
                            <option value="">Select Target</option>
                            {languages.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">AI Configuration</h4>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teacher Base Prompt</label>
                          <textarea
                            rows={3}
                            value={formData.aiConfig?.basePrompt || ''}
                            onChange={e => setFormData({...formData, aiConfig: { ...formData.aiConfig, basePrompt: e.target.value }})}
                            placeholder="Instruct the AI on how to teach this language..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                          />
                        </div>
                        <div className="mt-4">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Difficulty Curve</label>
                          <select
                            value={formData.aiConfig?.difficultyCurve || 'linear'}
                            onChange={e => setFormData({...formData, aiConfig: { ...formData.aiConfig, difficultyCurve: e.target.value }})}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                          >
                            <option value="linear">Linear (Fixed pacing)</option>
                            <option value="adaptive">Adaptive (AI Dynamic)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <input
                          type="checkbox"
                          id="isLearningActive"
                          checked={formData.isActive !== false}
                          onChange={e => setFormData({...formData, isActive: e.target.checked})}
                          className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
                        />
                        <label htmlFor="isLearningActive" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                          Active & Enrollment Open
                        </label>
                      </div>
                    </>
                  )}

                   {activeTab === 'sections' && (
                     <>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parent Lesson</label>
                          <select
                            required
                            value={formData.lesson?._id || formData.lesson || ''}
                            onChange={e => setFormData({...formData, lesson: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                          >
                            <option value="">Select Lesson</option>
                            {lessonsList.map(l => <option key={l._id} value={l._id}>{l.title}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Order</label>
                            <input
                              required
                              type="number"
                              value={formData.order || ''}
                              onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">AI Difficulty</label>
                             <select
                                value={formData.aiMeta?.difficulty || 'beginner'}
                                onChange={e => setFormData({...formData, aiMeta: { ...formData.aiMeta, difficulty: e.target.value }})}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                              >
                                <option value="beginner">Beginner</option>
                                <option value="elementary">Elementary</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                              </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Learning Objective</label>
                          <input
                            required
                            type="text"
                            value={formData.objective || ''}
                            onChange={e => setFormData({...formData, objective: e.target.value})}
                            placeholder="Objective for this section..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                          />
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skills Targeted</h4>
                          <div className="flex flex-wrap gap-2">
                             {['vocabulary', 'grammar', 'conversation', 'listening'].map(skill => (
                               <label key={skill} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
                                 <input
                                   type="checkbox"
                                   checked={formData.skills?.includes(skill)}
                                   onChange={e => {
                                     const current = formData.skills || [];
                                     const next = e.target.checked ? [...current, skill] : current.filter(s => s !== skill);
                                     setFormData({...formData, skills: next});
                                   }}
                                   className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
                                 />
                                 <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 capitalize">{skill}</span>
                               </label>
                             ))}
                          </div>
                        </div>

                        {/* Content Blocks Editor */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Content Blocks</h4>
                            <button
                              type="button"
                              onClick={() => {
                                const current = formData.contentBlocks || [];
                                setFormData({...formData, contentBlocks: [...current, { type: 'explanation', payload: { text: '' } }]});
                              }}
                              className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add Block
                            </button>
                          </div>

                          <div className="space-y-4">
                            {formData.contentBlocks?.map((block, bIdx) => (
                              <div key={bIdx} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 space-y-3 relative group/block">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...formData.contentBlocks];
                                    next.splice(bIdx, 1);
                                    setFormData({...formData, contentBlocks: next});
                                  }}
                                  className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500 outline-none"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>

                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-bold text-slate-400">{bIdx + 1}</span>
                                  <select
                                    value={block.type}
                                    onChange={e => {
                                      const next = [...formData.contentBlocks];
                                      next[bIdx].type = e.target.value;
                                      setFormData({...formData, contentBlocks: next});
                                    }}
                                    className="text-[10px] font-bold bg-transparent border-none text-indigo-600 uppercase tracking-widest p-0 cursor-pointer focus:ring-0"
                                  >
                                    <option value="explanation">Explanation</option>
                                    <option value="translation">Translation</option>
                                    <option value="example">Example</option>
                                    <option value="exercise">Exercise</option>
                                    <option value="pronunciation">Pronunciation</option>
                                    <option value="hint">Hint</option>
                                  </select>
                                </div>

                                {block.type === 'explanation' && (
                                  <textarea
                                    value={block.payload?.text || ''}
                                    onChange={e => {
                                      const next = [...formData.contentBlocks];
                                      next[bIdx].payload = { ...next[bIdx].payload, text: e.target.value };
                                      setFormData({...formData, contentBlocks: next});
                                    }}
                                    placeholder="Explanation text..."
                                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border-none rounded-lg focus:ring-1 focus:ring-indigo-500"
                                    rows={3}
                                  />
                                )}

                                {block.type === 'translation' && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      value={block.payload?.translations?.source || ''}
                                      onChange={e => {
                                        const next = [...formData.contentBlocks];
                                        next[bIdx].payload = { ...next[bIdx].payload, translations: { ...next[bIdx].payload.translations, source: e.target.value } };
                                        setFormData({...formData, contentBlocks: next});
                                      }}
                                      placeholder="Source (Native)"
                                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border-none rounded-lg focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <input
                                      type="text"
                                      value={block.payload?.translations?.target || ''}
                                      onChange={e => {
                                        const next = [...formData.contentBlocks];
                                        next[bIdx].payload = { ...next[bIdx].payload, translations: { ...next[bIdx].payload.translations, target: e.target.value } };
                                        setFormData({...formData, contentBlocks: next});
                                      }}
                                      placeholder="Target (Learning)"
                                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border-none rounded-lg focus:ring-1 focus:ring-indigo-500"
                                    />
                                  </div>
                                )}

                                {block.type === 'exercise' && (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={block.payload?.question || ''}
                                      onChange={e => {
                                        const next = [...formData.contentBlocks];
                                        next[bIdx].payload = { ...next[bIdx].payload, question: e.target.value };
                                        setFormData({...formData, contentBlocks: next});
                                      }}
                                      placeholder="Exercise Question"
                                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border-none rounded-lg focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <input
                                      type="text"
                                      value={block.payload?.answer || ''}
                                      onChange={e => {
                                        const next = [...formData.contentBlocks];
                                        next[bIdx].payload = { ...next[bIdx].payload, answer: e.target.value };
                                        setFormData({...formData, contentBlocks: next});
                                      }}
                                      placeholder="Correct Answer"
                                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border-none rounded-lg focus:ring-1 focus:ring-emerald-500"
                                    />
                                  </div>
                                )}

                                <p className="text-[9px] text-slate-400">Content block will appear in the specified order.</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                          <input
                            type="checkbox"
                            id="isSectionActiveForm"
                            checked={formData.isActive !== false}
                            onChange={e => setFormData({...formData, isActive: e.target.checked})}
                            className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
                          />
                          <label htmlFor="isSectionActiveForm" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                            Section Active & Visible
                          </label>
                        </div>
                     </>
                   )}
                   {activeTab === 'languages' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Native Name (e.g., አማርኛ)</label>
                        <input
                          required
                          type="text"
                          value={formData.nativeName || ''}
                          onChange={e => setFormData({...formData, nativeName: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Language Code (e.g., am, sw)</label>
                        <input
                          required
                          type="text"
                          value={formData.code || ''}
                          onChange={e => setFormData({...formData, code: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Direction</label>
                          <select
                            value={formData.direction || 'ltr'}
                            onChange={e => setFormData({...formData, direction: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                          >
                            <option value="ltr">LTR</option>
                            <option value="rtl">RTL</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Flag Emoji/URL</label>
                          <input
                            type="text"
                            value={formData.metadata?.flag || ''}
                            onChange={e => setFormData({...formData, metadata: { ...formData.metadata, flag: e.target.value }})}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Region (e.g., Ethiopia, East Africa)</label>
                      <input
                        type="text"
                        value={formData.metadata?.region || ''}
                        onChange={e => setFormData({...formData, metadata: { ...formData.metadata, region: e.target.value }})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                      />
                    </div>
                    {user?.role === 'super-admin' && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive || false}
                          onChange={e => setFormData({...formData, isActive: e.target.checked})}
                          className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
                        />
                        <label htmlFor="isActive" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                          Active & Visible to learners
                        </label>
                      </div>
                    )}
                  </>
                )}

                  {activeTab !== 'languages' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={formData.description || ''}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                      />
                    </div>
                  )}

                  {/* Hierarchical selection placeholders (logic would need more state) */}

                  <div className="pt-4 flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                      <Save className="w-4 h-4" /> Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-4 h-full min-h-[300px]">
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Plus className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-slate-500">Select an item to edit</p>
                  <p className="text-xs text-slate-400">or click "Add {activeTab.slice(0, -1)}" to create a new one.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AI Preview Modal */}
      <AnimatePresence>
        {showAIModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAIModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-950 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {generatedSections.length > 0 ? 'Review Generated Sections' : 'Review Quiz Questions'}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium tracking-tight">
                      AI has prepared {generatedSections.length || generatedQuizQuestions.length} items.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowAIModal(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {generatedSections.map((sec, idx) => (
                  <div key={idx} className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                    {/* ... (Existing section preview logic) ... */}
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm shadow-sm">{sec.order}</span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{sec.title}</h4>
                          <p className="text-[10px] text-slate-500 font-medium">{sec.objective}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {sec.skills?.map(s => (
                          <span key={s} className="text-[8px] font-bold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 px-1.5 py-0.5 rounded uppercase">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                       {sec.contentBlocks?.map((block, bIdx) => (
                         <div key={bIdx} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                               <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{block.type}</span>
                            </div>
                            {block.type === 'explanation' && <p className="text-xs text-slate-600 dark:text-slate-300">{block.payload?.text}</p>}
                            {block.type === 'translation' && (
                               <div className="flex items-center gap-3 text-xs italic">
                                  <span className="text-slate-400">{block.payload?.translations?.source}</span>
                                  <span className="text-slate-300">→</span>
                                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{block.payload?.translations?.target}</span>
                               </div>
                            )}
                            {block.type === 'exercise' && (
                               <div className="space-y-1">
                                  <p className="text-xs font-bold text-rose-600">{block.payload?.question}</p>
                                  <p className="text-[10px] text-emerald-600 font-medium italic">Answer: {block.payload?.answer}</p>
                               </div>
                            )}
                         </div>
                       ))}
                    </div>
                  </div>
                ))}

                {generatedQuizQuestions.map((q, idx) => (
                   <div key={idx} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                      <div className="flex items-center gap-3 mb-3">
                         <span className="w-6 h-6 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-[10px]">{idx + 1}</span>
                         <h4 className="font-bold text-sm text-slate-900 dark:text-white">{q.question}</h4>
                      </div>
                      <div className="pl-9 grid grid-cols-2 gap-2">
                         {q.options?.map((opt, oIdx) => (
                            <div key={oIdx} className={`px-3 py-1.5 rounded-lg text-[10px] border ${opt === q.answer ? 'bg-emerald-50 border-emerald-200 text-emerald-600 font-bold' : 'bg-white border-slate-100 text-slate-500'}`}>
                               {opt}
                            </div>
                         ))}
                      </div>
                   </div>
                ))}
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-4">
                <button
                  onClick={() => setShowAIModal(false)}
                  className="flex-1 py-3 px-6 rounded-2xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={generatedSections.length > 0 ? handleSaveGeneratedSections : handleSaveGeneratedQuiz}
                  disabled={saveLoading}
                  className="flex-2 py-3 px-6 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Save All {generatedSections.length > 0 ? 'Sections' : 'Questions'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentManagement;
