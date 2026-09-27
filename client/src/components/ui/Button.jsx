import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) {
  const baseClasses = 'inline-flex justify-center items-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';
  
  const variants = {
    primary: 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-black dark:hover:bg-[#FAF9F5] shadow-xs hover:shadow-md hover:-translate-y-0.5 rounded-full font-medium active:scale-[0.98]',
    secondary: 'bg-[#EAE8E1] dark:bg-[#1E1E1C] hover:bg-[#E2E1DA] dark:hover:bg-[#282824] text-[#1A1A1A] dark:text-[#FAF9F5] border border-transparent dark:border-[#2E2E2A] hover:-translate-y-0.5 rounded-full font-medium active:scale-[0.98]',
    outline: 'bg-transparent hover:bg-[#EAE8E1]/60 dark:hover:bg-[#1E1E1C] text-[#1A1A1A] dark:text-white border border-[#E8E7E1] dark:border-[#2A2A28] rounded-full font-medium hover:-translate-y-0.5 active:scale-[0.98]',
    accent: 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-black dark:hover:bg-[#FAF9F5] shadow-xs hover:shadow-md rounded-full font-medium',
    coral: 'bg-[#E86F5A] hover:bg-[#D65D48] text-white shadow-xs hover:shadow-md rounded-full font-medium hover:-translate-y-0.5 active:scale-[0.98]',
    soft: 'bg-[#FAF9F5] dark:bg-[#181816] hover:bg-[#EAE8E1] dark:hover:bg-[#222220] text-[#1A1A1A] dark:text-white border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl font-medium',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs hover:shadow-md rounded-full font-medium active:scale-[0.98]',
    ghost: 'bg-transparent text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#EAE8E1]/60 dark:hover:bg-[#1E1E1C] rounded-full font-medium',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-4.5 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
