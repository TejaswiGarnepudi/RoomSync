import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ScrollReveal from '../components/motion/ScrollReveal';
import TiltCard from '../components/motion/TiltCard';
import Hero3DCardStage from '../components/motion/Hero3DCardStage';
import FloatingOrbs from '../components/motion/FloatingOrbs';

export default function LandingPage() {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickEmail, setQuickEmail] = useState('');

  // Workflow tab state
  const [activeWorkflowTab, setActiveWorkflowTab] = useState('01');

  // Interactive sandbox state
  const [sandboxChores, setSandboxChores] = useState([
    { id: 1, title: 'Wipe kitchen island & stove', person: 'Alex', done: true, time: '08:45 AM' },
    { id: 2, title: 'Restock cold brew & oat milk', person: 'You', done: false, time: 'Today 10:15 AM' },
    { id: 3, title: 'Water balcony monstera', person: 'Maya', done: false, time: '11:00 AM' }
  ]);
  const [newChoreText, setNewChoreText] = useState('');

  // Sandbox mode: 'compatibility' | 'household'
  const [sandboxMode, setSandboxMode] = useState('compatibility');

  // Roommate simulator preferences state
  const [simBudget, setSimBudget] = useState(14000);
  const [simSchedule, setSimSchedule] = useState('early'); // 'early' | 'night'
  const [simCleanliness, setSimCleanliness] = useState('weekly'); // 'daily' | 'weekly'
  const [simCooking, setSimCooking] = useState('shared'); // 'shared' | 'independent'
  const [simGuestVibe, setSimGuestVibe] = useState('balanced'); // 'quiet' | 'balanced' | 'social'
  const [requestSent, setRequestSent] = useState(false);

  // Compute live simulated compatibility score with "Maya Sharma" (Early riser, 12k-16k budget, weekly chores, shared cooking, balanced guests)
  const computeMatchScore = () => {
    let score = 70;
    // Budget proximity (optimal around 12,000 - 15,000)
    if (simBudget >= 11000 && simBudget <= 17000) score += 12;
    else if (simBudget >= 9000 && simBudget <= 20000) score += 6;

    // Schedule
    if (simSchedule === 'early') score += 8;

    // Cleanliness
    if (simCleanliness === 'weekly' || simCleanliness === 'daily') score += 5;

    // Cooking
    if (simCooking === 'shared') score += 3;

    // Guest vibe
    if (simGuestVibe === 'balanced') score += 2;

    return Math.min(score, 98);
  };

  const currentScore = computeMatchScore();

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

  const faqs = [
    {
      q: 'How does RoomSync match compatible roommates?',
      a: 'RoomSync calculates deep lifestyle compatibility based on shared budget parameters, sleep & wake cycles, cleanliness expectations, cooking preferences, and quiet hours to help you find roommates you naturally get along with.'
    },
    {
      q: 'How does RoomSync simplify shared roommate living once we move in?',
      a: 'RoomSync unites recurring chores with automated fair rotations, shared expenses with multi-party debt simplification, real-time grocery lists, favor requests, and decision polls into a single synchronized household space.'
    },
    {
      q: 'Can roommates join without creating complex accounts?',
      a: 'Yes. Once a household is created, roommates simply join using an 8-character invite code (e.g. MAPLE38) to instantly access the shared calendar, lists, and balances.'
    },
    {
      q: 'How does the expense split and debt settlement work?',
      a: 'When you log groceries or utility bills, RoomSync calculates each person\'s exact share. Its multi-party debt algorithm automatically cancels out redundant transfers so you only make the minimum necessary payments.'
    },
    {
      q: 'Are chores rotated fairly between roommates?',
      a: 'Yes. RoomSync supports automatic rotation cycles (daily, weekly, monthly) and takes member availability into account so responsibilities remain evenly distributed.'
    },
    {
      q: 'Can we vote on household decisions and quiet hours?',
      a: 'Yes. The built-in Decisions & Polls module lets anyone propose household ideas (like guest rules or weekend dinners) with deadline tracking and real-time voting.'
    },
    {
      q: 'Is RoomSync responsive on mobile phones and tablets?',
      a: 'Absolutely. RoomSync is built with a mobile-first responsive architecture with real-time socket updates across every phone, laptop, and tablet in the house.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4EDE3] text-[#234653] flex flex-col font-sans selection:bg-[#F2D4C8] selection:text-[#234653] overflow-x-hidden">
      {/* Top Banner if logged in */}
      {isAuthenticated && (
        <div className="bg-[#234653] text-[#FFF9F1] px-4 py-2.5 text-xs text-center font-medium flex items-center justify-center gap-2 animate-fade-in-up z-50">
          <span>Signed in as <strong>{user?.name}</strong>.</span>
          <Link to="/dashboard" className="underline hover:text-[#F2D4C8] font-semibold transition-colors">
            Go to your household space &rarr;
          </Link>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. SPARKDESIGN FIXED HEADER */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#F4EDE3]/85 backdrop-blur-[24px] border-b border-[#E8DEC8]/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex items-center justify-between h-20">
          {/* Logo Brand Mark */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#234653] text-[#FFF9F1] flex items-center justify-center font-serif text-lg font-bold shadow-xs group-hover:bg-[#17272C] group-hover:scale-105 group-active:scale-95 transition-all duration-200">
              ✦
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#234653] font-serif-editorial leading-none group-hover:text-[#17272C] transition-colors">
                RoomSync
              </span>
              <span className="text-[9px] uppercase font-bold text-[#3E737C] tracking-widest mt-0.5 opacity-75">
                Roommate Discovery & Shared Living
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Sparkdesign Micro-Underline */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-[-0.02em] text-[#3E737C]">
            <a href="#why" className="relative py-1 transition-colors hover:text-[#234653] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#E86F5A] after:transition-transform after:duration-200 hover:after:scale-x-100">
              Why RoomSync
            </a>
            <a href="#process" className="relative py-1 transition-colors hover:text-[#234653] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#E86F5A] after:transition-transform after:duration-200 hover:after:scale-x-100">
              The Process
            </a>
            <a href="#sandbox" className="relative py-1 transition-colors hover:text-[#234653] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#E86F5A] after:transition-transform after:duration-200 hover:after:scale-x-100">
              Live Simulator
            </a>
            <a href="#features" className="relative py-1 transition-colors hover:text-[#234653] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#E86F5A] after:transition-transform after:duration-200 hover:after:scale-x-100">
              Capabilities
            </a>
            <a href="#faq" className="relative py-1 transition-colors hover:text-[#234653] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#E86F5A] after:transition-transform after:duration-200 hover:after:scale-x-100">
              FAQ
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3.5">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-[#E86F5A] hover:bg-[#D65D48] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-xs hover:shadow-md hover:-translate-y-0.5 btn-shimmer btn-interactive transition-all duration-200 active:scale-95"
              >
                Open Household &rarr;
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#234653] hover:text-[#17272C] hover:bg-[#FAF5ED] rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-[#E86F5A] hover:bg-[#D65D48] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-xs hover:shadow-md hover:-translate-y-0.5 btn-shimmer btn-interactive transition-all duration-200 active:scale-95"
                >
                  Find Roommates &rarr;
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-2xl text-[#3E737C] hover:text-[#234653] bg-[#FAF5ED] border border-[#E8DEC8] transition-all"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#E8DEC8] bg-[#FFF9F1] px-6 py-5 space-y-4 shadow-xl animate-dropdown">
            <nav className="flex flex-col space-y-2 text-sm font-semibold">
              <a href="#why" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#234653]">Why RoomSync</a>
              <a href="#process" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#234653]">The Process</a>
              <a href="#sandbox" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#234653]">Live Simulator</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#234653]">Capabilities</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#234653]">FAQ</a>
            </nav>
            <div className="pt-3 border-t border-[#E8DEC8] flex flex-col gap-2">
              <Link to="/register" className="w-full text-center py-3 rounded-full bg-[#E86F5A] text-white text-xs font-semibold uppercase tracking-wider">
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* 2. SPARKDESIGN SPLIT HERO SECTION WITH 3D PRODUCT CARDS */}
      {/* ======================================================== */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden border-b border-[#E8DEC8]/80">
        <FloatingOrbs />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Hero Content */}
            <ScrollReveal direction="up" distance={20} duration={0.65} className="lg:col-span-6 space-y-6">
              {/* Sparkdesign Pill Badge */}
              <a
                href="#sandbox"
                className="inline-flex items-center gap-2 rounded-full bg-[#FAF5ED] border border-[#E8DEC8] px-4 py-2 text-xs font-medium text-[#234653] shadow-2xs hover:-translate-y-0.5 hover:border-[#3E737C]/40 transition-all duration-200"
              >
                <span className="w-2 h-2 rounded-full bg-[#E86F5A] animate-pulse"></span>
                <span>Discover compatible roommates & shared living harmony</span>
                <span className="text-[#E86F5A] font-bold">&rarr;</span>
              </a>

              {/* Sparkdesign Display Typography */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#234653] tracking-[-0.04em] leading-[1.12] font-serif-editorial">
                Find compatible roommates.<br />
                <span className="text-[#E86F5A]">Live in perfect sync.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#3E737C] leading-relaxed max-w-xl">
                Match with roommates who share your schedule, cleanliness, and lifestyle preferences. Seamlessly manage chores, shared expenses, grocery lists, and apartment agreements.
              </p>

              {/* Sparkdesign Quick Action Input Form */}
              <div className="pt-2 max-w-md">
                <form onSubmit={handleQuickSubmit} className="flex items-center gap-2 bg-[#FAF5ED] p-1.5 rounded-full border border-[#E8DEC8] shadow-2xs focus-within:border-[#3E737C]/50 transition-colors">
                  <input
                    type="email"
                    value={quickEmail}
                    onChange={(e) => setQuickEmail(e.target.value)}
                    placeholder="Enter your email to match roommates"
                    className="flex-1 bg-transparent px-4 py-2 text-xs text-[#234653] placeholder-[#3E737C]/70 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#E86F5A] hover:bg-[#D65D48] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-xs hover:shadow-md btn-shimmer btn-interactive transition-all shrink-0 active:scale-95"
                  >
                    <span>Start Free</span>
                    <span>&rarr;</span>
                  </button>
                </form>
                <p className="mt-2 text-[11px] text-[#3E737C] px-3">
                  100% free • Verified roommate profiles • Instant compatibility match
                </p>
              </div>

              {/* Sparkdesign Roommate Social Proof Row */}
              <div className="pt-4 flex items-center gap-3.5 text-xs text-[#3E737C]">
                <div className="flex -space-x-2 overflow-hidden">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#DCE8E8] text-[#234653] font-bold text-[10px] border-2 border-[#F4EDE3] font-serif">
                    M
                  </span>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#F2D4C8] text-[#234653] font-bold text-[10px] border-2 border-[#F4EDE3] font-serif">
                    A
                  </span>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#234653] text-white font-bold text-[10px] border-2 border-[#F4EDE3] font-serif">
                    R
                  </span>
                </div>
                <span>
                  <strong>Over 2,400+ roommates matched</strong> and living peacefully together.
                </span>
              </div>
            </ScrollReveal>

            {/* Right Hero Column: 3D Floating Product Cards Stage */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <Hero3DCardStage />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. "WHY ROOMSYNC" / PHILOSOPHY (3-COLUMN EDITORIAL CARDS) */}
      {/* ======================================================== */}
      <section id="why" className="py-20 sm:py-28 border-b border-[#E8DEC8] bg-[#FAF5ED]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
          <ScrollReveal direction="up" className="max-w-2xl mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E86F5A]">Philosophy</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#234653] tracking-[-0.035em] mt-2 font-serif-editorial">
              Match deeply.<br />Live effortlessly.
            </h2>
            <p className="mt-3 text-base text-[#3E737C] leading-relaxed">
              Great roommate relationships start with authentic compatibility and thrive with transparent, automated household coordination.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Compatibility */}
            <ScrollReveal direction="up" delay={0.1} className="h-full">
              <TiltCard maxTilt={5} className="h-full rounded-3xl shadow-xs">
                <article className="h-full bg-[#FFF9F1] rounded-3xl border border-[#E8DEC8] p-8 space-y-4 hover:border-[#3E737C]/40 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#DCE8E8] text-[#234653] flex items-center justify-center text-xl mb-6 shadow-2xs font-bold">
                      ⚡
                    </div>
                    <h3 className="text-xl font-bold text-[#234653] font-serif-editorial">
                      Deep Lifestyle Matching
                    </h3>
                    <p className="mt-2 text-sm text-[#3E737C] leading-relaxed">
                      Discover roommates based on sleep schedules, cleanliness standards, work-from-home habits, and dietary preferences before signing a lease.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#E8DEC8]/60 text-xs font-semibold text-[#E86F5A]">
                    Compatibility algorithms &rarr;
                  </div>
                </article>
              </TiltCard>
            </ScrollReveal>

            {/* Card 2: Financial Peace */}
            <ScrollReveal direction="up" delay={0.2} className="h-full">
              <TiltCard maxTilt={5} className="h-full rounded-3xl shadow-xs">
                <article className="h-full bg-[#FFF9F1] rounded-3xl border border-[#E8DEC8] p-8 space-y-4 hover:border-[#3E737C]/40 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#F2D4C8] text-[#234653] flex items-center justify-center text-xl mb-6 shadow-2xs font-bold">
                      💰
                    </div>
                    <h3 className="text-xl font-bold text-[#234653] font-serif-editorial">
                      Stress-Free Expense Splits
                    </h3>
                    <p className="mt-2 text-sm text-[#3E737C] leading-relaxed">
                      Multi-party debt simplification eliminates awkward money talks. Track rent, Wi-Fi, and groceries with automated minimal bank transfers.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#E8DEC8]/60 text-xs font-semibold text-[#E86F5A]">
                    Automated debt simplification &rarr;
                  </div>
                </article>
              </TiltCard>
            </ScrollReveal>

            {/* Card 3: Harmony */}
            <ScrollReveal direction="up" delay={0.3} className="h-full">
              <TiltCard maxTilt={5} className="h-full rounded-3xl shadow-xs">
                <article className="h-full bg-[#FFF9F1] rounded-3xl border border-[#E8DEC8] p-8 space-y-4 hover:border-[#3E737C]/40 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF5ED] text-[#234653] border border-[#E8DEC8] flex items-center justify-center text-xl mb-6 shadow-2xs font-bold">
                      🧹
                    </div>
                    <h3 className="text-xl font-bold text-[#234653] font-serif-editorial">
                      Fair Chore & Household Sync
                    </h3>
                    <p className="mt-2 text-sm text-[#3E737C] leading-relaxed">
                      Rotated cleaning duties, shared grocery checklists, quick favor requests, and group polls keep everyone accountable and the apartment spotless.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#E8DEC8]/60 text-xs font-semibold text-[#E86F5A]">
                    Real-time apartment sync &rarr;
                  </div>
                </article>
              </TiltCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. AUDIENCE MARQUEE ("FOR EVERY SHARED LIVING SITUATION") */}
      {/* ======================================================== */}
      <section className="py-12 border-b border-[#E8DEC8] bg-[#F4EDE3] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#3E737C]">Built for every shared living setup</span>
        </div>
        <div className="flex items-center justify-center gap-6 flex-wrap px-4">
          {['Student Apartments', 'Young Working Professionals', 'Co-Living Spaces', 'City Flatmates', 'New Movers & Relocators', 'Budget-Conscious Renters'].map((aud, i) => (
            <div key={i} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFF9F1] border border-[#E8DEC8] text-xs font-semibold text-[#234653] shadow-2xs hover:border-[#3E737C]/40 transition-colors">
              <span className="text-[#E86F5A]">✦</span>
              <span>{aud}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. INTERACTIVE PROCESS / WORKFLOW TABS SECTION */}
      {/* ======================================================== */}
      <section id="process" className="py-20 sm:py-28 border-b border-[#E8DEC8] bg-[#FFF9F1]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
          <ScrollReveal direction="up" className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E86F5A]">The Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#234653] tracking-[-0.035em] mt-2 font-serif-editorial">
              From finding a roommate to living in harmony.
            </h2>
            <p className="mt-3 text-base text-[#3E737C]">
              A complete end-to-end journey that replaces messy Facebook groups and awkward chores arguments with clarity.
            </p>
          </ScrollReveal>

          {/* Workflow Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Tabs Menu */}
            <div className="lg:col-span-5 space-y-3">
              {[
                { id: '01', title: '01 Create Lifestyle Profile', desc: 'Set your budget, work rhythm, wake-up hours, cleanliness habits, and house rules.' },
                { id: '02', title: '02 Match & Connect', desc: 'Browse verified roommate profiles ranked by automated compatibility scores.' },
                { id: '03', title: '03 Form Your Household', desc: 'Invite roommates with a single code and establish shared rules & chore rotations.' },
                { id: '04', title: '04 Synchronize Everyday Living', desc: 'Log shared grocery items, auto-split bills, and vote on house decisions.' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveWorkflowTab(tab.id)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 text-xs ${
                    activeWorkflowTab === tab.id
                      ? 'bg-[#FAF5ED] border-[#E8DEC8] shadow-xs translate-x-1'
                      : 'bg-transparent border-transparent hover:bg-[#FAF5ED]/50 text-[#3E737C]'
                  }`}
                >
                  <span className="font-bold text-sm text-[#234653] block font-serif-editorial">{tab.title}</span>
                  <p className="text-xs text-[#3E737C] mt-1">{tab.desc}</p>
                </button>
              ))}
            </div>

            {/* Right Interactive Preview Panel */}
            <div className="lg:col-span-7">
              <TiltCard maxTilt={4} className="rounded-3xl shadow-xl">
                <div className="bg-[#FAF5ED] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
                    <span className="text-xs font-bold text-[#234653] uppercase tracking-wider font-serif-editorial">
                      {activeWorkflowTab === '01' && 'Stage 01: Profile & Living Preferences'}
                      {activeWorkflowTab === '02' && 'Stage 02: Match Algorithm'}
                      {activeWorkflowTab === '03' && 'Stage 03: Household Space Created'}
                      {activeWorkflowTab === '04' && 'Stage 04: Real-time Household Harmony'}
                    </span>
                    <span className="text-[10px] font-bold text-[#E86F5A] bg-[#FFF9F1] px-3 py-1 rounded-full border border-[#E8DEC8]">
                      ● Live Stage
                    </span>
                  </div>

                  {activeWorkflowTab === '01' && (
                    <div className="space-y-3 animate-fade-in-up">
                      <div className="p-4 bg-[#FFF9F1] rounded-2xl border border-[#E8DEC8] space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#234653]">Your Living Rhythm</span>
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">Profile Complete</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-[#3E737C]">
                          <div className="p-2 bg-[#FAF5ED] rounded-xl border border-[#E8DEC8]">
                            <span className="block font-semibold text-[#234653]">Budget:</span> ₹12,000 - ₹16,000
                          </div>
                          <div className="p-2 bg-[#FAF5ED] rounded-xl border border-[#E8DEC8]">
                            <span className="block font-semibold text-[#234653]">Sleep:</span> Early Riser (07:00 AM)
                          </div>
                          <div className="p-2 bg-[#FAF5ED] rounded-xl border border-[#E8DEC8]">
                            <span className="block font-semibold text-[#234653]">Chores:</span> Equal weekly turns
                          </div>
                          <div className="p-2 bg-[#FAF5ED] rounded-xl border border-[#E8DEC8]">
                            <span className="block font-semibold text-[#234653]">Guests:</span> Weekends only
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeWorkflowTab === '02' && (
                    <div className="space-y-3 animate-fade-in-up">
                      <div className="p-4 bg-[#FFF9F1] rounded-2xl border border-[#E8DEC8] space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#DCE8E8] text-[#234653] font-bold flex items-center justify-center font-serif">M</div>
                            <div>
                              <span className="font-bold text-[#234653] block">Maya Sharma, 23</span>
                              <span className="text-[10px] text-[#3E737C]">Product Designer • 2 BHK Search</span>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                            94% Match
                          </span>
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#FAF5ED] border border-[#E8DEC8] text-[#234653]">✓ Sleep schedule alignment</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#FAF5ED] border border-[#E8DEC8] text-[#234653]">✓ Aligned ₹14k budget</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeWorkflowTab === '03' && (
                    <div className="space-y-3 animate-fade-in-up">
                      <div className="p-4 bg-[#FFF9F1] rounded-2xl border border-[#E8DEC8] space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#234653]">Household Invite Code</span>
                          <span className="font-mono font-bold text-sm bg-[#FAF5ED] px-3 py-1 rounded-lg border border-[#E8DEC8] text-[#E86F5A]">
                            MAPLE-3B
                          </span>
                        </div>
                        <p className="text-[11px] text-[#3E737C]">
                          Share this invite code with roommates to link your calendar, shared chore boards, and balance sheet.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeWorkflowTab === '04' && (
                    <div className="space-y-3 animate-fade-in-up">
                      <div className="p-4 bg-[#FFF9F1] rounded-2xl border border-[#E8DEC8] space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#234653]">Live Apartment Synchronizer</span>
                          <span className="text-[10px] text-emerald-700 font-semibold">● 3 Roommates Connected</span>
                        </div>
                        <div className="p-2.5 bg-[#FAF5ED] rounded-xl border border-[#E8DEC8] flex items-center justify-between">
                          <span className="text-[11px]">🧹 Alex completed "Kitchen wipe down"</span>
                          <span className="text-[10px] text-[#3E737C]">10m ago</span>
                        </div>
                        <div className="p-2.5 bg-[#FAF5ED] rounded-xl border border-[#E8DEC8] flex items-center justify-between">
                          <span className="text-[11px]">💰 Maya added ₹600 Wi-Fi bill (₹200/each)</span>
                          <span className="text-[10px] text-[#3E737C]">1h ago</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TiltCard>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. INTERACTIVE ROOMMATE COMPATIBILITY & HOUSEHOLD SIMULATOR */}
      {/* ======================================================== */}
      <section id="sandbox" className="py-20 sm:py-28 border-b border-[#E8DEC8] bg-[#F4EDE3]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <ScrollReveal direction="up" className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E86F5A]">Interactive Simulator</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#234653] tracking-[-0.035em] mt-2 font-serif-editorial">
              Test your roommate compatibility in real-time.
            </h2>
            <p className="mt-3 text-base text-[#3E737C]">
              Adjust your living preferences below and watch how our algorithmic matching calculates compatibility with real roommates.
            </p>

            {/* Sandbox Mode Switcher */}
            <div className="mt-6 inline-flex p-1 bg-[#FAF5ED] border border-[#E8DEC8] rounded-full">
              <button
                type="button"
                onClick={() => setSandboxMode('compatibility')}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                  sandboxMode === 'compatibility'
                    ? 'bg-[#234653] text-[#FFF9F1] shadow-xs'
                    : 'text-[#3E737C] hover:text-[#234653]'
                }`}
              >
                ⚡ Roommate Match Simulator
              </button>
              <button
                type="button"
                onClick={() => setSandboxMode('household')}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                  sandboxMode === 'household'
                    ? 'bg-[#234653] text-[#FFF9F1] shadow-xs'
                    : 'text-[#3E737C] hover:text-[#234653]'
                }`}
              >
                🧹 Shared Household Sandbox
              </button>
            </div>
          </ScrollReveal>

          {/* SIMULATOR MODE 1: COMPATIBILITY MATCHER */}
          {sandboxMode === 'compatibility' && (
            <TiltCard maxTilt={3} className="rounded-3xl shadow-xl">
              <div className="bg-[#FFF9F1] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  {/* Left Preference Controls */}
                  <div className="md:col-span-6 space-y-5">
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-[#234653] mb-1.5">
                        <span>Target Monthly Rent Budget:</span>
                        <span className="text-[#E86F5A] font-serif-editorial text-sm">₹{simBudget.toLocaleString()} / mo</span>
                      </div>
                      <input
                        type="range"
                        min="8000"
                        max="25000"
                        step="1000"
                        value={simBudget}
                        onChange={(e) => setSimBudget(Number(e.target.value))}
                        className="w-full accent-[#E86F5A] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[#3E737C] mt-1">
                        <span>₹8,000</span>
                        <span>₹16,000</span>
                        <span>₹25,000</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-[#234653] block mb-2">Sleep & Wake Schedule:</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSimSchedule('early')}
                          className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                            simSchedule === 'early'
                              ? 'bg-[#234653] text-[#FFF9F1] border-[#234653]'
                              : 'bg-[#FAF5ED] border-[#E8DEC8] text-[#234653]'
                          }`}
                        >
                          ☀️ Early Riser (06:30 - 23:00)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSimSchedule('night')}
                          className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                            simSchedule === 'night'
                              ? 'bg-[#234653] text-[#FFF9F1] border-[#234653]'
                              : 'bg-[#FAF5ED] border-[#E8DEC8] text-[#234653]'
                          }`}
                        >
                          🌙 Night Owl (01:00 - 09:00)
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-[#234653] block mb-2">Cleanliness & Chores:</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSimCleanliness('weekly')}
                          className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                            simCleanliness === 'weekly'
                              ? 'bg-[#234653] text-[#FFF9F1] border-[#234653]'
                              : 'bg-[#FAF5ED] border-[#E8DEC8] text-[#234653]'
                          }`}
                        >
                          🧹 Weekly Reset
                        </button>
                        <button
                          type="button"
                          onClick={() => setSimCleanliness('daily')}
                          className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                            simCleanliness === 'daily'
                              ? 'bg-[#234653] text-[#FFF9F1] border-[#234653]'
                              : 'bg-[#FAF5ED] border-[#E8DEC8] text-[#234653]'
                          }`}
                        >
                          ✨ Daily Tidy-Up
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-[#234653] block mb-2">Kitchen & Cooking:</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSimCooking('shared')}
                          className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                            simCooking === 'shared'
                              ? 'bg-[#234653] text-[#FFF9F1] border-[#234653]'
                              : 'bg-[#FAF5ED] border-[#E8DEC8] text-[#234653]'
                          }`}
                        >
                          🍳 Cook Together
                        </button>
                        <button
                          type="button"
                          onClick={() => setSimCooking('independent')}
                          className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                            simCooking === 'independent'
                              ? 'bg-[#234653] text-[#FFF9F1] border-[#234653]'
                              : 'bg-[#FAF5ED] border-[#E8DEC8] text-[#234653]'
                          }`}
                        >
                          🥗 Independent Prep
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Live Roommate Match Card */}
                  <div className="md:col-span-6 bg-[#FAF5ED] border border-[#E8DEC8] rounded-2xl p-5 sm:p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#DCE8E8] text-[#234653] font-bold text-lg flex items-center justify-center border border-[#E8DEC8] font-serif shadow-2xs">
                          M
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-base font-bold text-[#234653] font-serif-editorial">
                              Maya Sharma, 23
                            </h4>
                            <span className="text-emerald-600 text-xs font-bold">✓</span>
                          </div>
                          <span className="text-xs text-[#3E737C]">Product Designer • 2 BHK Suite</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold font-serif-editorial text-emerald-700 block leading-none">
                          {currentScore}%
                        </span>
                        <span className="text-[10px] text-[#3E737C] font-semibold">Match Score</span>
                      </div>
                    </div>

                    {/* Dynamic Match Breakdown */}
                    <div className="space-y-2 pt-2 border-t border-[#E8DEC8] text-xs">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-[#FFF9F1] border border-[#E8DEC8]">
                        <span className="text-[#234653] font-medium">Budget Alignment (₹12k - ₹16k):</span>
                        <span className="font-bold text-emerald-700">
                          {Math.abs(simBudget - 14000) <= 3000 ? '✓ High Match' : 'Moderate'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-[#FFF9F1] border border-[#E8DEC8]">
                        <span className="text-[#234653] font-medium">Quiet Sleep Rhythm:</span>
                        <span className="font-bold text-emerald-700">
                          {simSchedule === 'early' ? '✓ Synchronized' : 'Different Hours'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-[#FFF9F1] border border-[#E8DEC8]">
                        <span className="text-[#234653] font-medium">Cleaning & Kitchen Habit:</span>
                        <span className="font-bold text-emerald-700">
                          {simCooking === 'shared' ? '✓ Shared Meals Friendly' : 'Independent'}
                        </span>
                      </div>
                    </div>

                    {/* Roommate Action */}
                    <div className="pt-2">
                      {requestSent ? (
                        <div className="w-full text-center py-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold animate-fade-in-up">
                          ✓ Connection Request Sent to Maya!
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRequestSent(true)}
                          className="w-full py-3 rounded-full bg-[#E86F5A] hover:bg-[#D65D48] text-white text-xs font-semibold uppercase tracking-wider shadow-xs hover:shadow-md transition-all btn-shimmer btn-interactive"
                        >
                          Connect with Maya ({currentScore}% Match) &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>
          )}

          {/* SIMULATOR MODE 2: HOUSEHOLD CHORES & EXPENSE SANDBOX */}
          {sandboxMode === 'household' && (
            <TiltCard maxTilt={3} className="rounded-3xl shadow-xl">
              <div className="bg-[#FFF9F1] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
                  <div>
                    <h3 className="text-base font-bold text-[#234653] font-serif-editorial">
                      The Maple Flat • Live Household Space
                    </h3>
                    <span className="text-[11px] text-[#3E737C]">Click tasks to mark complete or add new ones</span>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FAF5ED] text-[#234653] border border-[#E8DEC8]">
                    {sandboxChores.filter(c => c.done).length} of {sandboxChores.length} completed
                  </span>
                </div>

                {/* Tasks List */}
                <div className="space-y-2.5">
                  {sandboxChores.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => toggleChore(c.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer select-none transition-all duration-200 text-xs ${
                        c.done
                          ? 'bg-[#FAF5ED]/60 border-[#E8DEC8]/60 text-[#3E737C]'
                          : 'bg-[#FFF9F1] hover:bg-[#FAF5ED] border-[#E8DEC8] text-[#234653] shadow-2xs hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                          c.done ? 'bg-[#E86F5A] text-white shadow-2xs' : 'border border-[#3E737C]/50'
                        }`}>
                          {c.done && '✓'}
                        </span>
                        <span className={c.done ? 'line-through text-[#3E737C]/80' : 'font-semibold text-[#234653]'}>
                          {c.title}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-[#3E737C]">
                        {c.person} • {c.time}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add Chore Input */}
                <form onSubmit={addChore} className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={newChoreText}
                    onChange={(e) => setNewChoreText(e.target.value)}
                    placeholder="Type a new task (e.g. Wipe countertops, Restock paper towels)..."
                    className="flex-1 bg-[#FAF5ED] border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#234653] placeholder-[#3E737C]/70 focus:outline-none focus:border-[#3E737C]/50"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#234653] hover:bg-[#17272C] text-white text-xs font-semibold uppercase tracking-wider transition-all btn-interactive"
                  >
                    + Add Task
                  </button>
                </form>
              </div>
            </TiltCard>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. CAPABILITIES / CORE MODULES GRID */}
      {/* ======================================================== */}
      <section id="features" className="py-20 sm:py-28 border-b border-[#E8DEC8] bg-[#FAF5ED]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
          <ScrollReveal direction="up" className="max-w-2xl mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E86F5A]">Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#234653] tracking-[-0.035em] mt-2 font-serif-editorial">
              Everything your shared home needs to thrive.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🤝', title: 'Roommate Discovery', desc: 'Detailed profiles with verified lifestyle tags, habits, budget, and compatibility indicators.' },
              { icon: '🔄', title: 'Chore Rotations', desc: 'Automated daily, weekly, or custom schedules with fair workload balancing algorithms.' },
              { icon: '⚖️', title: 'Expense Splits & Debt Graph', desc: 'Direct bills logging, multi-way splits, and minimal transfer settlement calculations.' },
              { icon: '🛒', title: 'Shared Shopping Basket', desc: 'Live pantry restock lists with item reservation and instant split-to-expense conversion.' },
              { icon: '🗳️', title: 'House Decision Polls', desc: 'Vote on weekend plans, guest rules, and furniture purchases without messy group texts.' },
              { icon: '🙋', title: 'Favor & Help Requests', desc: 'Quick notifications for package pickups, dog walking, or emergency key handoffs.' }
            ].map((feat, idx) => (
              <ScrollReveal key={idx} direction="up" delay={idx * 0.08} className="h-full">
                <TiltCard maxTilt={4} className="h-full rounded-3xl shadow-xs">
                  <div className="h-full bg-[#FFF9F1] rounded-3xl border border-[#E8DEC8] p-6 space-y-3 hover:border-[#3E737C]/40 transition-colors">
                    <span className="text-2xl block">{feat.icon}</span>
                    <h3 className="text-base font-bold text-[#234653] font-serif-editorial">{feat.title}</h3>
                    <p className="text-xs text-[#3E737C] leading-relaxed">{feat.desc}</p>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. FAQ ACCORDION (SPARKDESIGN STYLE) */}
      {/* ======================================================== */}
      <section id="faq" className="py-20 sm:py-28 border-b border-[#E8DEC8] bg-[#FFF9F1]">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          <ScrollReveal direction="up" className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E86F5A]">Questions & Answers</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#234653] tracking-[-0.035em] mt-2 font-serif-editorial">
              Frequently asked questions.
            </h2>
          </ScrollReveal>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#FAF5ED] border border-[#E8DEC8] rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 text-sm sm:text-base font-bold text-[#234653] font-serif-editorial focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <span className={`text-[#E86F5A] text-lg transition-transform duration-200 ${openFaq === idx ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-6 text-xs sm:text-sm text-[#3E737C] leading-relaxed animate-fade-in-up">
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
      <section className="py-20 sm:py-28 bg-[#F4EDE3]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <ScrollReveal direction="zoom" className="rounded-3xl bg-[#234653] text-[#FFF9F1] p-10 sm:p-16 text-center space-y-6 shadow-xl relative overflow-hidden">
            {/* Ambient Background Radial Glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,111,90,0.25),transparent_60%)]"></div>

            <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F2D4C8]">Join Over 2,400+ Roommates</span>
              <h2 className="text-3xl sm:text-5xl font-bold font-serif-editorial tracking-tight text-[#FFF9F1]">
                Find your ideal roommate today.
              </h2>
              <p className="text-sm sm:text-base text-[#DCE8E8] leading-relaxed">
                Discover matching roommates, split costs transparently, and make shared living peaceful and organized.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-[#E86F5A] hover:bg-[#D65D48] text-white shadow-md btn-shimmer btn-interactive transition-all active:scale-95"
                >
                  Find Roommates Free &rarr;
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-3.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-[#FFF9F1] hover:bg-[#FAF5ED] text-[#234653] btn-interactive transition-all active:scale-95"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. MINIMALIST EDITORIAL FOOTER */}
      {/* ======================================================== */}
      <footer className="border-t border-[#E8DEC8] bg-[#FAF5ED] py-12 text-xs text-[#3E737C]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#234653] text-[#FFF9F1] flex items-center justify-center font-serif text-base font-bold">
              ✦
            </div>
            <div>
              <span className="font-bold text-[#234653] text-sm font-serif-editorial">RoomSync</span>
              <p className="text-[#3E737C] mt-0.5">Roommate discovery & shared living harmony.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="#why" className="hover:text-[#234653] transition-colors">Why RoomSync</a>
            <a href="#process" className="hover:text-[#234653] transition-colors">Process</a>
            <a href="#sandbox" className="hover:text-[#234653] transition-colors">Simulator</a>
            <a href="#features" className="hover:text-[#234653] transition-colors">Capabilities</a>
            <a href="#faq" className="hover:text-[#234653] transition-colors">FAQ</a>
            <Link to="/login" className="hover:text-[#234653] transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-[#234653] transition-colors">Register</Link>
          </div>

          <div>
            &copy; {new Date().getFullYear()} RoomSync. Good living, together.
          </div>
        </div>
      </footer>
    </div>
  );
}
