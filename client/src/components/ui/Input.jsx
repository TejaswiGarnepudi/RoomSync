import React from 'react';

export default function Input({
  label,
  error,
  id,
  className = '',
  ...props
}) {
  return (
    <div className={`mb-3.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-4 py-2.5 text-xs sm:text-sm text-[#1A1A1A] dark:text-white placeholder:text-[#71716E] dark:placeholder:text-[#888880] bg-[#FAF9F5] dark:bg-[#181816] border rounded-xl shadow-2xs focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white transition-colors ${
          error ? 'border-rose-400 dark:border-rose-500 bg-rose-50/40 dark:bg-rose-950/20' : 'border-[#E8E7E1] dark:border-[#2A2A28]'
        } ${props.disabled ? 'opacity-60 cursor-not-allowed bg-[#EAE8E1] dark:bg-[#20201E]' : ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
    </div>
  );
}
