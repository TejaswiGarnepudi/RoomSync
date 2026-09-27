import React from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] text-[#1A1A1A] dark:text-[#FAF9F5] rounded-3xl shadow-2xl w-full ${maxWidth} overflow-hidden animate-in zoom-in-95 duration-150`}>
        <div className="flex justify-between items-center px-6 py-4.5 border-b border-[#E8E7E1] dark:border-[#2A2A28] bg-[#FAF9F5] dark:bg-[#181816]">
          <h3 className="text-base font-medium tracking-[-0.03em] text-[#1A1A1A] dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="size-8 rounded-full flex items-center justify-center text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#EAE8E1] dark:hover:bg-[#252522] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
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
