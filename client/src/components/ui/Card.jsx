import React from 'react';

export default function Card({ children, className = '', padding = 'p-6', title, subtitle, action, hoverable = false }) {
  const hoverClasses = hoverable ? 'transition-all duration-300 hover:shadow-md hover:border-[#3E737C]/30 hover:-translate-y-0.5' : 'transition-colors duration-200';
  return (
    <div className={`bg-[#FFF9F1] border border-[#E8DEC8] rounded-2xl shadow-2xs overflow-hidden ${hoverClasses} ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-[#E8DEC8]/70 bg-[#FAF5ED] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#234653] font-serif-editorial">{title}</h3>
            {subtitle && <p className="text-xs text-[#3E737C] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={padding}>
        {children}
      </div>
    </div>
  );
}
