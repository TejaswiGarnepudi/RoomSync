import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ScrollReveal from '../components/motion/ScrollReveal';
import TiltCard from '../components/motion/TiltCard';
import Hero3DCardStage from '../components/motion/Hero3DCardStage';
import FloatingOrbs from '../components/motion/FloatingOrbs';
import Magnet from '../components/motion/Magnet';
import ScrollSwingMarquee from '../components/motion/ScrollSwingMarquee';
import BentoFeatures from '../components/motion/BentoFeatures';

export default function LandingPage() {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickEmail, setQuickEmail] = useState('');
  const [activeSection, setActiveSection] = useState('why');

  // ScrollSpy to dynamically highlight active section in Navbar
  useEffect(() => {
    const sectionIds = ['why', 'features', 'process', 'sandbox', 'faq'];
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

  // Workflow tab state with automatic continuous progression
  const [activeWorkflowTab, setActiveWorkflowTab] = useState('01');
  const workflowSteps = ['01', '02', '03', '04'];

  // Automatically cycle through 01 -> 02 -> 03 -> 04 continuously
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWorkflowTab(prev => {
        const nextIdx = (workflowSteps.indexOf(prev) + 1) % workflowSteps.length;
        return workflowSteps[nextIdx];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-[#FAF9F5] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#EAE8E1] selection:text-[#1A1A1A] overflow-x-hidden antialiased">
      {/* Top Banner if logged in */}
      {isAuthenticated && (
        <div className="bg-[#1A1A1A] text-white px-4 py-2 text-xs text-center font-medium flex items-center justify-center gap-2 animate-fade-in-up z-50">
          <span>Signed in as <strong>{user?.name}</strong>.</span>
          <Link to="/dashboard" className="underline hover:text-[#dae8b8] font-semibold transition-colors">
            Go to your household space &rarr;
          </Link>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. SPARKDESIGN FIXED HEADER */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-[24px] border-b border-[#E8E7E1] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex items-center justify-between h-20">
          {/* Logo Brand Mark (Sparkdesign double box icon + lowercase text) */}
          <Link to="/" className="flex items-center gap-3 group border-r border-[#E8E7E1] pr-8 max-md:border-0 max-md:pr-0">
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none" className="text-[#1A1A1A] transition-transform group-hover:scale-105">
              <rect x="4" y="4" width="23" height="23" rx="8" stroke="currentColor" strokeWidth="1.8" />
              <rect x="13" y="13" width="23" height="23" rx="8" stroke="currentColor" strokeWidth="1.8" />
              <path d="M13 20h14M20 13v14" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <span className="text-2xl font-medium tracking-[-1.2px] text-[#1A1A1A]">
              roomsync
            </span>
          </Link>

          {/* Desktop Navigation Links with Sparkdesign Micro-Underline and ScrollSpy */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-[-0.025em]">
            {[
              { id: 'why', label: 'Why RoomSync' },
              { id: 'features', label: 'Features' },
              { id: 'process', label: 'The process' },
              { id: 'sandbox', label: 'Live Preview' },
              { id: 'faq', label: 'FAQ' },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => scrollToSection(e, item.id)}
                className={`relative py-1 transition-colors duration-200 ${
                  activeSection === item.id
                    ? 'text-[#1A1A1A] font-semibold after:scale-x-100'
                    : 'text-[#71716E] hover:text-[#1A1A1A] after:scale-x-0'
                } after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-[#1A1A1A] after:origin-left after:transition-transform after:duration-250 hover:after:scale-x-100`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3.5">
            {isAuthenticated ? (
              <Magnet magnetStrength={0.2}>
                <Link
                  to="/dashboard"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-transparent bg-[#1A1A1A] px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_12px_rgba(0,0,0,0.14)] active:translate-y-0"
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
                  className="px-4 py-2 text-sm font-medium text-[#71716E] hover:text-[#1A1A1A] transition-colors"
                >
                  Sign in
                </Link>
                <Magnet magnetStrength={0.2}>
                  <Link
                    to="/register"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-transparent bg-[#1A1A1A] px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_12px_rgba(0,0,0,0.14)] active:translate-y-0"
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
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-[#1A1A1A] hover:bg-[#EAE8E1] transition-all"
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
          <div className="md:hidden border-b border-[#E8E7E1] bg-white px-6 py-6 space-y-4 shadow-xl animate-dropdown">
            <nav className="flex flex-col space-y-3 text-base font-medium">
              {[
                { id: 'why', label: '01 Why RoomSync' },
                { id: 'features', label: '02 Features' },
                { id: 'process', label: '03 The process' },
                { id: 'sandbox', label: '04 Live Preview' },
                { id: 'faq', label: '05 FAQ' },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`py-2 border-b border-[#E8E7E1] transition-colors ${
                    activeSection === item.id ? 'text-[#1A1A1A] font-semibold pl-2' : 'text-[#71716E]'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="pt-3 border-t border-[#E8E7E1] flex flex-col gap-2">
              <Link to="/register" className="w-full text-center py-3 rounded-full bg-[#1A1A1A] text-white text-sm font-medium">
                Start creating &rarr;
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* 2. SPARKDESIGN SPLIT HERO SECTION WITH CANVAS PREVIEW */}
      {/* ======================================================== */}
      <section className="overflow-clip border-b border-[#E8E7E1] pt-12 pb-24 sm:pt-20 sm:pb-28">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16 px-6 sm:px-10 lg:px-14">
          {/* Left Hero Content */}
          <ScrollReveal direction="up" distance={20} duration={0.65} className="space-y-6 max-w-xl">
            {/* Sparkdesign Pill Badge */}
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full bg-[#EAE8E1] px-3.5 py-1.5 text-xs font-medium text-[#1A1A1A] transition-all hover:-translate-y-0.5 hover:bg-[#E2E1DA]"
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
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] leading-[1.12] font-normal tracking-[-0.045em] text-[#1A1A1A]">
              Organize. Split. Harmonize.<br />
              <span className="text-[#71716E]">Good living, together.</span>
            </h1>

            <p className="text-base sm:text-lg leading-normal tracking-[-0.025em] text-[#71716E] max-w-md">
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
                  className="h-12 flex-1 rounded-full border border-transparent bg-[#EAE8E1] px-5 py-3 text-sm text-[#1A1A1A] placeholder-[#71716E] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-transparent bg-[#1A1A1A] hover:bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_5px_12px_rgba(0,0,0,0.14)] shrink-0 active:scale-95"
                >
                  <span>Start creating</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 7h10v10" /><path d="M7 17 17 7" />
                  </svg>
                </button>
              </form>
              <p className="mt-2.5 text-[11px] text-[#71716E] px-3">
                A little preview. No credit card needed. Instant invite code.
              </p>
            </div>

            {/* Sparkdesign Roommate Social Proof Stack */}
            <div className="pt-2 flex items-center gap-3 text-xs tracking-[-0.025em] text-[#71716E]">
              <div className="flex items-center -space-x-2">
                <img
                  src="https://images.unsplash.com/photo-1548382131-e0ebb1f0cdea?auto=format&fit=crop&w=64&q=80"
                  alt="Alex"
                  className="w-7 h-7 rounded-lg border-2 border-[#FAF9F5] object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1670095044002-3b45b6ad8a01?auto=format&fit=crop&w=64&q=80"
                  alt="Maya"
                  className="w-7 h-7 rounded-lg border-2 border-[#FAF9F5] object-cover"
                />
                <span className="w-7 h-7 rounded-lg border-2 border-[#FAF9F5] bg-[#EAE8E1] text-[#1A1A1A] font-medium text-[9px] flex items-center justify-center">
                  you
                </span>
              </div>
              <span>
                <strong className="text-[#1A1A1A] font-medium">For the way you share space.</strong> Solo, or together.
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
      <section id="why" className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 pt-28 pb-20 border-b border-[#E8E7E1]">
        <ScrollReveal direction="up" className="grid grid-cols-1 md:grid-cols-2 items-end gap-8 mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] leading-[1.2] font-normal tracking-[-0.035em] text-[#1A1A1A]">
            Less getting in the way.<br />More getting carried away.
          </h2>
          <p className="text-base sm:text-lg leading-normal tracking-[-0.025em] text-[#71716E] max-w-md md:ml-auto">
            Shared living needs room to breathe. We give your home a simpler place to coordinate chores, split bills, and live peacefully.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <ScrollReveal direction="up" delay={0.1} className="h-full">
            <article className="h-full rounded-3xl border border-[#E8E7E1] bg-white p-8 transition-all duration-250 hover:-translate-y-1 hover:border-[#1A1A1A]/30 hover:bg-[#FAF9F5] flex flex-col justify-between">
              <div>
                <span className="mb-6 grid size-12 place-items-center rounded-[14px] bg-[#EAE8E1] text-[#1A1A1A]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
                    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
                    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
                  </svg>
                </span>
                <h3 className="mb-2.5 text-xl font-medium tracking-[-0.04em] text-[#1A1A1A]">
                  One place to find your rhythm
                </h3>
                <p className="text-sm sm:text-base leading-normal tracking-[-0.025em] text-[#71716E]">
                  Chores, grocery lists, and utility balances in one quiet space so everyone knows what is done without micro-management.
                </p>
              </div>
              <span className="mt-6 text-xs font-medium text-[#1A1A1A]">Automated rotations &rarr;</span>
            </article>
          </ScrollReveal>

          {/* Card 2 */}
          <ScrollReveal direction="up" delay={0.2} className="h-full">
            <article className="h-full rounded-3xl border border-[#E8E7E1] bg-white p-8 transition-all duration-250 hover:-translate-y-1 hover:border-[#1A1A1A]/30 hover:bg-[#FAF9F5] flex flex-col justify-between">
              <div>
                <span className="mb-6 grid size-12 place-items-center rounded-[14px] bg-[#EAE8E1] text-[#1A1A1A]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
                  </svg>
                </span>
                <h3 className="mb-2.5 text-xl font-medium tracking-[-0.04em] text-[#1A1A1A]">
                  Clarity that keeps the peace
                </h3>
                <p className="text-sm sm:text-base leading-normal tracking-[-0.025em] text-[#71716E]">
                  Multi-party debt simplification eliminates endless back-and-forth bank transfers. Settle up cleanly with total transparency.
                </p>
              </div>
              <span className="mt-6 text-xs font-medium text-[#1A1A1A]">Debt simplification &rarr;</span>
            </article>
          </ScrollReveal>

          {/* Card 3 */}
          <ScrollReveal direction="up" delay={0.3} className="h-full">
            <article className="h-full rounded-3xl border border-[#E8E7E1] bg-white p-8 transition-all duration-250 hover:-translate-y-1 hover:border-[#1A1A1A]/30 hover:bg-[#FAF9F5] flex flex-col justify-between">
              <div>
                <span className="mb-6 grid size-12 place-items-center rounded-[14px] bg-[#EAE8E1] text-[#1A1A1A]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M7 12h10" />
                  </svg>
                </span>
                <h3 className="mb-2.5 text-xl font-medium tracking-[-0.04em] text-[#1A1A1A]">
                  Space to make it your own
                </h3>
                <p className="text-sm sm:text-base leading-normal tracking-[-0.025em] text-[#71716E]">
                  From package pickup favors to group decision polls, customize your household workflow to match your home's unique rhythm.
                </p>
              </div>
              <span className="mt-6 text-xs font-medium text-[#1A1A1A]">Favors & Polls &rarr;</span>
            </article>
          </ScrollReveal>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. AUDIENCE MARQUEE (SPARKDESIGN SCROLL-DRIVEN SWING) */}
      {/* ======================================================== */}
      <section className="overflow-hidden py-20 border-b border-[#E8E7E1] bg-[#FAF9F5]">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.035em] text-[#1A1A1A]">
            For every shared living space.
          </h2>
          <p className="mt-2 text-sm text-[#71716E]">
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
      {/* 6. THE PROCESS / WORKFLOW (SPARKDESIGN STAGE TABS) */}
      {/* ======================================================== */}
      <section id="process" className="py-24 border-b border-[#E8E7E1] bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
          <ScrollReveal direction="up" className="max-w-xl mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#71716E]">The Process</span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.035em] text-[#1A1A1A] mt-2">
              How RoomSync keeps your home synchronized.
            </h2>
            <p className="mt-3 text-base text-[#71716E]">
              Four simple steps that replace disorganized group chats with calm household flow.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Tabs */}
            <div className="lg:col-span-5 space-y-2.5">
              {[
                { id: '01', title: '01 Create & Invite', desc: 'Create your household space in seconds and share the 8-character code.' },
                { id: '02', title: '02 Set Chore Rotations', desc: 'Add recurring cleaning tasks and let the scheduler automate turns.' },
                { id: '03', title: '03 Track & Split Expenses', desc: 'Log shared bills and receipts with automatic debt simplification.' },
                { id: '04', title: '04 Vote & Coordinate', desc: 'Create decision polls, manage grocery restocks, and request quick favors.' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveWorkflowTab(tab.id)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 ${
                    activeWorkflowTab === tab.id
                      ? 'bg-[#FAF9F5] border-[#1A1A1A] shadow-xs'
                      : 'bg-transparent border-transparent hover:bg-[#FAF9F5]/60 text-[#71716E]'
                  }`}
                >
                  <span className="font-medium text-base text-[#1A1A1A] block">{tab.title}</span>
                  <p className="text-xs text-[#71716E] mt-1">{tab.desc}</p>
                </button>
              ))}
            </div>

            {/* Right Preview */}
            <div className="lg:col-span-7">
              <div className="bg-[#FAF9F5] border border-[#E8E7E1] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E1]">
                  <span className="text-xs font-semibold text-[#1A1A1A]">
                    {activeWorkflowTab === '01' && 'Stage 01: Household Space Created'}
                    {activeWorkflowTab === '02' && 'Stage 02: Intelligent Chore Rotations'}
                    {activeWorkflowTab === '03' && 'Stage 03: Expense Splitting & Debt Graph'}
                    {activeWorkflowTab === '04' && 'Stage 04: Group Decisions & Living Sync'}
                  </span>
                  <span className="text-[10px] font-medium text-[#1A1A1A] bg-white px-3 py-1 rounded-full border border-[#E8E7E1]">
                    ● Active
                  </span>
                </div>

                {activeWorkflowTab === '01' && (
                  <div className="p-4 bg-white rounded-2xl border border-[#E8E7E1] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#1A1A1A]">Household Invite Code</span>
                      <span className="font-mono font-bold text-sm bg-[#FAF9F5] px-3 py-1 rounded-lg border border-[#E8E7E1] text-[#1A1A1A]">
                        MAPLE-3B
                      </span>
                    </div>
                    <p className="text-[11px] text-[#71716E]">
                      Share this code with your flatmates to link their accounts to the shared calendar, chores, and balances instantly.
                    </p>
                  </div>
                )}

                {activeWorkflowTab === '02' && (
                  <div className="p-4 bg-white rounded-2xl border border-[#E8E7E1] space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#1A1A1A]">Weekly Rotation Balance</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">100% Equal Parity</span>
                    </div>
                    <div className="w-full bg-[#FAF9F5] h-2.5 rounded-full overflow-hidden flex border border-[#E8E7E1]">
                      <div className="bg-[#1A1A1A] w-1/3" title="Alex: 33%"></div>
                      <div className="bg-[#71716E] w-1/3" title="Maya: 33%"></div>
                      <div className="bg-[#A8A7A0] w-1/3" title="You: 34%"></div>
                    </div>
                    <span className="text-[10px] text-[#71716E] block text-right">3 flatmates • Automatic turns</span>
                  </div>
                )}

                {activeWorkflowTab === '03' && (
                  <div className="p-4 bg-white rounded-2xl border border-[#E8E7E1] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#1A1A1A]">Simplified Balances</span>
                      <span className="text-xs font-semibold text-emerald-700">1 transfer needed</span>
                    </div>
                    <div className="p-2.5 bg-[#FAF9F5] rounded-xl border border-[#E8E7E1] flex items-center justify-between">
                      <span>Maya pays Alex ₹413.33</span>
                      <span className="font-semibold text-[#1A1A1A]">All settled</span>
                    </div>
                  </div>
                )}

                {activeWorkflowTab === '04' && (
                  <div className="p-4 bg-white rounded-2xl border border-[#E8E7E1] space-y-2 text-xs">
                    <span className="font-medium text-[#1A1A1A] block">Active Poll: Host Friday Dinner</span>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9F5] border border-[#E8E7E1]">
                      <span>Yes, let's host! (Alex, Maya)</span>
                      <span className="font-semibold text-[#1A1A1A]">67%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. INTERACTIVE LIVE SANDBOX */}
      {/* ======================================================== */}
      <section id="sandbox" className="py-24 border-b border-[#E8E7E1] bg-[#FAF9F5]">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          <ScrollReveal direction="up" className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#71716E]">Interactive Preview</span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.035em] text-[#1A1A1A] mt-2">
              Try the household workspace right now.
            </h2>
          </ScrollReveal>

          <div className="bg-white border border-[#E8E7E1] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E1]">
              <div>
                <h3 className="text-base font-medium text-[#1A1A1A]">
                  The Maple Flat • Live Demo
                </h3>
                <span className="text-[11px] text-[#71716E]">Click tasks to complete or add new ones</span>
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#FAF9F5] text-[#1A1A1A] border border-[#E8E7E1]">
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
                      ? 'bg-[#FAF9F5] border-[#E8E7E1] text-[#71716E]'
                      : 'bg-white hover:bg-[#FAF9F5] border-[#E8E7E1] text-[#1A1A1A] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                      c.done ? 'bg-[#1A1A1A] text-white' : 'border border-[#71716E]/40'
                    }`}>
                      {c.done && '✓'}
                    </span>
                    <span className={c.done ? 'line-through text-[#71716E]' : 'font-medium text-[#1A1A1A]'}>
                      {c.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#71716E]">
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
                className="flex-1 bg-[#FAF9F5] border border-[#E8E7E1] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] placeholder-[#71716E] focus:outline-none focus:border-[#1A1A1A]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-black text-white text-xs font-medium transition-all"
              >
                + Add Task
              </button>
            </form>

            {/* Split Calculator */}
            <div className="pt-4 border-t border-[#E8E7E1] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#1A1A1A]">Instant Split Calculator:</span>
                <span className="text-xs font-bold text-[#1A1A1A]">
                  ₹{Math.round(simBillAmount / simRoommateCount).toLocaleString()} / flatmate
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] text-[#71716E] block mb-1">Total Bill: ₹{simBillAmount}</label>
                  <input
                    type="range"
                    min="300"
                    max="6000"
                    step="150"
                    value={simBillAmount}
                    onChange={(e) => setSimBillAmount(Number(e.target.value))}
                    className="w-full accent-[#1A1A1A] cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#71716E] block mb-1">Roommates: {simRoommateCount} people</label>
                  <div className="flex gap-2">
                    {[2, 3, 4, 5].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setSimRoommateCount(count)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          simRoommateCount === count
                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                            : 'bg-[#FAF9F5] border-[#E8E7E1] text-[#1A1A1A]'
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
      {/* 8. FAQ ACCORDION */}
      {/* ======================================================== */}
      <section id="faq" className="py-24 border-b border-[#E8E7E1] bg-[#FAF9F5]">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          <ScrollReveal direction="up" className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#71716E]">Questions & Answers</span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.035em] text-[#1A1A1A] mt-2">
              Frequently asked questions.
            </h2>
          </ScrollReveal>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-[#E8E7E1] rounded-2xl overflow-hidden transition-colors">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 text-base font-medium text-[#1A1A1A] focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <span className={`text-[#1A1A1A] text-xl transition-transform duration-200 ${openFaq === idx ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-6 text-sm text-[#71716E] leading-relaxed animate-fade-in-up">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. ELEVATED FINAL CTA (SPARKDESIGN DARK THEMED ACCENT) */}
      {/* ======================================================== */}
      <section className="py-24 bg-[#FAF9F5]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <ScrollReveal direction="zoom" className="rounded-[32px] bg-[#1A1A1A] text-white p-10 sm:p-16 text-center space-y-6 shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#A8A7A0]">Get Started Today</span>
              <h2 className="text-3xl sm:text-5xl font-normal tracking-tight text-white">
                Make your household easier to manage.
              </h2>
              <p className="text-sm sm:text-base text-[#D0CFC9] leading-relaxed">
                Bring all everyday flatmate responsibilities into one calm shared space. Set up your home in under two minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
                <Magnet magnetStrength={0.18}>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium rounded-full bg-white text-[#1A1A1A] hover:bg-[#FAF9F5] shadow-md transition-all active:scale-95"
                  >
                    <span>Create your household free</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M7 7h10v10" /><path d="M7 17 17 7" />
                    </svg>
                  </Link>
                </Magnet>
                <Magnet magnetStrength={0.18}>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-block px-8 py-3.5 text-sm font-medium rounded-full bg-[#2A2A2A] hover:bg-[#333333] text-white transition-all active:scale-95"
                  >
                    Sign in
                  </Link>
                </Magnet>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. MINIMALIST EDITORIAL FOOTER */}
      {/* ======================================================== */}
      <footer className="border-t border-[#E8E7E1] bg-white py-12 text-xs text-[#71716E]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none" className="text-[#1A1A1A]">
              <rect x="4" y="4" width="23" height="23" rx="8" stroke="currentColor" strokeWidth="1.8" />
              <rect x="13" y="13" width="23" height="23" rx="8" stroke="currentColor" strokeWidth="1.8" />
              <path d="M13 20h14M20 13v14" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <div>
              <span className="font-medium text-[#1A1A1A] text-sm tracking-[-0.8px]">roomsync</span>
              <p className="text-[#71716E] mt-0.5">Household journal and shared living operating system.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="#why" className="hover:text-[#1A1A1A] transition-colors">Why RoomSync</a>
            <a href="#process" className="hover:text-[#1A1A1A] transition-colors">The process</a>
            <a href="#features" className="hover:text-[#1A1A1A] transition-colors">Capabilities</a>
            <a href="#faq" className="hover:text-[#1A1A1A] transition-colors">FAQ</a>
            <Link to="/login" className="hover:text-[#1A1A1A] transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-[#1A1A1A] transition-colors">Register</Link>
          </div>

          <div>
            &copy; {new Date().getFullYear()} roomsync. Good things, together.
          </div>
        </div>
      </footer>
    </div>
  );
}
