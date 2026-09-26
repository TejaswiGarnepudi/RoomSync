import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17272C]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FFF9F1] border border-[#E8DEC8] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#E8DEC8]/70 bg-[#FAF5ED]">
          <h3 className="text-base font-bold text-[#234653] font-serif-editorial">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#3E737C] hover:text-[#17272C] hover:bg-[#EFE7DC] transition-colors focus:outline-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
