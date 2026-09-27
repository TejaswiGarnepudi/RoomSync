import React from 'react';

export default function Card({
  children,
  className = '',
  padding = 'p-6 sm:p-7',
  title,
  subtitle,
  action,
  hoverable = false
}) {
  const hoverClasses = hoverable
    ? 'transition-all duration-250 hover:-translate-y-0.5 hover:border-[#1A1A1A]/30 dark:hover:border-white/20 hover:shadow-md'
    : 'transition-colors duration-200';

  return (
    <div className={`bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl shadow-2xs overflow-hidden text-[#1A1A1A] dark:text-[#FAF9F5] ${hoverClasses} ${className}`}>
      {title && (
        <div className="px-6 sm:px-7 py-4 border-b border-[#E8E7E1] dark:border-[#2A2A28] bg-[#FAF9F5] dark:bg-[#181816] flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium tracking-[-0.03em] text-[#1A1A1A] dark:text-white">{title}</h3>
            {subtitle && <p className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-0.5 tracking-[-0.02em]">{subtitle}</p>}
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
