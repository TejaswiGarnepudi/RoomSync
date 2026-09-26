import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function AuthLayout({
  title,
  subtitle,
  children,
  switchText,
  switchLinkText,
  switchLinkTo,
}) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF9F5] dark:bg-[#0E0E0D] text-[#1A1A1A] dark:text-[#FAF9F5] transition-colors duration-300 overflow-x-clip font-sans selection:bg-[#1A1A1A] selection:text-white dark:selection:bg-white dark:selection:text-[#1A1A1A]">
      {/* ======================================================== */}
      {/* LEFT PANEL: ANIMATED VISUAL CANVAS (DESKTOP ONLY) */}
      {/* ======================================================== */}
      <div className="relative hidden lg:flex lg:w-[48%] xl:w-[50%] flex-col justify-between p-10 xl:p-14 overflow-hidden bg-[#121211] text-white border-r border-[#262624] select-none">
        {/* Ambient Gradient Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '3s' }} />
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '5s' }} />

        {/* Decorative Animated Flowing SVG Paths */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="auth-spline-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="auth-spline-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.4" />
            </linearGradient>
            <radialGradient id="mesh-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Radial Tint */}
          <rect width="100%" height="100%" fill="url(#mesh-glow)" />

          {/* Animated Flowing Spline Curves */}
          <path
            d="M -100 150 C 200 80, 250 450, 600 380 C 850 330, 700 700, 1000 650"
            fill="none"
            stroke="url(#auth-spline-1)"
            strokeWidth="1.75"
            strokeDasharray="6 6"
            className="animate-dash-flow"
          />
          <path
            d="M -50 400 C 300 300, 150 750, 650 680 C 900 630, 800 950, 1100 900"
            fill="none"
            stroke="url(#auth-spline-2)"
            strokeWidth="1.25"
            strokeDasharray="8 8"
            className="animate-dash-flow"
            style={{ animationDirection: 'reverse', animationDuration: '38s' }}
          />
          <path
            d="M 100 -50 C 400 200, 350 600, 750 750"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        </svg>

        {/* 1. Top Branding */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3.5 group">
            <div className="size-11 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-xl group-hover:scale-105 group-hover:bg-white/15 transition-all">
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="4" width="23" height="23" rx="8" />
                <rect x="13" y="13" width="23" height="23" rx="8" />
                <path d="M13 20h14M20 13v14" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">roomsync</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-emerald-300 border border-white/10">
                  Shared OS
                </span>
              </div>
              <p className="text-xs text-[#8E8E88] font-normal tracking-tight">
                Harmonious roommate coordination
              </p>
            </div>
          </Link>
        </div>

        {/* 2. Middle: Roommate Visual Composition & Layered Cards */}
        <div className="relative z-10 my-auto py-8 space-y-5">
          {/* Main Headline */}
          <div className="max-w-md space-y-2">
            <h2 className="text-3xl xl:text-4xl font-normal tracking-[-0.04em] text-white leading-tight">
              Living together, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#EAE8E1] to-[#A8A7A0]">
                calmly synchronized.
              </span>
            </h2>
            <p className="text-xs xl:text-sm text-[#A8A7A0] leading-relaxed">
              Automated chore schedules, transparent expense splits, and smooth house harmony in one shared space.
            </p>
          </div>

          {/* Floating Roommate UI Cards */}
          <div className="relative pt-4 h-[300px] w-full max-w-lg">
            {/* Card 1: Roommate Profile & Compatibility Badge (Top Right) */}
            <div className="absolute top-0 right-0 w-[270px] rounded-2xl bg-[#1A1A19]/90 backdrop-blur-xl border border-white/10 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)] animate-float-a">
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xs font-bold text-black shadow-xs">
                    ML
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Maya Lin</h4>
                    <p className="text-[10px] text-[#8E8E88]">Master Bed • 98% Match</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  In Sync
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-stone-300">
                  Early Riser
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-stone-300">
                  Quiet @ 11pm
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-stone-300">
                  Clean Kitchen
                </span>
              </div>
            </div>

            {/* Card 2: Live Chore Rotation Status (Center-Left) */}
            <div className="absolute top-20 left-0 w-[280px] rounded-2xl bg-[#1A1A19]/95 backdrop-blur-xl border border-white/10 p-4 shadow-[0_25px_50px_rgba(0,0,0,0.45)] animate-float-b">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="size-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Kitchen Island & Trash</h4>
                    <p className="text-[10px] text-amber-300 font-medium mt-0.5">Turn: Alex • Due Today 6 PM</p>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-[#8E8E88]">
                <span>Weekly Auto-Rotation</span>
                <span className="text-emerald-400 font-medium">✓ Completed</span>
              </div>
            </div>

            {/* Card 3: Debt Minimizer Expense Split (Bottom-Right) */}
            <div className="absolute bottom-0 right-4 w-[290px] rounded-2xl bg-[#1A1A19]/90 backdrop-blur-xl border border-white/10 p-3.5 shadow-[0_20px_45px_rgba(0,0,0,0.4)] animate-float-c">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white">Fiber Internet & Power</h4>
                    <p className="text-[10px] text-[#8E8E88]">$135.00 • Split 3 Ways</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-white">$45.00</span>
              </div>
              <div className="bg-white/5 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[10px]">
                <span className="text-stone-400">Multi-party debt algorithm</span>
                <span className="text-cyan-300 font-semibold">1 Transfer Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Supporting Content: Social Proof */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                alt="Roommate"
                className="size-7 rounded-full object-cover border-2 border-[#121211]"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80"
                alt="Roommate"
                className="size-7 rounded-full object-cover border-2 border-[#121211]"
              />
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80"
                alt="Roommate"
                className="size-7 rounded-full object-cover border-2 border-[#121211]"
              />
            </div>
            <p className="text-xs text-[#A8A7A0]">
              <strong className="text-white font-medium">10,000+</strong> flatmates in sync
            </p>
          </div>

          <div className="flex items-center gap-1 text-amber-400 text-xs font-medium">
            <span>★★★★★</span>
            <span className="text-white ml-1 text-[11px]">4.9/5</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT PANEL: AUTHENTICATION FORM (DESKTOP & MOBILE) */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen bg-[#FAF9F5] dark:bg-[#0E0E0D] transition-colors duration-300">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
          {/* Home Link with Arrow */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white transition-colors group"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:-translate-x-1"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span>Home</span>
          </Link>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
            className="size-8 rounded-lg bg-[#EAE8E1] dark:bg-[#1E1E1C] border border-[#E8E7E1] dark:border-[#2E2E2A] flex items-center justify-center text-[#1A1A1A] dark:text-[#FAF9F5] hover:scale-105 transition-transform cursor-pointer shadow-2xs"
          >
            <span className="text-xs font-bold select-none">{isDark ? '☼' : '☾'}</span>
          </button>
        </div>

        {/* Main Authentication Container */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          {/* Mobile Branding (only on mobile screens) */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="size-10 rounded-xl bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] flex items-center justify-center shadow-md">
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="4" width="23" height="23" rx="8" />
                <rect x="13" y="13" width="23" height="23" rx="8" />
                <path d="M13 20h14M20 13v14" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#1A1A1A] dark:text-white">
              roomsync
            </span>
          </div>

          {/* Heading and Subtitle */}
          <div className="space-y-2 mb-8 animate-fade-in-up">
            <h1 className="text-3xl sm:text-[32px] font-normal tracking-[-0.035em] text-[#1A1A1A] dark:text-white leading-tight">
              {title}
            </h1>
            <p className="text-sm text-[#71716E] dark:text-[#8E8E88] leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Main Form Slot */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {children}
          </div>

          {/* Switcher Link (Sign in <-> Create account) */}
          {switchText && switchLinkText && switchLinkTo && (
            <div className="mt-8 text-center text-xs text-[#71716E] dark:text-[#8E8E88] animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <span>{switchText} </span>
              <Link
                to={switchLinkTo}
                className="font-semibold text-[#1A1A1A] dark:text-white hover:underline transition-all"
              >
                {switchLinkText}
              </Link>
            </div>
          )}
        </div>

        {/* Footer: Terms & Privacy Notice */}
        <div className="w-full max-w-md mx-auto text-center pt-6 border-t border-[#E8E7E1]/80 dark:border-[#2A2A28]/80 text-[11px] text-[#71716E] dark:text-[#8E8E88]">
          <p>
            By continuing, you agree to RoomSync's{' '}
            <span className="underline hover:text-[#1A1A1A] dark:hover:text-white cursor-pointer transition-colors">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="underline hover:text-[#1A1A1A] dark:hover:text-white cursor-pointer transition-colors">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
