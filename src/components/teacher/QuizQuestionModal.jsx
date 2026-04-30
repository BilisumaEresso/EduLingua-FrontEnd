import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { HelpCircle, Save, Loader2, List, CheckCircle2, X } from 'lucide-react';

const QuizQuestionModal = ({ isOpen, onClose, onSave, question = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'multiple_choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    difficulty: 'easy',
    skills: ['vocabulary']
  });

  useEffect(() => {
    if (question) {
      setFormData({
        questionText: question.questionText || '',
        questionType: question.questionType || 'multiple_choice',
        options: question.options?.length ? [...question.options] : ['', '', '', ''],
        correctAnswer: question.correctAnswer || '',
        explanation: question.explanation || '',
        difficulty: question.difficulty || 'easy',
        skills: question.skills || ['vocabulary']
      });
    } else {
      setFormData({
        questionText: '',
        questionType: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        difficulty: 'easy',
        skills: ['vocabulary']
      });
    }
  }, [question, isOpen]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (formData.questionType === 'multiple_choice') {
      const validOptions = formData.options.filter(o => o.trim() !== '');
      if (validOptions.length < 2) return alert("At least 2 options are required.");
      if (!formData.correctAnswer) return alert("Please select a correct answer.");
      if (!validOptions.includes(formData.correctAnswer)) return alert("Correct answer must be one of the options.");
    }
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
        {question ? 'Update Question' : 'Save Question'}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={question ? 'Edit Quiz Question' : 'Add Quiz Question'}
      size="lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Question Text</label>
          <textarea
            required
            placeholder="e.g., What is the translation of 'Hello'?"
            rows={2}
            value={formData.questionText}
            onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Difficulty</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Primary Skill</label>
            <select
              value={formData.skills[0]}
              onChange={(e) => setFormData({ ...formData, skills: [e.target.value] })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <option value="vocabulary">Vocabulary</option>
              <option value="grammar">Grammar</option>
              <option value="conversation">Conversation</option>
              <option value="listening">Listening</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Options (Multiple Choice)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formData.options.map((option, idx) => (
              <div key={idx} className="relative group">
                <input
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all outline-none bg-white dark:bg-slate-950 ${
                    formData.correctAnswer === option && option !== ''
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, correctAnswer: option })}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
                    formData.correctAnswer === option && option !== ''
                      ? 'text-emerald-500'
                      : 'text-slate-300 hover:text-slate-400'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Explanation (Shown after answer)</label>
          <textarea
            placeholder="Why is this the correct answer?"
            rows={2}
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
          />
        </div>
      </form>
    </Modal>
  );
};

export default QuizQuestionModal;
