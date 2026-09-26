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
  const baseClasses = 'inline-flex justify-center items-center font-medium rounded-xl btn-interactive transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';
  
  const variants = {
    primary: 'bg-[#E86F5A] hover:bg-[#D65D48] text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 btn-shimmer focus:ring-[#E86F5A]/40 font-semibold',
    secondary: 'bg-[#FFF9F1] hover:bg-[#FBF1EB] text-[#234653] border border-[#E8DEC8] hover:border-[#3E737C]/40 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 focus:ring-[#3E737C]/30 font-medium',
    accent: 'bg-[#234653] hover:bg-[#17272C] text-[#FFF9F1] shadow-xs hover:shadow-md hover:-translate-y-0.5 btn-shimmer focus:ring-[#234653]/40 font-semibold',
    soft: 'bg-[#F2D4C8] hover:bg-[#EAC4B6] text-[#234653] border border-[#E8DEC8]/80 hover:-translate-y-0.5 font-medium',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 btn-shimmer focus:ring-rose-400',
    ghost: 'bg-transparent text-[#234653] hover:text-[#17272C] hover:bg-[#EFE7DC] focus:ring-[#3E737C]/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
