import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Terms() {
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
            Legal
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

      {/* Main Legal Content */}
      <main className="max-w-4xl mx-auto px-6 sm:px-10 py-12 sm:py-16 space-y-10 flex-1 w-full animate-fade-in-up">
        {/* Header Title */}
        <div className="space-y-3 pb-8 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#71716E] dark:text-[#8E8E88]">
            Legal Agreement
          </span>
          <h1 className="text-4xl sm:text-5xl font-normal tracking-[-0.04em] text-[#1A1A1A] dark:text-white">
            Terms & Conditions of Service
          </h1>
          <p className="text-xs sm:text-sm text-[#71716E] dark:text-[#8E8E88]">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Effective immediately
          </p>
        </div>

        {/* Legal Sections */}
        <div className="space-y-8 text-xs sm:text-sm text-[#4A4A48] dark:text-[#C4C3BA] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#1A1A1A] dark:text-white tracking-tight">
              1. Acceptance of Terms
            </h2>
            <p>
              By creating an account, generating or joining a household with an invite code, or using the RoomSync platform, you agree to comply with and be bound by these Terms and Conditions. If you do not agree to these terms, please do not use RoomSync.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#1A1A1A] dark:text-white tracking-tight">
              2. User Accounts & Password Security
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You must use a secure password that meets our strength standards (minimum 8 characters, letters, numbers, and symbols) and must not include your personal name or email in your password.
            </p>
            <p>
              RoomSync reserves the right to reject weak passwords and suspend any accounts exhibiting fraudulent access patterns or unauthorized sharing of household invite codes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#1A1A1A] dark:text-white tracking-tight">
              3. Shared Household Workspaces & Invite Codes
            </h2>
            <p>
              Each RoomSync household operates as an isolated workspace. Anyone possessing your 8-character household invite code will be granted access to shared chore schedules, grocery checklists, and expense records within that household. You are responsible for distributing invite codes only to authorized flatmates.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#1A1A1A] dark:text-white tracking-tight">
              4. Expense Tracking & Financial Disclaimers
            </h2>
            <p>
              RoomSync provides calculation and debt minimization tools to help flatmates track shared living expenses. RoomSync is not a bank, money transmitter, or licensed financial advisor. All settlements, payments, or third-party bank transfers are conducted directly between flatmates. RoomSync is not liable for errors in manual expense entries or disputes regarding roommate payments.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#1A1A1A] dark:text-white tracking-tight">
              5. Chore Rotations & Workload Parity
            </h2>
            <p>
              Our automated chore scheduling algorithms calculate equitable distribution of household duties. Users agree to use the chore claiming, swapping, and favor systems in good faith to promote a harmonious shared living environment.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#1A1A1A] dark:text-white tracking-tight">
              6. Data Privacy & Content Ownership
            </h2>
            <p>
              You retain all rights to the household logs, notes, recipes, and tasks you submit. RoomSync does not sell your private household data to third-party advertisers. For complete details on data processing, please consult our <Link to="/privacy" className="underline font-medium text-[#1A1A1A] dark:text-white">Privacy Policy</Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#1A1A1A] dark:text-white tracking-tight">
              7. Limitation of Liability
            </h2>
            <p>
              RoomSync is provided on an "as is" and "as available" basis without warranties of any kind. Under no circumstances shall RoomSync be held liable for indirect, incidental, or consequential damages resulting from the use or inability to use the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#1A1A1A] dark:text-white tracking-tight">
              8. Contacting Legal & Support
            </h2>
            <p>
              If you have any questions regarding these Terms & Conditions, please visit our <Link to="/help-center" className="underline font-medium text-[#1A1A1A] dark:text-white">Help Centre</Link> or email legal@roomsync.app.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E7E1] dark:border-[#2A2A28] py-8 text-center text-xs text-[#71716E] dark:text-[#8E8E88]">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} RoomSync Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link to="/help-center" className="hover:underline">Help Centre</Link>
            <Link to="/" className="hover:underline">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
