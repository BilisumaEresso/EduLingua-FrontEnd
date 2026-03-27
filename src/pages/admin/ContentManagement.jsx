import { useState, useEffect } from 'react';
import { 
  BookOpen, Globe, Layers, Book, Plus, 
  Edit2, Trash2, Loader2, Save, X, 
  ChevronRight, ArrowLeft, Filter, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Services
import { getAllLanguages, addLanguage, updateLanguage, deleteLanguage } from '../../services/language';
import { getAllLearnings, createLearning, updateLearning, deleteLearning } from '../../services/learning';
import { getAllLevels, createLevel, updateLevel, deleteLevel } from '../../services/level';
import { getAllLessons, createLesson, updateLesson, deleteLesson } from '../../services/lesson';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('languages'); // languages, learnings, levels, lessons
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Selection state for hierarchical filtering
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  // Form State
  const [formData, setFormData] = useState({});

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
      } else if (activeTab === 'levels') {
        res = await getAllLevels(selectedTrack ? { learningId: selectedTrack } : {});
        setData(res?.data?.levels || res?.data || []);
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
      ...(activeTab === 'learnings' && selectedLang ? { language: selectedLang } : {}),
      ...(activeTab === 'levels' && selectedTrack ? { learning: selectedTrack } : {}),
      ...(activeTab === 'lessons' && selectedLevel ? { level: selectedLevel } : {}),
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
                   {/* This would ideally come from a cached list of languages */}
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
                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{item.name || item.title}</h4>
                        <p className="text-xs text-slate-500 truncate">{item.description || item.code || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
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

                  {activeTab === 'languages' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Language Code (e.g., en, fr)</label>
                      <input 
                        required
                        type="text" 
                        value={formData.code || ''}
                        onChange={e => setFormData({...formData, code: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                    <textarea 
                      rows={3}
                      value={formData.description || ''}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                    />
                  </div>

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
