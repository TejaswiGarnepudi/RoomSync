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
        <label htmlFor={id} className="block text-xs font-semibold text-[#234653] tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3.5 py-2.5 text-xs text-[#234653] placeholder:text-[#3E737C]/50 bg-[#FFF9F1] border rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#3E737C]/25 focus:border-[#3E737C] transition-colors ${
          error ? 'border-rose-400 bg-rose-50/40' : 'border-[#E8DEC8]'
        } ${props.disabled ? 'bg-[#FAF5ED] opacity-60 cursor-not-allowed' : ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}
