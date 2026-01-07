
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1002] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0B0E14]/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] flex flex-col relative z-20 border-white/10 shadow-3xl animate-slide-up">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h3 className="text-xl font-bold text-white font-outfit tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-500 hover:text-[#00E5FF] hover:bg-white/5 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
