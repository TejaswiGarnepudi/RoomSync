import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function NotFound() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#0E0E0D] text-[#1A1A1A] dark:text-[#FAF9F5] flex flex-col justify-between font-sans transition-colors duration-300">
      {/* Top Brand Bar */}
      <header className="px-6 sm:px-10 h-20 flex items-center justify-between border-b border-[#E8E7E1] dark:border-[#2A2A28]">
        <Link to="/" className="flex items-center gap-3 group">
          <svg width="30" height="30" viewBox="0 0 40 40" fill="none" className="text-[#1A1A1A] dark:text-white transition-transform group-hover:scale-105">
            <rect x="4" y="4" width="23" height="23" rx="8" stroke="currentColor" strokeWidth="1.8" />
            <rect x="13" y="13" width="23" height="23" rx="8" stroke="currentColor" strokeWidth="1.8" />
            <path d="M13 20h14M20 13v14" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <span className="text-xl font-medium tracking-[-1px] text-[#1A1A1A] dark:text-white">
            roomsync
          </span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="size-9 rounded-full border border-[#E8E7E1] dark:border-[#2E2E2A] bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-[#FAF9F5] flex items-center justify-center transition-all hover:scale-105 cursor-pointer shadow-2xs"
        >
          <span className="text-sm font-bold select-none">{isDark ? '☼' : '☾'}</span>
        </button>
      </header>

      {/* Main 404 Stage */}
      <main className="max-w-2xl mx-auto px-6 py-16 text-center space-y-7 my-auto animate-fade-in-up">
        {/* Geometric 404 Badge */}
        <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-[#EAE8E1] dark:bg-[#1E1E1C] border border-[#E8E7E1] dark:border-[#2E2E2A] shadow-md mx-auto">
          <span className="text-2xl font-bold tracking-tight text-[#1A1A1A] dark:text-white">404</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-normal tracking-[-0.04em] text-[#1A1A1A] dark:text-white">
            Lost in the hallway?
          </h1>
          <p className="text-sm sm:text-base text-[#71716E] dark:text-[#A8A7A0] max-w-md mx-auto leading-relaxed">
            The page you're looking for doesn't exist, was moved, or belongs to a different room.
          </p>
        </div>

        {/* Quick Navigation Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 max-w-lg mx-auto text-xs font-medium">
          <Link
            to="/dashboard"
            className="p-4 rounded-2xl bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] hover:border-[#1A1A1A] dark:hover:border-white transition-all shadow-2xs text-center space-y-1 group"
          >
            <span className="text-lg block group-hover:scale-110 transition-transform">🏠</span>
            <span className="font-semibold text-[#1A1A1A] dark:text-white block">Dashboard</span>
            <span className="text-[10px] text-[#71716E] dark:text-[#8E8E88] block">Your household</span>
          </Link>

          <Link
            to="/help-center"
            className="p-4 rounded-2xl bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] hover:border-[#1A1A1A] dark:hover:border-white transition-all shadow-2xs text-center space-y-1 group"
          >
            <span className="text-lg block group-hover:scale-110 transition-transform">📖</span>
            <span className="font-semibold text-[#1A1A1A] dark:text-white block">Help Centre</span>
            <span className="text-[10px] text-[#71716E] dark:text-[#8E8E88] block">Guides & support</span>
          </Link>

          <Link
            to="/"
            className="p-4 rounded-2xl bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] hover:border-[#1A1A1A] dark:hover:border-white transition-all shadow-2xs text-center space-y-1 group"
          >
            <span className="text-lg block group-hover:scale-110 transition-transform">✦</span>
            <span className="font-semibold text-[#1A1A1A] dark:text-white block">Home</span>
            <span className="text-[10px] text-[#71716E] dark:text-[#8E8E88] block">Landing page</span>
          </Link>
        </div>

        <div className="pt-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <span>Return to Dashboard</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E7E1] dark:border-[#2A2A28] py-6 text-center text-xs text-[#71716E] dark:text-[#8E8E88]">
        <p>&copy; {new Date().getFullYear()} RoomSync Inc. Room Not Found.</p>
      </footer>
    </div>
  );
}
