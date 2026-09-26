import React from 'react';

export default function LoadingSpinner({ className = '' }) {
  return (
    <div className={`w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin ${className}`}></div>
  );
}
