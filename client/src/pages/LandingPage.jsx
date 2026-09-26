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

  const faqs = [
    {
      q: 'How does RoomSync simplify shared household living?',
      a: 'RoomSync brings all everyday roommate responsibilities—recurring chores with automated rotations, shared expenses with automated debt simplification, real-time grocery lists, favor requests, and house polls—into a single calm, synchronized workspace.'
    },
    {
      q: 'How do my roommates join our household?',
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
                Household Journal & Operating System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Sparkdesign Micro-Underline */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-[-0.02em] text-[#3E737C]">
            <a href="#why" className="relative py-1 transition-colors hover:text-[#234653] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#E86F5A] after:transition-transform after:duration-200 hover:after:scale-x-100">
              Why RoomSync
            </a>
            <a href="#process" className="relative py-1 transition-colors hover:text-[#234653] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#E86F5A] after:transition-transform after:duration-200 hover:after:scale-x-100">
              How It Works
            </a>
            <a href="#sandbox" className="relative py-1 transition-colors hover:text-[#234653] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#E86F5A] after:transition-transform after:duration-200 hover:after:scale-x-100">
              Live Sandbox
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
                  Start Free &rarr;
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
              <a href="#process" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#234653]">How It Works</a>
              <a href="#sandbox" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#234653]">Live Sandbox</a>
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
                <span>A shared space for everyday flatmate living</span>
                <span className="text-[#E86F5A] font-bold">&rarr;</span>
              </a>

              {/* Sparkdesign Display Typography */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#234653] tracking-[-0.04em] leading-[1.12] font-serif-editorial">
                Run your household together.<br />
                <span className="text-[#E86F5A]">Good living, in sync.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#3E737C] leading-relaxed max-w-xl">
                Bring chores, expenses, grocery runs, favor requests, and house polls into one beautifully simple shared workspace for you and your roommates.
              </p>

              {/* Sparkdesign Quick Action Input Form */}
              <div className="pt-2 max-w-md">
                <form onSubmit={handleQuickSubmit} className="flex items-center gap-2 bg-[#FAF5ED] p-1.5 rounded-full border border-[#E8DEC8] shadow-2xs focus-within:border-[#3E737C]/50 transition-colors">
                  <input
                    type="email"
                    value={quickEmail}
                    onChange={(e) => setQuickEmail(e.target.value)}
                    placeholder="Enter your email to set up your home"
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
                  <strong>For the way you share space.</strong> Real-time flatmate sync.
                </span>
              </div>
            </ScrollReveal>

            {/* Right Hero Column: 3D Floating Household Cards Stage */}
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
              Shared living needs room to breathe. We give your apartment a simpler place to coordinate chores, split bills, and live peacefully.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Chores */}
            <ScrollReveal direction="up" delay={0.1} className="h-full">
              <TiltCard maxTilt={5} className="h-full rounded-3xl shadow-xs">
                <article className="h-full bg-[#FFF9F1] rounded-3xl border border-[#E8DEC8] p-8 space-y-4 hover:border-[#3E737C]/40 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#DCE8E8] text-[#234653] flex items-center justify-center text-xl mb-6 shadow-2xs font-bold">
                      🧹
                    </div>
                    <h3 className="text-xl font-bold text-[#234653] font-serif-editorial">
                      Automated Chore Rotations
                    </h3>
                    <p className="mt-2 text-sm text-[#3E737C] leading-relaxed">
                      Say goodbye to chore charts on the fridge. Set daily or weekly recurring rotations that distribute cleaning fairly among roommates.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#E8DEC8]/60 text-xs font-semibold text-[#E86F5A]">
                    Equal workload algorithms &rarr;
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
                      Smart Debt Simplification
                    </h3>
                    <p className="mt-2 text-sm text-[#3E737C] leading-relaxed">
                      Log shared groceries, utilities, and rent. Our multi-party debt algorithm minimizes transfers so settling up is completely painless.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#E8DEC8]/60 text-xs font-semibold text-[#E86F5A]">
                    Automated debt settlement &rarr;
                  </div>
                </article>
              </TiltCard>
            </ScrollReveal>

            {/* Card 3: Coordination */}
            <ScrollReveal direction="up" delay={0.3} className="h-full">
              <TiltCard maxTilt={5} className="h-full rounded-3xl shadow-xs">
                <article className="h-full bg-[#FFF9F1] rounded-3xl border border-[#E8DEC8] p-8 space-y-4 hover:border-[#3E737C]/40 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF5ED] text-[#234653] border border-[#E8DEC8] flex items-center justify-center text-xl mb-6 shadow-2xs font-bold">
                      🤝
                    </div>
                    <h3 className="text-xl font-bold text-[#234653] font-serif-editorial">
                      Shopping, Favors & Polls
                    </h3>
                    <p className="mt-2 text-sm text-[#3E737C] leading-relaxed">
                      Shared pantry lists, quick package pickup favor requests, and house decision polls keep the whole home in sync without messy group chats.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#E8DEC8]/60 text-xs font-semibold text-[#E86F5A]">
                    Real-time household sync &rarr;
                  </div>
                </article>
              </TiltCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. AUDIENCE MARQUEE */}
      {/* ======================================================== */}
      <section className="py-12 border-b border-[#E8DEC8] bg-[#F4EDE3] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#3E737C]">Built for modern shared living</span>
        </div>
        <div className="flex items-center justify-center gap-6 flex-wrap px-4">
          {['Student Apartments', 'City Flatmates', 'Young Professionals', 'Co-Living Houses', 'Couples & Partners', 'Shared Suites'].map((aud, i) => (
            <div key={i} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFF9F1] border border-[#E8DEC8] text-xs font-semibold text-[#234653] shadow-2xs hover:border-[#3E737C]/40 transition-colors">
              <span className="text-[#E86F5A]">✦</span>
              <span>{aud}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. INTERACTIVE PROCESS / HOW IT WORKS SECTION */}
      {/* ======================================================== */}
      <section id="process" className="py-20 sm:py-28 border-b border-[#E8DEC8] bg-[#FFF9F1]">
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
                { id: '01', title: '01 Create & Invite', desc: 'Create your household space in seconds and share the 8-character invite code with roommates.' },
                { id: '02', title: '02 Set Chore Rotations', desc: 'Add recurring tasks (kitchen, garbage, bathroom) and let the scheduler automate turns.' },
                { id: '03', title: '03 Track & Split Expenses', desc: 'Add shared receipts and utility bills with automatic debt simplification.' },
                { id: '04', title: '04 Vote & Coordinate', desc: 'Create decision polls, manage grocery restocks, and request quick favors in real-time.' }
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
                      {activeWorkflowTab === '01' && 'Stage 01: Household Space Created'}
                      {activeWorkflowTab === '02' && 'Stage 02: Intelligent Chore Rotations'}
                      {activeWorkflowTab === '03' && 'Stage 03: Expense Splitting & Debt Graph'}
                      {activeWorkflowTab === '04' && 'Stage 04: Group Decisions & Living Sync'}
                    </span>
                    <span className="text-[10px] font-bold text-[#E86F5A] bg-[#FFF9F1] px-3 py-1 rounded-full border border-[#E8DEC8]">
                      ● Active Workflow
                    </span>
                  </div>

                  {activeWorkflowTab === '01' && (
                    <div className="space-y-3 animate-fade-in-up">
                      <div className="p-4 bg-[#FFF9F1] rounded-2xl border border-[#E8DEC8] space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#234653]">Household Invite Code</span>
                          <span className="font-mono font-bold text-sm bg-[#FAF5ED] px-3 py-1 rounded-lg border border-[#E8DEC8] text-[#E86F5A]">
                            MAPLE-3B
                          </span>
                        </div>
                        <p className="text-[11px] text-[#3E737C]">
                          Share this invite code with your flatmates to link their accounts to the shared calendar, chores, and balances instantly.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeWorkflowTab === '02' && (
                    <div className="space-y-3 animate-fade-in-up">
                      <div className="p-4 bg-[#FFF9F1] rounded-2xl border border-[#E8DEC8] space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#234653]">Weekly Rotation Balance</span>
                          <span className="text-[10px] text-emerald-700 font-semibold">100% Equal Parity</span>
                        </div>
                        <div className="w-full bg-[#FAF5ED] h-2.5 rounded-full overflow-hidden flex border border-[#E8DEC8]">
                          <div className="bg-[#234653] w-1/3" title="Alex: 33%"></div>
                          <div className="bg-[#E86F5A] w-1/3" title="Maya: 33%"></div>
                          <div className="bg-[#E7A83C] w-1/3" title="You: 34%"></div>
                        </div>
                        <span className="text-[10px] text-[#3E737C] block text-right">3 flatmates • Automatic turns</span>
                      </div>
                    </div>
                  )}

                  {activeWorkflowTab === '03' && (
                    <div className="space-y-3 animate-fade-in-up">
                      <div className="p-4 bg-[#FFF9F1] rounded-2xl border border-[#E8DEC8] space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#234653]">Simplified Balances</span>
                          <span className="text-xs font-bold text-emerald-700">1 transfer needed</span>
                        </div>
                        <div className="p-2.5 bg-[#FAF5ED] rounded-xl border border-[#E8DEC8] flex items-center justify-between">
                          <span>Maya pays Alex ₹413.33</span>
                          <span className="font-bold text-[#234653]">All settled</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeWorkflowTab === '04' && (
                    <div className="space-y-3 animate-fade-in-up">
                      <div className="p-4 bg-[#FFF9F1] rounded-2xl border border-[#E8DEC8] space-y-2 text-xs">
                        <span className="font-bold text-[#234653] block">Active Poll: Host Friday Dinner</span>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF5ED] border border-[#E8DEC8]">
                          <span>Yes, let's host! (Alex, Maya)</span>
                          <span className="font-bold text-[#E86F5A]">67%</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF5ED] border border-[#E8DEC8]">
                          <span>Let's do Saturday instead</span>
                          <span className="font-bold text-[#3E737C]">33%</span>
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
      {/* 6. LIVE INTERACTIVE HOUSEHOLD SANDBOX */}
      {/* ======================================================== */}
      <section id="sandbox" className="py-20 sm:py-28 border-b border-[#E8DEC8] bg-[#F4EDE3]">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          <ScrollReveal direction="up" className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E86F5A]">Live Sandbox</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#234653] tracking-[-0.035em] mt-2 font-serif-editorial">
              Try the household workspace right now.
            </h2>
            <p className="mt-3 text-base text-[#3E737C]">
              Click tasks to check them off, add a custom chore, or test the live expense split calculator below.
            </p>
          </ScrollReveal>

          <TiltCard maxTilt={3} className="rounded-3xl shadow-xl">
            <div className="bg-[#FFF9F1] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
                <div>
                  <h3 className="text-base font-bold text-[#234653] font-serif-editorial">
                    The Maple Flat • Interactive Sandbox
                  </h3>
                  <span className="text-[11px] text-[#3E737C]">Shared household demo</span>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FAF5ED] text-[#234653] border border-[#E8DEC8]">
                  {sandboxChores.filter(c => c.done).length} of {sandboxChores.length} tasks completed
                </span>
              </div>

              {/* Chores Interactive Checklist */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-[#234653] block">Today's Chore Rotation:</span>
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
              <form onSubmit={addChore} className="pt-1 flex items-center gap-2">
                <input
                  type="text"
                  value={newChoreText}
                  onChange={(e) => setNewChoreText(e.target.value)}
                  placeholder="Type a new task (e.g. Empty recycling, Restock dish soap)..."
                  className="flex-1 bg-[#FAF5ED] border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#234653] placeholder-[#3E737C]/70 focus:outline-none focus:border-[#3E737C]/50"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#234653] hover:bg-[#17272C] text-white text-xs font-semibold uppercase tracking-wider transition-all btn-interactive"
                >
                  + Add Task
                </button>
              </form>

              {/* Interactive Expense Split Preview */}
              <div className="pt-4 border-t border-[#E8DEC8] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#234653]">Instant Split Calculator:</span>
                  <span className="text-xs font-bold text-[#E86F5A] font-serif-editorial">
                    ₹{Math.round(simBillAmount / simRoommateCount).toLocaleString()} / roommate
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-[#3E737C] block mb-1">Total Bill: ₹{simBillAmount}</label>
                    <input
                      type="range"
                      min="300"
                      max="6000"
                      step="150"
                      value={simBillAmount}
                      onChange={(e) => setSimBillAmount(Number(e.target.value))}
                      className="w-full accent-[#E86F5A] cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#3E737C] block mb-1">Roommates: {simRoommateCount} people</label>
                    <div className="flex gap-2">
                      {[2, 3, 4, 5].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setSimRoommateCount(count)}
                          className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                            simRoommateCount === count
                              ? 'bg-[#234653] text-white border-[#234653]'
                              : 'bg-[#FAF5ED] border-[#E8DEC8] text-[#234653]'
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
          </TiltCard>
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
              { icon: '🔄', title: 'Automated Chore Cycles', desc: 'Daily, weekly, or custom cleaning rotations with fair workload balancing algorithms.' },
              { icon: '⚖️', title: 'Expense Splits & Debt Graph', desc: 'Track shared bills, split costs equally or by shares, and minimize transfer debts.' },
              { icon: '🛒', title: 'Shared Shopping Basket', desc: 'Live pantry restock lists with item reservation and instant split-to-expense conversion.' },
              { icon: '🗳️', title: 'House Decision Polls', desc: 'Vote on weekend plans, guest rules, and furniture purchases without messy group texts.' },
              { icon: '🙋', title: 'Favor & Help Requests', desc: 'Quick notifications for package pickups, dog walking, or emergency key handoffs.' },
              { icon: '📅', title: 'Household Calendar', desc: 'Coordinate quiet hours, member availability, and upcoming apartment events in sync.' }
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
      {/* 8. FAQ ACCORDION */}
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
              <span className="text-xs font-bold uppercase tracking-widest text-[#F2D4C8]">Get Started Today</span>
              <h2 className="text-3xl sm:text-5xl font-bold font-serif-editorial tracking-tight text-[#FFF9F1]">
                Make your household easier to manage.
              </h2>
              <p className="text-sm sm:text-base text-[#DCE8E8] leading-relaxed">
                Bring all everyday flatmate responsibilities into one calm shared space. Set up your home in under two minutes.
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
              <p className="text-[#3E737C] mt-0.5">Household journal and shared living operating system.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="#why" className="hover:text-[#234653] transition-colors">Why RoomSync</a>
            <a href="#process" className="hover:text-[#234653] transition-colors">How It Works</a>
            <a href="#sandbox" className="hover:text-[#234653] transition-colors">Sandbox</a>
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
