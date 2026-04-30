import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Loader2 } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger", // danger, warning, info
  isLoading = false
}) => {
  const colors = {
    danger: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30",
    warning: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
    info: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30"
  };

  const btnColors = {
    danger: "bg-rose-600 hover:bg-rose-500 shadow-rose-500/20",
    warning: "bg-amber-600 hover:bg-amber-500 shadow-amber-500/20",
    info: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
  };

  const footer = (
    <>
      <button
        onClick={onClose}
        disabled={isLoading}
        className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        disabled={isLoading}
        className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 ${btnColors[type]}`}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {confirmText}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={footer}
    >
      <div className="flex flex-col items-center text-center py-4">
        <div className={`w-16 h-16 rounded-3xl border flex items-center justify-center mb-4 ${colors[type]}`}>
          <AlertTriangle className="w-8 h-8" />
        </div>
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
