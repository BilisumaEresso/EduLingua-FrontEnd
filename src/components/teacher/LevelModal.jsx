import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { Layers, Save, Loader2 } from 'lucide-react';

const LevelModal = ({ isOpen, onClose, onSave, level = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'beginner',
    levelNumber: 1
  });

  useEffect(() => {
    if (level) {
      setFormData({
        title: level.title || '',
        description: level.description || '',
        difficulty: level.difficulty || 'beginner',
        levelNumber: level.levelNumber || 1
      });
    } else {
      setFormData({
        title: '',
        description: '',
        difficulty: 'beginner',
        levelNumber: 1
      });
    }
  }, [level, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const footer = (
    <>
      <button
        onClick={onClose}
        disabled={isLoading}
        className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
      >
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {level ? 'Update Level' : 'Create Level'}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={level ? `Edit Level ${level.levelNumber}` : 'Add New Level'}
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 mb-2">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Configuration</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Set the core properties of this level.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Level Number</label>
            <input
              type="number"
              min="1"
              max="5"
              required
              value={formData.levelNumber}
              onChange={(e) => setFormData({ ...formData, levelNumber: parseInt(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Difficulty</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <option value="beginner">Beginner</option>
              <option value="elementary">Elementary</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Title</label>
          <input
            type="text"
            required
            placeholder="e.g., Basic Greetings"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Description (Optional)</label>
          <textarea
            placeholder="What will students learn in this level?"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
          />
        </div>
      </form>
    </Modal>
  );
};

export default LevelModal;
