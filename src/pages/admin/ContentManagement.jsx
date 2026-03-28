import {
  BookOpen, Globe, Layers, Book, Plus,
  Edit2, Trash2, Loader2, Save, X,
  ChevronRight, ArrowLeft, Filter, AlertCircle,
  Eye, EyeOff, ToggleLeft as Toggle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';

// Services
import { addLanguage, updateLanguage, deleteLanguage } from '../../services/language';
import { getAllLanguages} from '../../services/admin';
import { getAllLearnings, createLearning, updateLearning, deleteLearning } from '../../services/learning';
import { getAllLevels, createLevel, updateLevel, deleteLevel } from '../../services/level';
import { getAllLessons, createLesson, updateLesson, deleteLesson } from '../../services/lesson';
import { useState,useEffect } from 'react';

const ContentManagement = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('languages'); // languages, learnings, levels, lessons
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // Selection state for hierarchical filtering
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  // Global Lists for selects
  const [languages, setLanguages] = useState([]);
  const [learningsList, setLearningsList] = useState([]);
  const [levelsList, setLevelsList] = useState([]);

  // Form State
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Fetch base data for dropdowns
    const fetchBaseData = async () => {
      try {
        const langRes = await getAllLanguages();
        setLanguages(langRes?.data?.langs || langRes?.data || []);

        if (activeTab !== 'languages') {
          const learnRes = await getAllLearnings();
          setLearningsList(learnRes?.data?.learnings || learnRes?.data || []);

          if (activeTab === 'lessons') {
            const levelRes = await getAllLevels();
            setLevelsList(levelRes?.data?.levels || levelRes?.data || []);
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
  }, [activeTab, selectedLang, selectedTrack, selectedLevel]);

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
        res = await getAllLessons(selectedLevel ? { levelId: selectedLevel } : {});
        setData(res?.data?.lessons || res?.data || []);
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
      ...(activeTab === 'learnings' ? { aiConfig: { difficultyCurve: 'linear' }, isActive: true } : {}),
      ...(activeTab === 'levels' ? { difficulty: 'beginner', unlockCondition: { minScore: 70, requiredLessonsCompleted: 0 }, aiConfig: { focusAreas: [], complexityBoost: 1 }, isActive: true } : {}),
      ...(activeTab === 'lessons' ? { aiContext: { difficulty: 'easy', generated: false }, isActive: false, teacher: user._id } : {}),
    });
  };

  const tabs = [
    { id: 'languages', label: 'Languages', icon: Globe },
    { id: 'learnings', label: 'Tracks', icon: Layers },
    { id: 'levels', label: 'Levels', icon: BookOpen },
    { id: 'lessons', label: 'Lessons', icon: Book },
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
                          {activeTab === 'learnings' && (
                            <span className="mr-2 text-slate-400 font-medium">
                              {languages.find(l => l._id === (item.sourceLanguage?._id || item.sourceLanguage))?.name || '—'} →
                            </span>
                          )}
                          {activeTab === 'levels' && (
                            <span className="mr-2 text-slate-400 font-medium whitespace-nowrap">
                              [{learningsList.find(t => t._id === (item.learning?._id || item.learning))?.title || 'Track'}] {item.levelNumber}.
                            </span>
                          )}
                          {activeTab === 'lessons' && (
                            <span className="mr-2 text-slate-400 font-medium whitespace-nowrap">
                              [{levelsList.find(l => l._id === (item.level?._id || item.level))?.title || 'Level'}] {item.order}.
                            </span>
                          )}
                          {item.title || item.name}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">
                          {activeTab === 'learnings' ? (
                            `Target: ${languages.find(l => l._id === (item.targetLanguage?._id || item.targetLanguage))?.name || 'Unknown'}`
                          ) : activeTab === 'levels' ? (
                            `Difficulty: ${item.difficulty?.charAt(0).toUpperCase() + item.difficulty?.slice(1) || 'Unknown'} | Lessons: ${item.lessons?.length || 0}`
                          ) : activeTab === 'lessons' ? (
                            `Topic: ${item.aiContext?.topic || 'N/A'} | Difficulty: ${item.aiContext?.difficulty?.toUpperCase() || 'EASY'}`
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
    </div>
  );
};

export default ContentManagement;
