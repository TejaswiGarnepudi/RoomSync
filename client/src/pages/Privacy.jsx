import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Privacy() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#0E0E0D] text-[#1A1A1A] dark:text-[#FAF9F5] flex flex-col font-sans transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#FAF9F5]/90 dark:bg-[#0E0E0D]/90 backdrop-blur-md border-b border-[#E8E7E1] dark:border-[#2A2A28] px-6 sm:px-10 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <svg width="30" height="30" viewBox="0 0 40 40" fill="none" className="text-[#1A1A1A] dark:text-white transition-transform group-hover:scale-105">
            <rect x="4" y="4" width="23" height="23" rx="8" stroke="currentColor" strokeWidth="1.8" />
            <rect x="13" y="13" width="23" height="23" rx="8" stroke="currentColor" strokeWidth="1.8" />
            <path d="M13 20h14M20 13v14" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <span className="text-xl font-medium tracking-[-1px] text-[#1A1A1A] dark:text-white">
            roomsync
          </span>
          <span className="text-xs uppercase font-semibold text-[#71716E] dark:text-[#8E8E88] ml-2 pl-3 border-l border-[#E8E7E1] dark:border-[#2A2A28]">
            Privacy
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="size-9 rounded-full border border-[#E8E7E1] dark:border-[#2E2E2A] bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-[#FAF9F5] flex items-center justify-center transition-all hover:scale-105 cursor-pointer shadow-2xs"
          >
            <span className="text-sm font-bold select-none">{isDark ? '☼' : '☾'}</span>
          </button>
          <Link
            to="/register"
            className="px-4 py-2 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Get Started &rarr;
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 sm:px-10 py-12 sm:py-16 space-y-10 flex-1 w-full animate-fade-in-up">
        <div className="space-y-3 pb-8 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#71716E] dark:text-[#8E8E88]">
            Privacy & Trust
          </span>
          <h1 className="text-4xl sm:text-5xl font-normal tracking-[-0.04em] text-[#1A1A1A] dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#71716E] dark:text-[#8E8E88]">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-[#4A4A48] dark:text-[#C4C3BA] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#1A1A1A] dark:text-white tracking-tight">
              1. Information We Collect
            </h2>
            <p>
              We collect information necessary to coordinate your household space:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account Information:</strong> Your name, email address, and encrypted password.</li>
              <li><strong>Household Data:</strong> Household name, member assignments, chore schedules, grocery checklists, and expense records.</li>
              <li><strong>Technical Data:</strong> Device browser, IP address, and cookie tokens for session security.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#1A1A1A] dark:text-white tracking-tight">
              2. How We Use Household Information
            </h2>
            <p>
              Your data is strictly utilized to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Facilitate real-time task rotations and chore notifications between flatmates.</li>
              <li>Compute accurate debt simplification and expense split calculations.</li>
              <li>Ensure secure authentication and prevent unauthorized access to your household.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#1A1A1A] dark:text-white tracking-tight">
              3. Data Sharing & Zero Advertising
            </h2>
            <p>
              We do not sell, rent, or trade your personal or household information to third-party advertisers or data brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#1A1A1A] dark:text-white tracking-tight">
              4. Data Retention & Account Deletion
            </h2>
            <p>
              You may request deletion of your account and associated household data at any time via your household settings or by contacting <Link to="/help-center" className="underline font-medium text-[#1A1A1A] dark:text-white">Help Centre</Link>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E7E1] dark:border-[#2A2A28] py-8 text-center text-xs text-[#71716E] dark:text-[#8E8E88]">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} RoomSync Inc. Privacy Policy.</p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:underline">Terms & Conditions</Link>
            <Link to="/help-center" className="hover:underline">Help Centre</Link>
            <Link to="/" className="hover:underline">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
