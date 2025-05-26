
import React from 'react';
import { XCircleIcon } from './icons/XCircleIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full h-full'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-opacity duration-300 ease-in-out opacity-100">
      <div className={`bg-slate-800 p-6 rounded-lg shadow-2xl shadow-cyan-500/30 w-full ${sizeClasses[size]} transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-cyan-400">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-cyan-400 transition-colors"
            aria-label="Chiudi modale"
          >
            <XCircleIcon className="w-8 h-8" />
          </button>
        </div>
        <div className="overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};
