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
      q: 'How does RoomSync simplify shared roommate living?',
      a: 'RoomSync unites recurring chores, shared expenses with automated debt simplification, real-time grocery lists, favor requests, and decision polls into a single synchronized household space.'
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
                Household Journal & OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Sparkdesign Micro-Underline */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-[-0.02em] text-[#3E737C]">
            <a href="#why" className="relative py-1 transition-colors hover:text-[#234653] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#E86F5A] after:transition-transform after:duration-200 hover:after:scale-x-100">
              Why RoomSync
            </a>
            <a href="#workflow" className="relative py-1 transition-colors hover:text-[#234653] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#E86F5A] after:transition-transform after:duration-200 hover:after:scale-x-100">
              The Process
            </a>
            <a href="#features" className="relative py-1 transition-colors hover:text-[#234653] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#E86F5A] after:transition-transform after:duration-200 hover:after:scale-x-100">
              Capabilities
            </a>
            <a href="#demo" className="relative py-1 transition-colors hover:text-[#234653] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#E86F5A] after:transition-transform after:duration-200 hover:after:scale-x-100">
              Live Preview
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
                  Start creating &rarr;
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
              <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#234653]">The Process</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#234653]">Capabilities</a>
              <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#234653]">Live Preview</a>
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
                href="#features"
                className="inline-flex items-center gap-2 rounded-full bg-[#FAF5ED] border border-[#E8DEC8] px-4 py-2 text-xs font-medium text-[#234653] shadow-2xs hover:-translate-y-0.5 hover:border-[#3E737C]/40 transition-all duration-200"
              >
                <span className="w-2 h-2 rounded-full bg-[#E86F5A] animate-pulse"></span>
                <span>A shared space for everyday shared living</span>
                <span className="text-[#E86F5A] font-bold">&rarr;</span>
              </a>

              {/* Sparkdesign Display Typography */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#234653] tracking-[-0.04em] leading-[1.12] font-serif-editorial">
                Run your household together.<br />
                <span className="text-[#E86F5A]">Good living, in sync.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#3E737C] leading-relaxed max-w-xl">
                Bring chores, expenses, grocery runs, favors, and quiet coordination into one beautifully simple household workspace.
              </p>

              {/* Sparkdesign Quick Action Input Form */}
              <div className="pt-2 max-w-md">
                <form onSubmit={handleQuickSubmit} className="flex items-center gap-2 bg-[#FAF5ED] p-1.5 rounded-full border border-[#E8DEC8] shadow-2xs focus-within:border-[#3E737C]/50 transition-colors">
                  <input
                    type="email"
                    value={quickEmail}
                    onChange={(e) => setQuickEmail(e.target.value)}
                    placeholder="Enter your email to get started"
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
                  No credit card required • Instant roommate invites via shareable code
                </p>
              </div>

              {/* Sparkdesign Roommate Social Proof Row */}
              <div className="pt-4 flex items-center gap-3.5 text-xs text-[#3E737C]">
                <div className="flex -space-x-2 overflow-hidden">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#DCE8E8] text-[#234653] font-bold text-[10px] border-2 border-[#F4EDE3] font-serif">
                    A
                  </span>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#F2D4C8] text-[#234653] font-bold text-[10px] border-2 border-[#F4EDE3] font-serif">
                    M
                  </span>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#234653] text-white font-bold text-[10px] border-2 border-[#F4EDE3] font-serif">
                    Y
                  </span>
                </div>
                <span>
                  <strong>For the way you share space.</strong> 3 roommates in sync.
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
              Less getting in the way.<br />More getting carried away.
            </h2>
            <p className="mt-3 text-base text-[#3E737C] leading-relaxed">
              Shared living needs room to breathe. We give your apartment a simpler place to think, coordinate, and move forward together.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <ScrollReveal direction="up" delay={0.1} className="h-full">
              <TiltCard maxTilt={5} className="h-full rounded-3xl shadow-xs">
                <article className="h-full bg-[#FFF9F1] rounded-3xl border border-[#E8DEC8] p-8 space-y-4 hover:border-[#3E737C]/40 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#DCE8E8] text-[#234653] flex items-center justify-center text-xl mb-6 shadow-2xs font-bold">
                      🧹
                    </div>
                    <h3 className="text-xl font-bold text-[#234653] font-serif-editorial">
                      One place to find your rhythm
                    </h3>
                    <p className="mt-2 text-sm text-[#3E737C] leading-relaxed">
                      Chores, shared grocery lists, and utility balances in one quiet space so everyone knows what is done without micro-management.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#E8DEC8]/60 text-xs font-semibold text-[#E86F5A]">
                    Automated rotation &rarr;
                  </div>
                </article>
              </TiltCard>
            </ScrollReveal>

            {/* Card 2 */}
            <ScrollReveal direction="up" delay={0.2} className="h-full">
              <TiltCard maxTilt={5} className="h-full rounded-3xl shadow-xs">
                <article className="h-full bg-[#FFF9F1] rounded-3xl border border-[#E8DEC8] p-8 space-y-4 hover:border-[#3E737C]/40 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#F2D4C8] text-[#234653] flex items-center justify-center text-xl mb-6 shadow-2xs font-bold">
                      💰
                    </div>
                    <h3 className="text-xl font-bold text-[#234653] font-serif-editorial">
                      Clarity that keeps the peace
                    </h3>
                    <p className="mt-2 text-sm text-[#3E737C] leading-relaxed">
                      Multi-party debt simplification eliminates endless back-and-forth bank transfers. Settle up cleanly with transparency.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#E8DEC8]/60 text-xs font-semibold text-[#E86F5A]">
                    Multi-way settlement &rarr;
                  </div>
                </article>
              </TiltCard>
            </ScrollReveal>

            {/* Card 3 */}
            <ScrollReveal direction="up" delay={0.3} className="h-full">
              <TiltCard maxTilt={5} className="h-full rounded-3xl shadow-xs">
                <article className="h-full bg-[#FFF9F1] rounded-3xl border border-[#E8DEC8] p-8 space-y-4 hover:border-[#3E737C]/40 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF5ED] text-[#234653] border border-[#E8DEC8] flex items-center justify-center text-xl mb-6 shadow-2xs font-bold">
                      🤝
                    </div>
                    <h3 className="text-xl font-bold text-[#234653] font-serif-editorial">
                      Space to make it your own
                    </h3>
                    <p className="mt-2 text-sm text-[#3E737C] leading-relaxed">
                      From package pickup favors to group decision polls, customize your household workflow to match your home's unique vibe.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#E8DEC8]/60 text-xs font-semibold text-[#E86F5A]">
                    Instant favors & polls &rarr;
                  </div>
                </article>
              </TiltCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. AUDIENCE MARQUEE ("FOR EVERY SHARED SPACE") */}
      {/* ======================================================== */}
      <section className="py-12 border-b border-[#E8DEC8] bg-[#F4EDE3] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#3E737C]">Built for modern shared living</span>
        </div>
        <div className="flex items-center justify-center gap-6 flex-wrap px-4">
          {['Student Apartments', 'Young Professionals', 'Couples & Partners', 'Co-Living Communities', 'Family Homes', 'City Flatmates'].map((aud, i) => (
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
      <section id="workflow" className="py-20 sm:py-28 border-b border-[#E8DEC8] bg-[#FFF9F1]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
          <ScrollReveal direction="up" className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E86F5A]">The Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#234653] tracking-[-0.035em] mt-2 font-serif-editorial">
              How RoomSync keeps your home synchronized.
            </h2>
            <p className="mt-3 text-base text-[#3E737C]">
              Four seamless steps that replace disorganized group chats with calm household flow.
            </p>
          </ScrollReveal>

          {/* Workflow Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Tabs Menu */}
            <div className="lg:col-span-5 space-y-3">
              {[
                { id: '01', title: '01 Log & Schedule', desc: 'Add chores, shopping items, or shared expenses in seconds.' },
                { id: '02', title: '02 Rotate Fairly', desc: 'Intelligent scheduler automates rotations based on member schedules.' },
                { id: '03', title: '03 Vote & Decide', desc: 'Settle apartment decisions on internet plans or dinner without endless texting.' },
                { id: '04', title: '04 Settle Balances', desc: 'Debt simplification minimizes transfers so settling up is stress-free.' }
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
                      {activeWorkflowTab === '01' && 'Stage 01: Quick Logging'}
                      {activeWorkflowTab === '02' && 'Stage 02: Intelligent Rotation'}
                      {activeWorkflowTab === '03' && 'Stage 03: Group Consensus'}
                      {activeWorkflowTab === '04' && 'Stage 04: Simplified Balances'}
                    </span>
                    <span className="text-[10px] font-bold text-[#E86F5A] bg-[#FFF9F1] px-3 py-1 rounded-full border border-[#E8DEC8]">
                      ● Active Workflow
                    </span>
                  </div>

                  {activeWorkflowTab === '01' && (
                    <div className="space-y-3 animate-fade-in-up">
                      <div className="p-3.5 bg-[#FFF9F1] rounded-2xl border border-[#E8DEC8] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-[#DCE8E8] flex items-center justify-center text-sm">🧹</span>
                          <div>
                            <span className="font-bold text-[#234653] block">Deep Clean Living Room</span>
                            <span className="text-[10px] text-[#3E737C]">Recurring weekly • Saturday 10:00 AM</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#E86F5A]">Assigned to Alex</span>
                      </div>
                      <div className="p-3.5 bg-[#FFF9F1] rounded-2xl border border-[#E8DEC8] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-[#F2D4C8] flex items-center justify-center text-sm">🛍️</span>
                          <div>
                            <span className="font-bold text-[#234653]">Oat milk & Espresso beans</span>
                            <span className="text-[10px] text-[#3E737C]">Pantry restock • Added by Maya</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-700">In Shopping Cart</span>
                      </div>
                    </div>
                  )}

                  {activeWorkflowTab === '02' && (
                    <div className="space-y-3 animate-fade-in-up">
                      <div className="p-4 bg-[#FFF9F1] rounded-2xl border border-[#E8DEC8] space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#234653]">Weekly Rotation Breakdown</span>
                          <span className="text-[10px] text-[#3E737C]">Fair algorithm: 100% parity</span>
                        </div>
                        <div className="w-full bg-[#FAF5ED] h-2.5 rounded-full overflow-hidden flex border border-[#E8DEC8]">
                          <div className="bg-[#234653] w-1/3" title="Alex: 33%"></div>
                          <div className="bg-[#E86F5A] w-1/3" title="Maya: 33%"></div>
                          <div className="bg-[#E7A83C] w-1/3" title="You: 34%"></div>
                        </div>
                        <span className="text-[10px] text-[#3E737C] block text-right">3 roommates • Equal workload</span>
                      </div>
                    </div>
                  )}

                  {activeWorkflowTab === '03' && (
                    <div className="space-y-3 animate-fade-in-up">
                      <div className="p-4 bg-[#FFF9F1] rounded-2xl border border-[#E8DEC8] space-y-2 text-xs">
                        <span className="font-bold text-[#234653] block">Active Poll: Dinner Hosting on Friday</span>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF5ED] border border-[#E8DEC8]">
                          <span>Yes, sounds great! (Alex, Maya)</span>
                          <span className="font-bold text-[#E86F5A]">67%</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF5ED] border border-[#E8DEC8]">
                          <span>Let's do Saturday instead</span>
                          <span className="font-bold text-[#3E737C]">33%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeWorkflowTab === '04' && (
                    <div className="space-y-3 animate-fade-in-up">
                      <div className="p-4 bg-[#FFF9F1] rounded-2xl border border-[#E8DEC8] space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#234653]">Simplified Debt Graph</span>
                          <span className="text-xs font-bold text-emerald-700">1 transfer needed</span>
                        </div>
                        <div className="p-3 bg-[#FAF5ED] rounded-xl border border-[#E8DEC8] flex items-center justify-between">
                          <span>Maya pays Alex ₹413.33</span>
                          <span className="font-bold text-[#234653]">All settled</span>
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
      {/* 6. LIVE INTERACTIVE DEMO / PLAYGROUND SANDBOX */}
      {/* ======================================================== */}
      <section id="demo" className="py-20 sm:py-28 border-b border-[#E8DEC8] bg-[#F4EDE3]">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          <ScrollReveal direction="up" className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E86F5A]">Interactive Sandbox</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#234653] tracking-[-0.035em] mt-2 font-serif-editorial">
              Try the household journal right now.
            </h2>
            <p className="mt-3 text-base text-[#3E737C]">
              Click to check off a chore or add a new task below. Experience the calm feel firsthand.
            </p>
          </ScrollReveal>

          <TiltCard maxTilt={3} className="rounded-3xl shadow-xl">
            <div className="bg-[#FFF9F1] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
                <div>
                  <h3 className="text-base font-bold text-[#234653] font-serif-editorial">
                    The Maple Flat • Live Sandbox
                  </h3>
                  <span className="text-[11px] text-[#3E737C]">Shared apartment demo</span>
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
                  placeholder="Type a new task (e.g. Empty recycling, Pick up groceries)..."
                  className="flex-1 bg-[#FAF5ED] border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#234653] placeholder-[#3E737C]/70 focus:outline-none focus:border-[#3E737C]/50"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#234653] hover:bg-[#17272C] text-white text-xs font-semibold uppercase tracking-wider transition-all btn-interactive"
                >
                  + Add
                </button>
              </form>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. FAQ ACCORDION (SPARKDESIGN STYLE) */}
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
      {/* 8. ELEVATED FINAL CTA (SPARKDESIGN DARK THEMED ACCENT) */}
      {/* ======================================================== */}
      <section className="py-20 sm:py-28 bg-[#F4EDE3]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <ScrollReveal direction="zoom" className="rounded-3xl bg-[#234653] text-[#FFF9F1] p-10 sm:p-16 text-center space-y-6 shadow-xl relative overflow-hidden">
            {/* Ambient Background Radial Glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,111,90,0.25),transparent_60%)]"></div>

            <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F2D4C8]">Get Started Today</span>
              <h2 className="text-3xl sm:text-5xl font-bold font-serif-editorial tracking-tight text-[#FFF9F1]">
                Make your household easier to manage.
              </h2>
              <p className="text-sm sm:text-base text-[#DCE8E8] leading-relaxed">
                Bring all everyday roommate responsibilities into one calm shared space. Set up your home in under two minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-[#E86F5A] hover:bg-[#D65D48] text-white shadow-md btn-shimmer btn-interactive transition-all active:scale-95"
                >
                  Create your household free &rarr;
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
      {/* 9. MINIMALIST EDITORIAL FOOTER */}
      {/* ======================================================== */}
      <footer className="border-t border-[#E8DEC8] bg-[#FAF5ED] py-12 text-xs text-[#3E737C]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#234653] text-[#FFF9F1] flex items-center justify-center font-serif text-base font-bold">
              ✦
            </div>
            <div>
              <span className="font-bold text-[#234653] text-sm font-serif-editorial">RoomSync</span>
              <p className="text-[#3E737C] mt-0.5">A calmer way to coordinate everyday life.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="#why" className="hover:text-[#234653] transition-colors">Why RoomSync</a>
            <a href="#workflow" className="hover:text-[#234653] transition-colors">Process</a>
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
