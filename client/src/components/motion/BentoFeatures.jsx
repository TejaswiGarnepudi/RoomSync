import React, { useState } from 'react';
import ScrollReveal from './ScrollReveal';

export default function BentoFeatures() {
  const [togglePrivate, setTogglePrivate] = useState(true);
  const [activeTabTool, setActiveTabTool] = useState('select');

  return (
    <section id="features" className="py-24 border-b border-[#E8E7E1] bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
        {/* Section Header */}
        <ScrollReveal direction="up" className="max-w-xl mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#71716E]">
            Features & Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] leading-[1.18] font-normal tracking-[-0.035em] text-[#1A1A1A] mt-2">
            Everything your shared home needs to thrive.
          </h2>
          <p className="mt-3 text-base text-[#71716E]">
            Built with calm craftsmanship to replace chaotic group chats, unbalanced chores, and awkward bill splitting.
          </p>
        </ScrollReveal>

        {/* 2x2 Rich Bento Grid matching Sparkdesign Reference */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ======================================================== */}
          {/* TOP LEFT BENTO: Interactive Canvas & Chore Matrix */}
          {/* ======================================================== */}
          <div className="lg:col-span-7">
            <ScrollReveal direction="up" delay={0.1} className="h-full">
              <div className="group relative h-full min-h-[440px] rounded-[32px] bg-[#141413] border border-[#2A2A28] p-7 sm:p-9 overflow-hidden flex flex-col justify-between text-white shadow-xl">
                {/* Dot Grid Background */}
                <div 
                  className="absolute inset-0 opacity-25 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(#6B6964 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                />

                {/* Top header row */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#A8A7A0]">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Household / a softer everyday</span>
                  </div>
                  <div className="size-7 rounded-full bg-[#232321] border border-[#333330] flex items-center justify-center text-xs text-[#A8A7A0]">
                    •••
                  </div>
                </div>

                {/* Center Canvas Scene */}
                <div className="relative z-10 my-6 flex items-center justify-center">
                  {/* Floating Vertical Toolbar */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-2 p-1.5 rounded-2xl bg-[#1E1E1C]/90 backdrop-blur-md border border-[#333330] shadow-xl">
                    {[
                      { id: 'select', icon: 'M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z' },
                      { id: 'grid', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
                      { id: 'check', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
                      { id: 'layers', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' }
                    ].map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => setActiveTabTool(tool.id)}
                        className={`size-8 rounded-xl flex items-center justify-center transition-all ${
                          activeTabTool === tool.id
                            ? 'bg-[#333330] text-white'
                            : 'text-[#888880] hover:text-white'
                        }`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <path d={tool.icon} />
                        </svg>
                      </button>
                    ))}
                  </div>

                  {/* Main Centered Stage Card */}
                  <div className="relative w-full max-w-md ml-0 sm:ml-12 rounded-2xl bg-[#1D1D1B] border border-[#333330] p-4 shadow-2xl transition-transform group-hover:scale-[1.01] duration-300">
                    <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-[#2A2A28]">
                      <img
                        src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80"
                        alt="Living space"
                        className="w-full h-full object-cover opacity-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141413]/80 via-transparent to-transparent"></div>
                      
                      {/* Study Tag Pill on Card */}
                      <div className="absolute bottom-3 left-3 bg-[#141413]/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-medium tracking-wide uppercase text-white">
                        DUTY 01 • KITCHEN & LOUNGE
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-[#A8A7A0]">Maya's weekly rotation • In progress</span>
                      <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/60">
                        92% On Time
                      </span>
                    </div>
                  </div>

                  {/* Floating "You" Roommate Cursor Pin */}
                  <div className="absolute right-6 top-8 hidden sm:flex items-center gap-1.5 animate-float-b">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#10B981" stroke="#10B981" className="-rotate-45">
                      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                    </svg>
                    <span className="bg-[#10B981] text-black font-semibold text-[11px] px-2.5 py-0.5 rounded-full shadow-md">
                      You
                    </span>
                  </div>

                  {/* Floating Bottom Thumbnail Card */}
                  <div className="absolute -bottom-4 right-4 bg-[#1E1E1C]/95 backdrop-blur-md border border-[#383834] rounded-2xl p-2.5 flex items-center gap-3 shadow-2xl animate-float-c hidden sm:flex">
                    <img
                      src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=100&q=80"
                      alt=""
                      className="size-9 rounded-lg object-cover"
                    />
                    <div className="text-left pr-2">
                      <p className="text-[11px] font-medium text-white">Chores, in harmony</p>
                      <span className="text-[9px] text-[#888880]">Live household board ↗</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Text */}
                <div className="relative z-10 pt-2 flex items-center justify-between text-xs text-[#888880]">
                  <span>Something worth exploring.</span>
                  <span className="text-[10px] text-[#A8A7A0]">Automated Turns</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* ======================================================== */}
          {/* TOP RIGHT BENTO: "Slowspace" / Household Access & Perms */}
          {/* ======================================================== */}
          <div className="lg:col-span-5">
            <ScrollReveal direction="up" delay={0.2} className="h-full">
              <div className="group relative h-full min-h-[440px] rounded-[32px] bg-[#141413] border border-[#2A2A28] p-7 sm:p-9 overflow-hidden flex flex-col justify-between text-white shadow-xl">
                {/* Header with image cover */}
                <div>
                  <div className="relative h-28 rounded-2xl overflow-hidden bg-[#232320] border border-[#333330] mb-6">
                    <img
                      src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80"
                      alt="Apartment"
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141413] via-[#141413]/40 to-transparent"></div>
                    <div className="absolute bottom-3 left-4">
                      <h3 className="text-2xl font-normal tracking-[-0.03em] text-white">
                        Slowspace
                      </h3>
                      <p className="text-xs text-[#A8A7A0]">A little outside perspective.</p>
                    </div>
                  </div>

                  {/* Roommate Access List */}
                  <div className="space-y-3">
                    <span className="text-[11px] uppercase tracking-wider text-[#71716E] block font-medium">
                      Household access
                    </span>

                    {/* Member 1: You */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1E1E1C] border border-[#2F2F2C]">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1548382131-e0ebb1f0cdea?auto=format&fit=crop&w=64&q=80"
                          alt="You"
                          className="size-8 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-xs font-medium text-white">You</p>
                          <p className="text-[10px] text-[#888880]">Your personal household</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-[#A8A7A0] bg-[#2A2A28] px-2 py-0.5 rounded-md">
                        Owner
                      </span>
                    </div>

                    {/* Member 2: Alex */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1E1E1C] border border-[#2F2F2C]">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-[#2A2A28] flex items-center justify-center text-xs font-medium text-[#A8A7A0]">
                          AL
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">Alex Lee</p>
                          <p className="text-[10px] text-[#888880]">Shared chore & split parity</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-[#888880]">
                        Flatmate
                      </span>
                    </div>

                    {/* Member 3: Maya */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1E1E1C] border border-[#2F2F2C]">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1670095044002-3b45b6ad8a01?auto=format&fit=crop&w=64&q=80"
                          alt="Maya"
                          className="size-8 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-xs font-medium text-white">Maya Patel</p>
                          <p className="text-[10px] text-[#888880]">Pantry & calendar sync</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-[#888880]">
                        Flatmate
                      </span>
                    </div>
                  </div>
                </div>

                {/* Privacy toggle row & footer */}
                <div className="pt-4 border-t border-[#2A2A28] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-[#A8A7A0]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                      <span>Only invited flatmates</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTogglePrivate(!togglePrivate)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        togglePrivate ? 'bg-[#3E737C]' : 'bg-[#333330]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 size-4 rounded-full bg-white transition-transform ${
                          togglePrivate ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[10px] text-[#71716E]">
                    Your household data, receipts, and balances stay private.
                  </p>
                  <div className="flex items-center justify-end text-[9px] uppercase tracking-widest text-[#71716E]">
                    ONE HOME FOR THE WORK
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* ======================================================== */}
          {/* BOTTOM LEFT BENTO: Contextual House Chat & Favors */}
          {/* ======================================================== */}
          <div className="lg:col-span-5">
            <ScrollReveal direction="up" delay={0.15} className="h-full">
              <div className="group relative h-full min-h-[400px] rounded-[32px] bg-[#1E252B] border border-[#2D3740] p-7 sm:p-9 overflow-hidden flex flex-col justify-between text-white shadow-xl">
                <div>
                  <h3 className="text-3xl font-normal tracking-[-0.035em] text-white">
                    A conversation with context.
                  </h3>
                  <p className="mt-3 text-sm text-[#9BB0BF] leading-relaxed">
                    A thought, a suggestion, a tiny adjustment. Right beside the chores and balances you're managing.
                  </p>
                </div>

                {/* Mock UI Device Preview */}
                <div className="mt-6 relative bg-[#151B20] rounded-2xl border border-[#2D3740] p-4 space-y-3 shadow-2xl">
                  {/* Chat Message 1 */}
                  <div className="flex items-start gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1548382131-e0ebb1f0cdea?auto=format&fit=crop&w=64&q=80"
                      alt="Alex"
                      className="size-7 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="bg-[#1E252B] p-3 rounded-2xl rounded-tl-xs border border-[#2D3740] text-xs space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-white">Alex Lee</span>
                        <span className="text-[10px] text-[#738A9C]">10:14 AM</span>
                      </div>
                      <p className="text-[#C5D5E2]">
                        Picked up oat milk & dish pods from Trader Joe's (₹420).
                      </p>
                      <div className="pt-1.5 flex items-center gap-2">
                        <span className="text-[10px] bg-[#10B981]/15 text-[#10B981] px-2 py-0.5 rounded-md font-medium border border-[#10B981]/30">
                          ✓ Auto-Split 3 ways
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chat Message 2 */}
                  <div className="flex items-start gap-3 pl-6">
                    <img
                      src="https://images.unsplash.com/photo-1670095044002-3b45b6ad8a01?auto=format&fit=crop&w=64&q=80"
                      alt="Maya"
                      className="size-7 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="bg-[#26313A] p-3 rounded-2xl rounded-tl-xs border border-[#354552] text-xs space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">Maya Patel</span>
                        <span className="text-[10px] text-[#738A9C]">10:16 AM</span>
                      </div>
                      <p className="text-[#E0EBF2]">
                        Awesome, I put them in the pantry! Starting kitchen wipe-down now.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs text-[#738A9C]">
                  <span>Live household coordination</span>
                  <span className="text-[10px]">Real-time Sync</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* ======================================================== */}
          {/* BOTTOM RIGHT BENTO: Expense Splits & Debt Simplification Stack */}
          {/* ======================================================== */}
          <div className="lg:col-span-7">
            <ScrollReveal direction="up" delay={0.25} className="h-full">
              <div className="group relative h-full min-h-[400px] rounded-[32px] bg-[#141413] border border-[#2A2A28] p-7 sm:p-9 overflow-hidden flex flex-col justify-between text-white shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs text-[#A8A7A0]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>A GOOD IDEA TAKES A FEW TURNS.</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono bg-[#232320] px-2 py-0.5 rounded border border-[#333330] text-[#A8A7A0]">
                      VERSION 03
                    </span>
                  </div>

                  <h3 className="text-2xl font-normal tracking-[-0.03em] text-white">
                    The shape of household expenses
                  </h3>
                  <p className="mt-1.5 text-xs text-[#A8A7A0]">
                    Multi-party debt simplification algorithm eliminates redundant transfers.
                  </p>
                </div>

                {/* Stacked History Cards matching Reference UI */}
                <div className="my-5 space-y-2.5">
                  {/* Item 1 */}
                  <div className="p-4 rounded-2xl bg-[#1E1E1C] border border-[#333330] flex items-center justify-between transition-colors hover:border-[#444440]">
                    <div className="flex items-center gap-3">
                      <span className="size-2 rounded-full bg-emerald-400"></span>
                      <div>
                        <p className="text-xs font-medium text-white">Monthly Electricity & Fiber WiFi</p>
                        <p className="text-[10px] text-[#888880]">Just now • Split 3 ways</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-white">₹3,600</span>
                      <span className="text-[10px] text-[#A8A7A0] block">v03</span>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="p-4 rounded-2xl bg-[#181816] border border-[#282825] flex items-center justify-between opacity-85">
                    <div className="flex items-center gap-3">
                      <span className="size-2 rounded-full bg-[#555550]"></span>
                      <div>
                        <p className="text-xs font-medium text-[#C0C0BA]">Pantry Restock & Olive Oil</p>
                        <p className="text-[10px] text-[#71716E]">24 mins ago • Settled</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-[#C0C0BA]">₹1,250</span>
                      <span className="text-[10px] text-[#71716E] block">v02</span>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="p-4 rounded-2xl bg-[#141413] border border-[#222220] flex items-center justify-between opacity-65">
                    <div className="flex items-center gap-3">
                      <span className="size-2 rounded-full bg-[#444440]"></span>
                      <div>
                        <p className="text-xs font-medium text-[#999990]">Kitchen Deep Clean Supplies</p>
                        <p className="text-[10px] text-[#666660]">Yesterday • Alex paid</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-[#999990]">₹480</span>
                      <span className="text-[10px] text-[#666660]">v01</span>
                    </div>
                  </div>
                </div>

                {/* Bottom summary chip */}
                <div className="pt-2 flex items-center justify-between text-xs text-[#888880]">
                  <span className="text-emerald-400 font-medium">● 1 single transfer settles all accounts</span>
                  <span className="text-[10px]">Auto-Balancing</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
