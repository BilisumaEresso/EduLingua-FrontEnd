import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { BookOpen, Save, Loader2, Target, FileText } from 'lucide-react';

const LessonModal = ({ isOpen, onClose, onSave, lesson = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objective: ''
  });

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title || '',
        description: lesson.description || '',
        objective: lesson.objective || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        objective: ''
      });
    }
  }, [lesson, isOpen]);

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
        {lesson ? 'Update Lesson' : 'Create Lesson'}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lesson ? `Edit Lesson: ${lesson.title}` : 'Add New Lesson'}
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 mb-2">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Lesson Context</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Define what students will study in this unit.</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Lesson Title</label>
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              placeholder="e.g., Basic Verbs & Sentence Structure"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Objective</label>
          <div className="relative">
            <Target className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
            <textarea
              required
              placeholder="What is the goal of this lesson?"
              rows={2}
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Description (Optional)</label>
          <textarea
            placeholder="Provide additional details or context..."
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

export default LessonModal;
