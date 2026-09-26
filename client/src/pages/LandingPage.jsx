import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ScrollReveal from '../components/motion/ScrollReveal';
import TiltCard from '../components/motion/TiltCard';
import Hero3DCardStage from '../components/motion/Hero3DCardStage';
import FloatingOrbs from '../components/motion/FloatingOrbs';
import Magnet from '../components/motion/Magnet';
import ScrollSwingMarquee from '../components/motion/ScrollSwingMarquee';
import BentoFeatures from '../components/motion/BentoFeatures';
import TheProcessStage from '../components/motion/TheProcessStage';

export default function LandingPage() {
  const { isAuthenticated, user } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickEmail, setQuickEmail] = useState('');
  const [activeSection, setActiveSection] = useState('why');
  const [showFaqModal, setShowFaqModal] = useState(false);

  // ScrollSpy to dynamically highlight active section in Navbar
  useEffect(() => {
    const sectionIds = ['why', 'features', 'process', 'sandbox'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll handler with header offset
  const scrollToSection = (e, id) => {
    if (e) e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  // Interactive sandbox state
  const [sandboxChores, setSandboxChores] = useState([
    { id: 1, title: 'Wipe kitchen island & stove', person: 'Alex', done: true, time: '08:45 AM' },
    { id: 2, title: 'Restock cold brew & oat milk', person: 'You', done: false, time: 'Today 10:15 AM' },
    { id: 3, title: 'Water balcony monstera', person: 'Maya', done: false, time: '11:00 AM' }
  ]);
  const [newChoreText, setNewChoreText] = useState('');

  // Interactive expense split calculator in sandbox
  const [simBillAmount, setSimBillAmount] = useState(1800);
  const [simRoommateCount, setSimRoommateCount] = useState(3);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(null);

  const toggleChore = (id) => {
    setSandboxChores(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));
  };

  const addChore = (e) => {
    e.preventDefault();
    if (!newChoreText.trim()) return;
    setSandboxChores(prev => [
      ...prev,
      { id: Date.now(), title: newChoreText.trim(), person: 'You', done: false, time: 'Just now' }
    ]);
    setNewChoreText('');
  };

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    navigate('/register');
  };

  const audienceRow1 = [
    { title: 'Student Apartments', img: 'https://images.unsplash.com/photo-1548382131-e0ebb1f0cdea?auto=format&fit=crop&w=120&q=80' },
    { title: 'City Flatmates', img: 'https://images.unsplash.com/photo-1670095044002-3b45b6ad8a01?auto=format&fit=crop&w=120&q=80' },
    { title: 'Young Professionals', img: 'https://images.unsplash.com/photo-1547587091-f883cf8f0c12?auto=format&fit=crop&w=120&q=80' },
    { title: 'Co-Living Communities', img: 'https://images.unsplash.com/photo-1615717146113-495e481c17c9?auto=format&fit=crop&w=120&q=80' },
    { title: 'Design Partners', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=120&q=80' },
    { title: 'Brand Builders', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=120&q=80' }
  ];

  const audienceRow2 = [
    { title: '2BHK & 3BHK Suites', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=120&q=80' },
    { title: 'Couples & Partners', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=120&q=80' },
    { title: 'Creative Studios', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=120&q=80' },
    { title: 'Growing Flatmates', img: 'https://images.unsplash.com/photo-1548382131-e0ebb1f0cdea?auto=format&fit=crop&w=120&q=80' },
    { title: 'Product Thinkers', img: 'https://images.unsplash.com/photo-1670095044002-3b45b6ad8a01?auto=format&fit=crop&w=120&q=80' },
    { title: 'Side Projects', img: 'https://images.unsplash.com/photo-1615717146113-495e481c17c9?auto=format&fit=crop&w=120&q=80' }
  ];

  const faqs = [
    {
      q: 'How does RoomSync simplify shared household living?',
      a: 'RoomSync brings all everyday roommate responsibilities—recurring chores with automated rotations, shared expenses with automated debt simplification, real-time grocery lists, favor requests, and house polls—into a single calm, synchronized workspace.'
    },
    {
      q: 'How do my flatmates join our household?',
      a: 'Once you create a household space in RoomSync, you receive a shareable 8-character invite code (e.g. MAPLE-3B). Your flatmates simply enter the code to instantly access the shared calendar, lists, and balances.'
    },
    {
      q: 'How does expense splitting and debt simplification work?',
      a: 'When someone logs a grocery run or utility bill, RoomSync automatically divides the cost equally or by custom shares. Its multi-party debt simplification algorithm cancels out redundant debts so everyone makes the minimum number of transfers.'
    },
    {
      q: 'How are chores rotated between flatmates?',
      a: 'RoomSync supports daily, weekly, and monthly rotation cycles with fair workload balancing so nobody feels burdened with extra cleaning tasks.'
    },
    {
      q: 'Can we vote on house decisions like guest rules or purchases?',
      a: 'Yes! The built-in Decisions & Polls feature lets any roommate propose an idea with custom options and deadlines, eliminating endless group chat debates.'
    },
    {
      q: 'Is RoomSync responsive on mobile phones and tablets?',
      a: 'Yes. RoomSync is built mobile-first with real-time socket updates across every phone, laptop, and tablet in the household.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#0E0E0D] text-[#1A1A1A] dark:text-[#FAF9F5] flex flex-col font-sans transition-colors duration-300 overflow-x-clip antialiased">
      {/* Top Banner if logged in */}
      {isAuthenticated && (
        <div className="bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] px-4 py-2 text-xs text-center font-medium flex items-center justify-center gap-2 animate-fade-in-up z-50">
          <span>Signed in as <strong>{user?.name}</strong>.</span>
          <Link to="/dashboard" className="underline hover:opacity-80 font-semibold transition-opacity">
            Go to your household space &rarr;
          </Link>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. SPARKDESIGN FIXED HEADER */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 dark:bg-[#0E0E0D]/90 backdrop-blur-[24px] border-b border-[#E8E7E1] dark:border-[#2A2A28] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex items-center justify-between h-20">
          {/* Logo Brand Mark */}
          <Link to="/" className="flex items-center gap-3 group border-r border-[#E8E7E1] dark:border-[#2A2A28] pr-8 max-md:border-0 max-md:pr-0">
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none" className="text-[#1A1A1A] dark:text-white transition-transform group-hover:scale-105">
              <rect x="4" y="4" width="23" height="23" rx="8" stroke="currentColor" strokeWidth="1.8" />
              <rect x="13" y="13" width="23" height="23" rx="8" stroke="currentColor" strokeWidth="1.8" />
              <path d="M13 20h14M20 13v14" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <span className="text-2xl font-medium tracking-[-1.2px] text-[#1A1A1A] dark:text-white">
              roomsync
            </span>
          </Link>

          {/* Desktop Navigation Links with Micro-Underline and ScrollSpy */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-[-0.025em]">
            {[
              { id: 'why', label: 'Why RoomSync' },
              { id: 'features', label: 'Features' },
              { id: 'process', label: 'The process' },
              { id: 'sandbox', label: 'Live Preview' },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => scrollToSection(e, item.id)}
                className={`relative py-1 transition-colors duration-200 ${
                  activeSection === item.id
                    ? 'text-[#1A1A1A] dark:text-white font-semibold after:scale-x-100'
                    : 'text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white after:scale-x-0'
                } after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-[#1A1A1A] dark:after:bg-white after:origin-left after:transition-transform after:duration-250 hover:after:scale-x-100`}
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => setShowFaqModal(true)}
              className="relative py-1 text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white transition-colors duration-200 cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3.5">
            {/* Dark / Light Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
              className="size-9 rounded-full border border-[#E8E7E1] dark:border-[#2E2E2A] bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-[#FAF9F5] flex items-center justify-center transition-all hover:scale-105 cursor-pointer shadow-2xs"
            >
              <span className="text-sm font-bold select-none">{isDark ? '☼' : '☾'}</span>
            </button>

            {isAuthenticated ? (
              <Magnet magnetStrength={0.2}>
                <Link
                  to="/dashboard"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-transparent bg-[#1A1A1A] dark:bg-white px-5 py-2 text-sm font-medium text-white dark:text-[#1A1A1A] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_12px_rgba(0,0,0,0.14)] active:translate-y-0"
                >
                  <span>Open Household</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 7h10v10" /><path d="M7 17 17 7" />
                  </svg>
                </Link>
              </Magnet>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-[#71716E] dark:text-[#A8A7A0] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Magnet magnetStrength={0.2}>
                  <Link
                    to="/register"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-transparent bg-[#1A1A1A] dark:bg-white px-5 py-2 text-sm font-medium text-white dark:text-[#1A1A1A] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_12px_rgba(0,0,0,0.14)] active:translate-y-0"
                  >
                    <span>Start creating</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 7h10v10" /><path d="M7 17 17 7" />
                    </svg>
                  </Link>
                </Magnet>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-full text-[#1A1A1A] dark:text-white hover:bg-[#EAE8E1] dark:hover:bg-[#252522] transition-all"
            >
              <span className="text-sm font-bold">{isDark ? '☼' : '☾'}</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-[#1A1A1A] dark:text-white hover:bg-[#EAE8E1] dark:hover:bg-[#252522] transition-all"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#E8E7E1] dark:border-[#2A2A28] bg-white dark:bg-[#141413] px-6 py-6 space-y-4 shadow-xl animate-dropdown">
            <nav className="flex flex-col space-y-3 text-base font-medium">
              {[
                { id: 'why', label: '01 Why RoomSync' },
                { id: 'features', label: '02 Features' },
                { id: 'process', label: '03 The process' },
                { id: 'sandbox', label: '04 Live Preview' },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`py-2 border-b border-[#E8E7E1] dark:border-[#2A2A28] transition-colors ${
                    activeSection === item.id ? 'text-[#1A1A1A] dark:text-white font-semibold pl-2' : 'text-[#71716E] dark:text-[#8E8E88]'
                  }`}
                >
                  {item.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowFaqModal(true);
                }}
                className="py-2 text-left border-b border-[#E8E7E1] dark:border-[#2A2A28] text-[#71716E] dark:text-[#8E8E88] font-medium"
              >
                05 FAQ & Questions
              </button>
            </nav>
            <div className="pt-3 border-t border-[#E8E7E1] dark:border-[#2A2A28] flex flex-col gap-2">
              <Link to="/register" className="w-full text-center py-3 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] text-sm font-medium">
                Start creating &rarr;
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* 2. SPARKDESIGN SPLIT HERO SECTION WITH CANVAS PREVIEW */}
      {/* ======================================================== */}
      <section className="overflow-clip border-b border-[#E8E7E1] dark:border-[#2A2A28] pt-12 pb-24 sm:pt-20 sm:pb-28 bg-[#FAF9F5] dark:bg-[#0E0E0D] transition-colors duration-300">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16 px-6 sm:px-10 lg:px-14">
          {/* Left Hero Content */}
          <ScrollReveal direction="up" distance={20} duration={0.65} className="space-y-6 max-w-xl">
            {/* Sparkdesign Pill Badge */}
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full bg-[#EAE8E1] dark:bg-[#1E1E1C] px-3.5 py-1.5 text-xs font-medium text-[#1A1A1A] dark:text-[#FAF9F5] transition-all hover:-translate-y-0.5 hover:bg-[#E2E1DA] dark:hover:bg-[#252522] border border-transparent dark:border-[#2E2E2A]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
              </svg>
              <span>A shared space for good ideas & shared living</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 7h10v10" /><path d="M7 17 17 7" />
              </svg>
            </a>

            {/* Sparkdesign Large Clean Sans Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] leading-[1.12] font-normal tracking-[-0.045em] text-[#1A1A1A] dark:text-white">
              Organize. Split. Harmonize.<br />
              <span className="text-[#71716E] dark:text-[#8E8E88]">Good living, together.</span>
            </h1>

            <p className="text-base sm:text-lg leading-normal tracking-[-0.025em] text-[#71716E] dark:text-[#A8A7A0] max-w-md">
              Bring your chores, expenses, grocery runs, and house decisions into one beautifully simple workspace for you and your flatmates.
            </p>

            {/* Sparkdesign Quick Action Input Form */}
            <div className="w-full max-w-md pt-2">
              <form onSubmit={handleQuickSubmit} className="flex items-center gap-2.5">
                <input
                  type="email"
                  value={quickEmail}
                  onChange={(e) => setQuickEmail(e.target.value)}
                  placeholder="Your email goes here"
                  className="h-12 flex-1 rounded-full border border-transparent dark:border-[#2E2E2A] bg-[#EAE8E1] dark:bg-[#1E1E1C] px-5 py-3 text-sm text-[#1A1A1A] dark:text-white placeholder-[#71716E] dark:placeholder-[#888880] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white transition-colors"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-transparent bg-[#1A1A1A] dark:bg-white hover:bg-black dark:hover:bg-[#FAF9F5] px-6 py-3 text-sm font-medium text-white dark:text-[#1A1A1A] transition-all hover:-translate-y-0.5 hover:shadow-[0_5px_12px_rgba(0,0,0,0.14)] shrink-0 active:scale-95 cursor-pointer"
                >
                  <span>Start creating</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 7h10v10" /><path d="M7 17 17 7" />
                  </svg>
                </button>
              </form>
              <p className="mt-2.5 text-[11px] text-[#71716E] dark:text-[#888880] px-3">
                A little preview. No credit card needed. Instant invite code.
              </p>
            </div>

            {/* Sparkdesign Roommate Social Proof Stack */}
            <div className="pt-2 flex items-center gap-3 text-xs tracking-[-0.025em] text-[#71716E] dark:text-[#A8A7A0]">
              <div className="flex items-center -space-x-2">
                <img
                  src="https://images.unsplash.com/photo-1548382131-e0ebb1f0cdea?auto=format&fit=crop&w=64&q=80"
                  alt="Alex"
                  className="w-7 h-7 rounded-lg border-2 border-[#FAF9F5] dark:border-[#0E0E0D] object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1670095044002-3b45b6ad8a01?auto=format&fit=crop&w=64&q=80"
                  alt="Maya"
                  className="w-7 h-7 rounded-lg border-2 border-[#FAF9F5] dark:border-[#0E0E0D] object-cover"
                />
                <span className="w-7 h-7 rounded-lg border-2 border-[#FAF9F5] dark:border-[#0E0E0D] bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-white font-medium text-[9px] flex items-center justify-center">
                  you
                </span>
              </div>
              <span>
                <strong className="text-[#1A1A1A] dark:text-white font-medium">For the way you share space.</strong> Solo, or together.
              </span>
            </div>
          </ScrollReveal>

          {/* Right Hero Column: Sparkdesign Aspect Canvas Card */}
          <div className="relative flex items-center justify-center">
            <Hero3DCardStage />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. "WHY ROOMSYNC" / PHILOSOPHY (SPARKDESIGN 3-COLUMN) */}
      {/* ======================================================== */}
      <section id="why" className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 pt-28 pb-20 border-b border-[#E8E7E1] dark:border-[#2A2A28] bg-[#FAF9F5] dark:bg-[#0E0E0D] transition-colors duration-300">
        <ScrollReveal direction="up" className="grid grid-cols-1 md:grid-cols-2 items-end gap-8 mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] leading-[1.2] font-normal tracking-[-0.035em] text-[#1A1A1A] dark:text-white">
            Less getting in the way.<br />More getting carried away.
          </h2>
          <p className="text-base sm:text-lg leading-normal tracking-[-0.025em] text-[#71716E] dark:text-[#A8A7A0] max-w-md md:ml-auto">
            Shared living needs room to breathe. We give your home a simpler place to coordinate chores, split bills, and live peacefully.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <ScrollReveal direction="up" delay={0.1} className="h-full">
            <article className="h-full rounded-3xl border border-[#E8E7E1] dark:border-[#2A2A28] bg-white dark:bg-[#141413] p-8 transition-all duration-250 hover:-translate-y-1 hover:border-[#1A1A1A]/30 dark:hover:border-white/20 hover:bg-[#FAF9F5] dark:hover:bg-[#181816] flex flex-col justify-between">
              <div>
                <span className="mb-6 grid size-12 place-items-center rounded-[14px] bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-white">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
                    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
                    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
                  </svg>
                </span>
                <h3 className="mb-2.5 text-xl font-medium tracking-[-0.04em] text-[#1A1A1A] dark:text-white">
                  One place to find your rhythm
                </h3>
                <p className="text-sm sm:text-base leading-normal tracking-[-0.025em] text-[#71716E] dark:text-[#A8A7A0]">
                  Chores, grocery lists, and utility balances in one quiet space so everyone knows what is done without micro-management.
                </p>
              </div>
              <span className="mt-6 text-xs font-medium text-[#1A1A1A] dark:text-white">Automated rotations &rarr;</span>
            </article>
          </ScrollReveal>

          {/* Card 2 */}
          <ScrollReveal direction="up" delay={0.2} className="h-full">
            <article className="h-full rounded-3xl border border-[#E8E7E1] dark:border-[#2A2A28] bg-white dark:bg-[#141413] p-8 transition-all duration-250 hover:-translate-y-1 hover:border-[#1A1A1A]/30 dark:hover:border-white/20 hover:bg-[#FAF9F5] dark:hover:bg-[#181816] flex flex-col justify-between">
              <div>
                <span className="mb-6 grid size-12 place-items-center rounded-[14px] bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-white">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
                  </svg>
                </span>
                <h3 className="mb-2.5 text-xl font-medium tracking-[-0.04em] text-[#1A1A1A] dark:text-white">
                  Clarity that keeps the peace
                </h3>
                <p className="text-sm sm:text-base leading-normal tracking-[-0.025em] text-[#71716E] dark:text-[#A8A7A0]">
                  Multi-party debt simplification eliminates endless back-and-forth bank transfers. Settle up cleanly with total transparency.
                </p>
              </div>
              <span className="mt-6 text-xs font-medium text-[#1A1A1A] dark:text-white">Debt simplification &rarr;</span>
            </article>
          </ScrollReveal>

          {/* Card 3 */}
          <ScrollReveal direction="up" delay={0.3} className="h-full">
            <article className="h-full rounded-3xl border border-[#E8E7E1] dark:border-[#2A2A28] bg-white dark:bg-[#141413] p-8 transition-all duration-250 hover:-translate-y-1 hover:border-[#1A1A1A]/30 dark:hover:border-white/20 hover:bg-[#FAF9F5] dark:hover:bg-[#181816] flex flex-col justify-between">
              <div>
                <span className="mb-6 grid size-12 place-items-center rounded-[14px] bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-white">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M7 12h10" />
                  </svg>
                </span>
                <h3 className="mb-2.5 text-xl font-medium tracking-[-0.04em] text-[#1A1A1A] dark:text-white">
                  Space to make it your own
                </h3>
                <p className="text-sm sm:text-base leading-normal tracking-[-0.025em] text-[#71716E] dark:text-[#A8A7A0]">
                  From package pickup favors to group decision polls, customize your household workflow to match your home's unique rhythm.
                </p>
              </div>
              <span className="mt-6 text-xs font-medium text-[#1A1A1A] dark:text-white">Favors & Polls &rarr;</span>
            </article>
          </ScrollReveal>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. AUDIENCE MARQUEE (SPARKDESIGN SCROLL-DRIVEN SWING) */}
      {/* ======================================================== */}
      <section className="overflow-hidden py-20 border-b border-[#E8E7E1] dark:border-[#2A2A28] bg-[#FAF9F5] dark:bg-[#0E0E0D] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.035em] text-[#1A1A1A] dark:text-white">
            For every shared living space.
          </h2>
          <p className="mt-2 text-sm text-[#71716E] dark:text-[#A8A7A0]">
            Designed for flats, suites, co-living homes, and shared apartments of every size.
          </p>
        </div>

        {/* Scroll-Driven Side-by-Side Swing Motion */}
        <ScrollSwingMarquee row1Items={audienceRow1} row2Items={audienceRow2} />
      </section>

      {/* ======================================================== */}
      {/* 5. RICH BENTO FEATURES SHOWCASE (SPARKDESIGN IMAGE 3) */}
      {/* ======================================================== */}
      <BentoFeatures />

      {/* ======================================================== */}
      {/* 6. THE PROCESS / WORKFLOW (SPARKDESIGN CENTERED STAGE) */}
      {/* ======================================================== */}
      <TheProcessStage />

      {/* ======================================================== */}
      {/* 7. INTERACTIVE LIVE SANDBOX */}
      {/* ======================================================== */}
      <section id="sandbox" className="py-24 border-b border-[#E8E7E1] dark:border-[#2A2A28] bg-[#FAF9F5] dark:bg-[#0E0E0D] transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          <ScrollReveal direction="up" className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#71716E] dark:text-[#8E8E88]">Interactive Preview</span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.035em] text-[#1A1A1A] dark:text-white mt-2">
              Try the household workspace right now.
            </h2>
          </ScrollReveal>

          <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
              <div>
                <h3 className="text-base font-medium text-[#1A1A1A] dark:text-white">
                  The Maple Flat • Live Demo
                </h3>
                <span className="text-[11px] text-[#71716E] dark:text-[#888880]">Click tasks to complete or add new ones</span>
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#FAF9F5] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-[#FAF9F5] border border-[#E8E7E1] dark:border-[#2E2E2A]">
                {sandboxChores.filter(c => c.done).length} of {sandboxChores.length} completed
              </span>
            </div>

            {/* Task list */}
            <div className="space-y-2.5">
              {sandboxChores.map((c) => (
                <div
                  key={c.id}
                  onClick={() => toggleChore(c.id)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer select-none transition-all duration-200 text-xs ${
                    c.done
                      ? 'bg-[#FAF9F5] dark:bg-[#111110] border-[#E8E7E1] dark:border-[#222220] text-[#71716E] dark:text-[#666660]'
                      : 'bg-white dark:bg-[#181816] hover:bg-[#FAF9F5] dark:hover:bg-[#1E1E1C] border-[#E8E7E1] dark:border-[#2A2A28] text-[#1A1A1A] dark:text-[#FAF9F5] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                      c.done ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A]' : 'border border-[#71716E]/40 dark:border-white/30'
                    }`}>
                      {c.done && '✓'}
                    </span>
                    <span className={c.done ? 'line-through text-[#71716E] dark:text-[#666660]' : 'font-medium text-[#1A1A1A] dark:text-white'}>
                      {c.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#71716E] dark:text-[#888880]">
                    {c.person} • {c.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Add task input */}
            <form onSubmit={addChore} className="pt-1 flex items-center gap-2">
              <input
                type="text"
                value={newChoreText}
                onChange={(e) => setNewChoreText(e.target.value)}
                placeholder="Type a new task (e.g. Empty recycling, Restock dish soap)..."
                className="flex-1 bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] dark:text-white placeholder-[#71716E] dark:placeholder-[#888880] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#1A1A1A] dark:bg-white hover:bg-black dark:hover:bg-[#FAF9F5] text-white dark:text-[#1A1A1A] text-xs font-medium transition-all cursor-pointer"
              >
                + Add Task
              </button>
            </form>

            {/* Split Calculator */}
            <div className="pt-4 border-t border-[#E8E7E1] dark:border-[#2A2A28] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#1A1A1A] dark:text-[#FAF9F5]">Instant Split Calculator:</span>
                <span className="text-xs font-bold text-[#1A1A1A] dark:text-white">
                  ₹{Math.round(simBillAmount / simRoommateCount).toLocaleString()} / flatmate
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] text-[#71716E] dark:text-[#A8A7A0] block mb-1">Total Bill: ₹{simBillAmount}</label>
                  <input
                    type="range"
                    min="300"
                    max="6000"
                    step="150"
                    value={simBillAmount}
                    onChange={(e) => setSimBillAmount(Number(e.target.value))}
                    className="w-full accent-[#1A1A1A] dark:accent-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#71716E] dark:text-[#A8A7A0] block mb-1">Roommates: {simRoommateCount} people</label>
                  <div className="flex gap-2">
                    {[2, 3, 4, 5].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setSimRoommateCount(count)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          simRoommateCount === count
                            ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] border-[#1A1A1A] dark:border-white'
                            : 'bg-[#FAF9F5] dark:bg-[#1E1E1C] border-[#E8E7E1] dark:border-[#2A2A28] text-[#1A1A1A] dark:text-[#FAF9F5]'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. ELEVATED FINAL CTA (SPARKDESIGN FLOATING CANVAS) */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden py-32 sm:py-40 bg-[#141413] text-white border-b border-[#2A2A28]">
        {/* Subtle Background Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

        {/* 6 Scattered Floating Lifestyle & Apartment Image Tiles */}
        {/* 1. Top Left - Happy Flatmate */}
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
          alt="Flatmate"
          className="absolute left-6 sm:left-12 lg:left-24 top-12 sm:top-16 size-20 sm:size-28 md:size-32 rounded-3xl object-cover -rotate-6 border border-white/10 shadow-2xl animate-float-a hidden sm:block pointer-events-none"
        />

        {/* 2. Top Right - Creative Roommate Work */}
        <img
          src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80"
          alt="Sketchbook"
          className="absolute right-6 sm:right-12 lg:right-24 top-12 sm:top-20 size-20 sm:size-28 md:size-32 rounded-3xl object-cover rotate-6 border border-white/10 shadow-2xl animate-float-b hidden sm:block pointer-events-none"
        />

        {/* 3. Middle Left - Minimalist Apartment Corner */}
        <img
          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=300&q=80"
          alt="Apartment space"
          className="absolute left-8 lg:left-32 top-1/2 -translate-y-12 size-18 sm:size-24 md:size-28 rounded-3xl object-cover -rotate-3 border border-white/10 shadow-2xl animate-float-c hidden md:block pointer-events-none"
        />

        {/* 4. Middle Right - Flatmate Portrait */}
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
          alt="Flatmate"
          className="absolute right-8 lg:right-32 top-1/2 -translate-y-8 size-18 sm:size-24 md:size-28 rounded-3xl object-cover rotate-3 border border-white/10 shadow-2xl animate-float-a hidden md:block pointer-events-none"
        />

        {/* 5. Bottom Left - Sunlit Living Space */}
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80"
          alt="Architecture hallway"
          className="absolute left-6 sm:left-12 lg:left-20 bottom-10 sm:bottom-16 size-24 sm:size-32 md:size-36 rounded-3xl object-cover rotate-2 border border-white/10 shadow-2xl animate-float-b hidden sm:block pointer-events-none"
        />

        {/* 6. Bottom Right - Balcony Courtyard View */}
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=300&q=80"
          alt="Patio garden"
          className="absolute right-6 sm:right-12 lg:right-20 bottom-10 sm:bottom-14 size-24 sm:size-32 md:size-36 rounded-3xl object-cover -rotate-6 border border-white/10 shadow-2xl animate-float-c hidden sm:block pointer-events-none"
        />

        {/* Centered Main Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center space-y-7">
          {/* Top Logo Icon */}
          <ScrollReveal direction="zoom">
            <div className="size-14 rounded-2xl bg-[#1E1E1C] border border-[#2E2E2A] flex items-center justify-center text-white mx-auto shadow-xl">
              <svg width="26" height="26" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="4" y="4" width="23" height="23" rx="8" />
                <rect x="13" y="13" width="23" height="23" rx="8" />
                <path d="M13 20h14M20 13v14" />
              </svg>
            </div>
          </ScrollReveal>

          {/* Sparkdesign Centered Headline */}
          <ScrollReveal direction="up" delay={0.1} className="space-y-3">
            <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-normal tracking-[-0.045em] text-white leading-[1.12]">
              A good idea is just the start.<br />
              Let's make something of it.
            </h2>
            <p className="text-base sm:text-lg text-[#A8A7A0] tracking-[-0.02em] max-w-lg mx-auto">
              A fresh canvas. A few good people. Your next chapter.
            </p>
          </ScrollReveal>

          {/* Quick Action Input Form with Magnet Button */}
          <ScrollReveal direction="up" delay={0.2} className="pt-2">
            <form onSubmit={handleQuickSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={quickEmail}
                onChange={(e) => setQuickEmail(e.target.value)}
                placeholder="Your email goes here"
                className="h-12 w-full sm:w-72 rounded-full border border-[#2E2E2A] bg-[#1E1E1C] px-5 text-sm text-white placeholder-[#71716E] focus:outline-none focus:border-white transition-colors"
              />
              <Magnet magnetStrength={0.2}>
                <button
                  type="submit"
                  className="h-12 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-medium text-[#1A1A1A] hover:bg-[#FAF9F5] shadow-lg transition-all active:scale-95 shrink-0 cursor-pointer"
                >
                  <span>Start creating</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M7 7h10v10" /><path d="M7 17 17 7" />
                  </svg>
                </button>
              </Magnet>
            </form>

            <p className="mt-3 text-[11px] text-[#71716E] tracking-tight">
              A little preview. No account needed. No email sent.
            </p>
            <p className="mt-6 text-xs text-[#888880]">
              Made for the things you haven't made yet.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. STRUCTURED 4-COLUMN EDITORIAL FOOTER */}
      {/* ======================================================== */}
      <footer className="border-t border-[#E8E7E1] dark:border-[#2A2A28] bg-[#FAF9F5] dark:bg-[#0E0E0D] pt-16 sm:pt-20 pb-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
          {/* 4 Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14">
            {/* Col 1: Brand & Tagline */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] flex items-center justify-center shadow-md">
                  <svg width="22" height="22" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="4" width="23" height="23" rx="8" />
                    <rect x="13" y="13" width="23" height="23" rx="8" />
                    <path d="M13 20h14M20 13v14" />
                  </svg>
                </div>
                <span className="text-2xl font-bold tracking-tight text-[#1A1A1A] dark:text-white">
                  roomsync
                </span>
              </div>
              <p className="text-sm text-[#71716E] dark:text-[#8E8E88] leading-relaxed max-w-sm">
                Pixel-precise household coordination, automated chore rotations, and debt minimization designed for high-performance shared homes.
              </p>
            </div>

            {/* Col 2: PRODUCT */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1A1A1A] dark:text-white">
                PRODUCT
              </h4>
              <ul className="space-y-2.5 text-sm text-[#71716E] dark:text-[#8E8E88]">
                <li>
                  <Link to="/dashboard" className="hover:text-[#1A1A1A] dark:hover:text-white transition-colors">
                    Live Platform
                  </Link>
                </li>
                <li>
                  <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-[#1A1A1A] dark:hover:text-white transition-colors">
                    Chore Rotations & Schedule
                  </a>
                </li>
                <li>
                  <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-[#1A1A1A] dark:hover:text-white transition-colors">
                    Expense Split & Debts
                  </a>
                </li>
                <li>
                  <a href="#sandbox" onClick={(e) => scrollToSection(e, 'sandbox')} className="hover:text-[#1A1A1A] dark:hover:text-white transition-colors">
                    Interactive Live Preview
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: RESOURCES */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1A1A1A] dark:text-white">
                RESOURCES
              </h4>
              <ul className="space-y-2.5 text-sm text-[#71716E] dark:text-[#8E8E88]">
                <li>
                  <button
                    type="button"
                    onClick={() => setShowFaqModal(true)}
                    className="text-left hover:text-[#1A1A1A] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Help Center & Support
                  </button>
                </li>
                <li>
                  <a href="#why" onClick={(e) => scrollToSection(e, 'why')} className="hover:text-[#1A1A1A] dark:hover:text-white transition-colors">
                    About RoomSync
                  </a>
                </li>
                <li>
                  <a href="#process" onClick={(e) => scrollToSection(e, 'process')} className="hover:text-[#1A1A1A] dark:hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setShowFaqModal(true)}
                    className="text-left hover:text-[#1A1A1A] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Privacy & Security
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: ACCOUNT */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1A1A1A] dark:text-white">
                ACCOUNT
              </h4>
              <ul className="space-y-2.5 text-sm text-[#71716E] dark:text-[#8E8E88]">
                <li>
                  <Link to="/login" className="hover:text-[#1A1A1A] dark:hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-[#1A1A1A] dark:hover:text-white transition-colors">
                    Create Household
                  </Link>
                </li>
                <li>
                  <Link to="/join" className="hover:text-[#1A1A1A] dark:hover:text-white transition-colors">
                    Join Household
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[#1A1A1A] dark:hover:text-white transition-colors">
                    Reset Password
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar with Divider */}
          <div className="pt-8 border-t border-[#E8E7E1] dark:border-[#2A2A28] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71716E] dark:text-[#8E8E88]">
            <p>&copy; {new Date().getFullYear()} RoomSync Inc. All rights reserved.</p>

            <div className="flex items-center gap-6">
              <button type="button" onClick={() => setShowFaqModal(true)} className="hover:text-[#1A1A1A] dark:hover:text-white transition-colors cursor-pointer">
                Privacy Policy
              </button>
              <button type="button" onClick={() => setShowFaqModal(true)} className="hover:text-[#1A1A1A] dark:hover:text-white transition-colors cursor-pointer">
                Terms of Service
              </button>
              <button type="button" onClick={() => setShowFaqModal(true)} className="hover:text-[#1A1A1A] dark:hover:text-white transition-colors cursor-pointer">
                Security Whitepaper
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
                className="size-8 rounded-lg bg-[#EAE8E1] dark:bg-[#1E1E1C] border border-[#E8E7E1] dark:border-[#2E2E2A] flex items-center justify-center text-[#1A1A1A] dark:text-[#FAF9F5] hover:scale-105 transition-transform cursor-pointer shadow-2xs"
              >
                {isDark ? '☼' : '☾'}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* 10. FAQ & HELP CENTER MODAL DIALOG */}
      {/* ======================================================== */}
      {showFaqModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in"
          onClick={() => setShowFaqModal(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#FAF9F5] dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-[#1A1A1A] dark:text-white animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#E8E7E1] dark:border-[#2A2A28] pb-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#71716E] dark:text-[#8E8E88]">
                  Help Center & Support
                </span>
                <h3 className="text-2xl font-medium tracking-tight text-[#1A1A1A] dark:text-white mt-1">
                  Frequently Asked Questions
                </h3>
                <p className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-1">
                  Everything you need to know about setting up and running your household space.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFaqModal(false)}
                className="size-9 rounded-full bg-[#EAE8E1] dark:bg-[#1E1E1C] border border-[#E8E7E1] dark:border-[#2E2E2A] flex items-center justify-center text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Questions Accordion */}
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#1E1E1C] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 text-sm font-medium text-[#1A1A1A] dark:text-white focus:outline-none cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className={`text-[#1A1A1A] dark:text-white text-lg transition-transform duration-200 ${openFaq === idx ? 'rotate-45' : ''}`}>
                      +
                    </span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-[#71716E] dark:text-[#A8A7A0] leading-relaxed border-t border-[#E8E7E1]/50 dark:border-[#2A2A28]/50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer CTA */}
            <div className="pt-4 border-t border-[#E8E7E1] dark:border-[#2A2A28] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#71716E] dark:text-[#8E8E88]">
              <span>Have another question? Ready to get started?</span>
              <Link
                to="/register"
                onClick={() => setShowFaqModal(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] font-medium text-xs hover:opacity-90 transition-opacity"
              >
                Create Household Space &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
