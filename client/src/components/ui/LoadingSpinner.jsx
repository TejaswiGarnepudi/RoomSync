import React from 'react';

export default function LoadingSpinner({ className = '' }) {
  return (
    <div className={`size-7 border-2 border-[#1A1A1A] dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin ${className}`} />
  );
}
