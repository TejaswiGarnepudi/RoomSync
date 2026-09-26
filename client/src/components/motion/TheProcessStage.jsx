import React, { useState } from 'react';
import ScrollReveal from './ScrollReveal';

export default function TheProcessStage() {
  const [activeTab, setActiveTab] = useState('01');

  const steps = [
    {
      id: '01',
      label: '01 Setup & Invite',
      title: 'Create the household space in seconds.',
      desc: 'Create your home hub and share your unique 8-character code. Flatmates join with a single tap to instantly sync tasks and expenses.',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=85',
      badge: 'MAPLE-3B',
      card1Title: 'Household Space Created',
      card1Subtitle: '3 flatmates connected & synchronized',
      card2Title: 'Access Protocol',
      card2Subtitle: 'Private & encrypted room data'
    },
    {
      id: '02',
      label: '02 Auto Chores',
      title: 'Intelligent, automated chore rotations.',
      desc: 'Add recurring tasks for the kitchen, trash, and living room. Our balancing algorithm rotates turns smoothly so nobody is overburdened.',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=85',
      badge: '100% PARITY',
      card1Title: 'Kitchen Deep Clean & Restock',
      card1Subtitle: "Maya's turn • Auto-advances Sunday",
      card2Title: 'Fair Share Balance',
      card2Subtitle: 'Equal 33.3% workload distribution'
    },
    {
      id: '03',
      label: '03 Split & Settle',
      title: 'Expense splitting with debt simplification.',
      desc: 'Snap receipts or log monthly utilities. The multi-party debt minimization engine eliminates back-and-forth bank transfers.',
      image: 'https://images.unsplash.com/photo-1547587091-f883cf8f0c12?auto=format&fit=crop&w=1400&q=85',
      badge: 'DEBT MINIMIZED',
      card1Title: 'Monthly Electricity & WiFi',
      card1Subtitle: '₹3,600 total • Maya pays Alex ₹1,200',
      card2Title: 'Settlement Status',
      card2Subtitle: '1 single transfer settles all flatmates'
    },
    {
      id: '04',
      label: '04 Decide & Sync',
      title: 'Group decisions, grocery lists & favors.',
      desc: 'Vote on weekend guests or apartment purchases with live polls, share real-time pantry restock lists, and ask for quick favors.',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=85',
      badge: 'LIVE POLL',
      card1Title: 'Poll: Host Friday Dinner',
      card1Subtitle: '2 of 3 votes in favor • 67% majority',
      card2Title: 'Favor Request',
      card2Subtitle: 'Alex: Oat milk picked up & in fridge'
    }
  ];

  const currentStep = steps.find(s => s.id === activeTab) || steps[0];

  return (
    <section id="process" className="py-28 border-b border-[#E8E7E1] dark:border-[#2A2A28] bg-[#FAF9F5] dark:bg-[#0E0E0D] text-[#1A1A1A] dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
        {/* Centered Section Header */}
        <ScrollReveal direction="up" className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#71716E] dark:text-[#A8A7A0]">
            The Process
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-[54px] leading-[1.12] font-normal tracking-[-0.045em] text-[#1A1A1A] dark:text-white mt-3">
            From a first thought<br />to a finished piece.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#71716E] dark:text-[#A8A7A0] max-w-lg mx-auto leading-normal">
            Collect what moves you. Organize household life, together.
          </p>
        </ScrollReveal>

        {/* Centered Sparkdesign Pill Selector */}
        <ScrollReveal direction="up" delay={0.1} className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[#EAE8E1] dark:bg-[#1E1E1C] border border-[#E8E7E1] dark:border-[#2E2E2A] shadow-xl overflow-x-auto max-w-full">
            {steps.map((step) => {
              const isActive = activeTab === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveTab(step.id)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-250 select-none whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#2E2E2A] text-[#1A1A1A] dark:text-white shadow-md border border-[#E8E7E1] dark:border-[#3E3E38]'
                      : 'text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-white/50 dark:hover:bg-[#252522]/60'
                  }`}
                >
                  {step.label}
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Large Centered Stage Canvas Card */}
        <ScrollReveal direction="up" delay={0.15}>
          <div className="relative w-full max-w-5xl mx-auto rounded-[32px] bg-white dark:bg-[#1A1A18] border border-[#E8E7E1] dark:border-[#2E2E2A] p-4 sm:p-7 shadow-2xl overflow-hidden group">
            {/* Top Stage Header */}
            <div className="flex items-center justify-between px-2 sm:px-4 py-3 border-b border-[#E8E7E1] dark:border-[#2A2A28] mb-5">
              <div className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs sm:text-sm font-medium text-[#1A1A1A] dark:text-[#E0DFD8]">
                  Stage {currentStep.id}: {currentStep.title}
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#FAF9F5] dark:bg-[#252522] border border-[#E8E7E1] dark:border-[#383832] text-[#1A1A1A] dark:text-[#A8A7A0] px-3 py-1 rounded-full">
                {currentStep.badge}
              </span>
            </div>

            {/* Stage Hero Image with Overlay & Floating Glass Cards */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[21/10] bg-[#222220] border border-[#E8E7E1] dark:border-[#2E2E2A]">
              <img
                key={currentStep.id}
                src={currentStep.image}
                alt={currentStep.title}
                className="w-full h-full object-cover opacity-85 transition-all duration-700 ease-out group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

              {/* Floating Bottom Left Card: Main Stage Detail */}
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 max-w-xs sm:max-w-md bg-[#141413]/90 backdrop-blur-md border border-white/10 p-4 sm:p-5 rounded-2xl shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    {currentStep.card1Title}
                  </span>
                  <span className="size-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#B0AFAB]">
                  {currentStep.card1Subtitle}
                </p>
              </div>

              {/* Floating Bottom Right Card: Status Pill */}
              <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 hidden sm:flex items-center gap-3 bg-[#1E1E1C]/90 backdrop-blur-md border border-[#3E3E38] px-4 py-3 rounded-2xl shadow-2xl animate-fade-in-up">
                <div className="text-right">
                  <p className="text-xs font-medium text-white">{currentStep.card2Title}</p>
                  <p className="text-[10px] text-[#A8A7A0]">{currentStep.card2Subtitle}</p>
                </div>
                <div className="size-7 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  ✓
                </div>
              </div>
            </div>

            {/* Stage Footer Description */}
            <div className="mt-5 px-2 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#71716E] dark:text-[#A8A7A0]">
              <p className="max-w-2xl text-sm text-[#1A1A1A] dark:text-[#D0CFC9] leading-relaxed">
                {currentStep.desc}
              </p>
              <div className="flex items-center gap-2 shrink-0 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                <span>Auto-synchronized in real time</span>
                <span>&rarr;</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
