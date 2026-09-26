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
      <div className="relative hidden lg:flex lg:w-[48%] xl:w-[50%] flex-col justify-between p-10 xl:p-14 2xl:p-16 overflow-hidden bg-[#121211] text-white border-r border-[#262624] select-none">
        {/* Ambient Multi-Hue Gradient Glows */}
        <div className="absolute -top-20 -left-20 w-[480px] h-[480px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/3 -right-24 w-[420px] h-[420px] bg-cyan-500/12 rounded-full blur-[150px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2.5s' }} />
        <div className="absolute -bottom-20 left-1/4 w-[460px] h-[460px] bg-amber-500/12 rounded-full blur-[150px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '5s' }} />
        <div className="absolute top-2/3 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '7s' }} />

        {/* Rich Multi-Layered Flowing Decorative SVG Pattern Background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="auth-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#06B6D4" stopOpacity="0.75" />
              <stop offset="85%" stopColor="#6366F1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="auth-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#EC4899" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="auth-grad-3" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.7" />
            </linearGradient>
            <radialGradient id="mesh-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
            {/* Subtle Dot Grid Pattern */}
            <pattern id="auth-dot-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.07)" />
            </pattern>
          </defs>

          {/* Background Ambient Fill and Dot Matrix */}
          <rect width="100%" height="100%" fill="url(#mesh-glow)" />
          <rect width="100%" height="100%" fill="url(#auth-dot-grid)" />

          {/* Layered Topographical & Wave Spline Curves */}
          {/* Wave Set 1: High Energy Top-to-Bottom Flow */}
          <path
            d="M -150 120 C 220 40, 260 480, 640 360 C 880 280, 720 780, 1150 680"
            fill="none"
            stroke="url(#auth-grad-1)"
            strokeWidth="2"
            strokeDasharray="8 6"
            className="animate-dash-flow"
          />
          <path
            d="M -130 150 C 240 70, 280 510, 660 390 C 900 310, 740 810, 1170 710"
            fill="none"
            stroke="url(#auth-grad-1)"
            strokeWidth="1.2"
            strokeOpacity="0.4"
          />

          {/* Wave Set 2: Diagonal Cross Flow */}
          <path
            d="M -80 440 C 320 320, 160 820, 680 720 C 940 660, 840 1020, 1200 940"
            fill="none"
            stroke="url(#auth-grad-2)"
            strokeWidth="1.75"
            strokeDasharray="10 8"
            className="animate-dash-flow"
            style={{ animationDirection: 'reverse', animationDuration: '36s' }}
          />
          <path
            d="M -60 470 C 340 350, 180 850, 700 750 C 960 690, 860 1050, 1220 970"
            fill="none"
            stroke="url(#auth-grad-2)"
            strokeWidth="1"
            strokeOpacity="0.35"
          />

          {/* Wave Set 3: Gentle Horizontal Crest Waves */}
          <path
            d="M -100 280 C 250 200, 450 420, 850 260 C 1050 180, 1150 400, 1300 320"
            fill="none"
            stroke="url(#auth-grad-3)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
            className="animate-dash-flow"
            style={{ animationDuration: '24s' }}
          />
          <path
            d="M -100 620 C 300 520, 500 780, 900 590 C 1100 500, 1200 750, 1350 660"
            fill="none"
            stroke="url(#auth-grad-1)"
            strokeWidth="1.25"
            strokeDasharray="4 6"
            className="animate-dash-flow"
            style={{ animationDirection: 'reverse', animationDuration: '28s' }}
          />

          {/* Geometric Contour Rings & Echoes */}
          <path
            d="M 50 -100 C 450 180, 380 620, 820 820 C 1000 900, 1100 1100, 1250 1200"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.2"
          />
          <path
            d="M 80 -80 C 480 200, 410 640, 850 840"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
          <path
            d="M 110 -60 C 510 220, 440 660, 880 860"
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="1"
          />

          {/* Glowing Anchor Beacons along the paths */}
          <circle cx="360" cy="380" r="3.5" fill="#10B981" opacity="0.9" className="animate-pulse" />
          <circle cx="360" cy="380" r="10" fill="#10B981" opacity="0.2" className="animate-pulse" />

          <circle cx="680" cy="720" r="3.5" fill="#06B6D4" opacity="0.9" className="animate-pulse" />
          <circle cx="680" cy="720" r="10" fill="#06B6D4" opacity="0.2" className="animate-pulse" />

          <circle cx="850" cy="260" r="3" fill="#F59E0B" opacity="0.9" className="animate-pulse" />
          <circle cx="850" cy="260" r="9" fill="#F59E0B" opacity="0.2" className="animate-pulse" />
        </svg>

        {/* 1. Top Branding */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3.5 group">
            <div className="size-12 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-xl group-hover:scale-105 group-hover:bg-white/15 transition-all">
              <svg width="24" height="24" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="4" width="23" height="23" rx="8" />
                <rect x="13" y="13" width="23" height="23" rx="8" />
                <path d="M13 20h14M20 13v14" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-bold tracking-tight text-white">roomsync</span>
                <span className="text-[11px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 border border-white/10">
                  Shared OS
                </span>
              </div>
              <p className="text-xs text-[#8E8E88] font-normal tracking-tight mt-0.5">
                Harmonious roommate coordination
              </p>
            </div>
          </Link>
        </div>

        {/* 2. Middle: Large Bold Editorial Headline & Subtitle */}
        <div className="relative z-10 my-auto py-12 space-y-6 max-w-xl">
          {/* Main Elevated Headline */}
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-[66px] font-normal tracking-[-0.045em] text-white leading-[1.08]">
              Living together, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FAF9F5] to-[#A8A7A0]">
                calmly synchronized.
              </span>
            </h2>
            <p className="text-base sm:text-lg xl:text-xl text-[#A8A7A0] leading-relaxed max-w-lg font-light tracking-[-0.01em]">
              Automated chore schedules, transparent expense splits, and smooth house harmony in one shared space.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#EAE8E1] backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Automated Rotations
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#EAE8E1] backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-cyan-400" />
              Debt Minimization
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#EAE8E1] backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-amber-400" />
              House Polls & Voting
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
                className="size-8 rounded-full object-cover border-2 border-[#121211]"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80"
                alt="Roommate"
                className="size-8 rounded-full object-cover border-2 border-[#121211]"
              />
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80"
                alt="Roommate"
                className="size-8 rounded-full object-cover border-2 border-[#121211]"
              />
            </div>
            <p className="text-xs text-[#A8A7A0]">
              <strong className="text-white font-medium">10,000+</strong> flatmates in sync
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium">
            <span>★★★★★</span>
            <span className="text-white ml-1 text-xs">4.9/5</span>
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
