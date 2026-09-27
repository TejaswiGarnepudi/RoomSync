import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function HelpCenter() {
  const { isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });

  const categories = [
    { id: 'all', label: 'All Topics', icon: '✦' },
    { id: 'getting-started', label: 'Getting Started', icon: '🏠' },
    { id: 'chores', label: 'Chore Automation', icon: '🧹' },
    { id: 'expenses', label: 'Expenses & Splits', icon: '💳' },
    { id: 'groceries', label: 'Grocery Restocks', icon: '🛒' },
    { id: 'decisions', label: 'Decisions & Polls', icon: '🗳️' },
    { id: 'security', label: 'Privacy & Security', icon: '🔒' }
  ];

  const articles = [
    {
      id: 1,
      category: 'getting-started',
      title: 'How do I create a new household space and invite flatmates?',
      summary: 'When you sign up, click "Create Household". You will receive an instant 8-character invite code (e.g. MAPLE-3B) that your roommates can enter to join immediately.',
      content: 'Once your roommates enter the invite code on their phones or laptops, they will automatically be synced into the shared chore rotation, grocery checklist, and expense dashboard.'
    },
    {
      id: 2,
      category: 'getting-started',
      title: 'Can a roommate belong to multiple households?',
      summary: 'RoomSync allows users to switch between or join households using separate invite codes for holiday homes or college dorms.',
      content: 'You can manage your household membership under the Roommates tab in your navigation.'
    },
    {
      id: 3,
      category: 'chores',
      title: 'How does the automated chore balancing algorithm work?',
      summary: 'RoomSync calculates total workload minutes per roommate and automatically rotates turns fairly.',
      content: 'When a chore is completed, the system advances to the next flatmate according to the configured cycle (daily, weekly, or monthly). Smart balancing prevents any single roommate from taking on more than their fair share.'
    },
    {
      id: 4,
      category: 'chores',
      title: 'What happens if a roommate misses a chore deadline?',
      summary: 'Chores that pass their due date are automatically flagged with gentle reminders.',
      content: 'Roommates receive non-intrusive notifications and can request quick favors or swap duties with a single tap.'
    },
    {
      id: 5,
      category: 'expenses',
      title: 'How does debt minimization calculate multi-party settlements?',
      summary: 'Instead of everyone paying each other back in 10 separate transfers, RoomSync simplifies net balances.',
      content: 'Our multi-party debt graph algorithm finds the optimal payment paths so that 1 or 2 single bank transfers settle all flatmate debts cleanly without awkward math.'
    },
    {
      id: 6,
      category: 'expenses',
      title: 'Can we split groceries or utilities unevenly?',
      summary: 'Yes. RoomSync supports equal splits, custom percentage splits, and exact share allocations.',
      content: 'When adding an expense, select your preferred split type to assign custom amounts to specific flatmates.'
    },
    {
      id: 7,
      category: 'groceries',
      title: 'How do recurring pantry restock rules work?',
      summary: 'Setup automated rules for essentials like oat milk, coffee beans, or dish soap.',
      content: 'When an item is due for replenishment, RoomSync flags it in your household shopping checklist and allows anyone at the store to mark it purchased and 1-click split the receipt.'
    },
    {
      id: 8,
      category: 'decisions',
      title: 'How do decision polls resolve house debates?',
      summary: 'Create custom polls for guest policies, shared furniture purchases, or quiet hours.',
      content: 'Flatmates can vote anonymously or openly with set expiration deadlines. Once the threshold is met, the decision is logged permanently into the household archive.'
    },
    {
      id: 9,
      category: 'security',
      title: 'Is our household data, receipts, and financial info private?',
      summary: 'Yes. RoomSync uses end-to-end encrypted transport and strict household-level isolation.',
      content: 'Only explicitly invited roommates with your private 8-character code can view your household tasks, receipts, and availability schedules.'
    }
  ];

  const filteredArticles = articles.filter(art => {
    const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.email || !contactForm.message) return;
    setContactSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#0E0E0D] text-[#1A1A1A] dark:text-[#FAF9F5] flex flex-col font-sans transition-colors duration-300">
      {/* Top Navbar Header */}
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
            Help Centre
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
            to="/dashboard"
            className="px-4 py-2 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Open Dashboard &rarr;
          </Link>
        </div>
      </header>

      {/* Main Support Body */}
      <main className="max-w-5xl mx-auto px-6 sm:px-10 py-12 sm:py-16 space-y-12 flex-1 w-full animate-fade-in-up">
        {/* Hero Section with Live Search */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#71716E] dark:text-[#8E8E88]">
            Knowledge Base & Support
          </span>
          <h1 className="text-4xl sm:text-5xl font-normal tracking-[-0.04em] text-[#1A1A1A] dark:text-white">
            How can we help your home?
          </h1>
          <p className="text-sm sm:text-base text-[#71716E] dark:text-[#A8A7A0]">
            Explore guides on chore balancing, debt minimization, grocery sync, and household harmony.
          </p>

          {/* Search Bar */}
          <div className="pt-2 relative max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Search guides (e.g. debt split, invite flatmates, chore rotation)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-full bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] text-sm text-[#1A1A1A] dark:text-white placeholder-[#8E8E88] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white shadow-sm transition-colors"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base opacity-60">🔍</span>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] shadow-xs'
                  : 'bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] text-[#71716E] dark:text-[#8E8E88] hover:border-[#1A1A1A]/30 dark:hover:border-white/20'
              }`}
            >
              <span className="mr-1.5">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Articles Accordion */}
        <div className="space-y-3">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl text-sm text-[#71716E] dark:text-[#8E8E88]">
              No articles found matching "{searchQuery}". Try searching for another topic or contact our team below.
            </div>
          ) : (
            filteredArticles.map((art) => {
              const isOpen = openFaq === art.id;
              return (
                <div
                  key={art.id}
                  className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-2xl overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : art.id)}
                    className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <div>
                      <h3 className="text-base font-medium text-[#1A1A1A] dark:text-white">
                        {art.title}
                      </h3>
                      <p className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-1">
                        {art.summary}
                      </p>
                    </div>
                    <span className={`text-xl text-[#1A1A1A] dark:text-white transition-transform duration-200 shrink-0 mt-0.5 ${isOpen ? 'rotate-45' : ''}`}>
                      +
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-[#E8E7E1]/50 dark:border-[#2A2A28]/50 text-xs sm:text-sm text-[#4A4A48] dark:text-[#C4C3BA] leading-relaxed animate-fade-in-up">
                      {art.content}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact Support Card */}
        <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-7 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#71716E] dark:text-[#8E8E88]">
                Get in Touch
              </span>
              <h2 className="text-2xl font-normal text-[#1A1A1A] dark:text-white mt-1">
                Still have questions or need assistance?
              </h2>
            </div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 text-xs font-medium">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Support Online
            </span>
          </div>

          {contactSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-center space-y-2 animate-fade-in-up">
              <div className="text-2xl">✓</div>
              <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Message Received!</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
                Thank you for reaching out. A RoomSync support member will respond to <strong>{contactForm.email}</strong> shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase font-semibold text-[#71716E] dark:text-[#8E8E88] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Alex Lee"
                    className="w-full h-11 px-4 rounded-xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] text-xs text-[#1A1A1A] dark:text-white placeholder-[#8E8E88] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white"
                  />
                </div>
                <div>
                  <label className="block uppercase font-semibold text-[#71716E] dark:text-[#8E8E88] mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="alex@example.com"
                    className="w-full h-11 px-4 rounded-xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] text-xs text-[#1A1A1A] dark:text-white placeholder-[#8E8E88] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-semibold text-[#71716E] dark:text-[#8E8E88] mb-1">Topic / Subject</label>
                <input
                  type="text"
                  required
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. Question about expense split calculations"
                  className="w-full h-11 px-4 rounded-xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] text-xs text-[#1A1A1A] dark:text-white placeholder-[#8E8E88] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white"
                />
              </div>

              <div>
                <label className="block uppercase font-semibold text-[#71716E] dark:text-[#8E8E88] mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Describe what you need help with..."
                  className="w-full p-4 rounded-xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] text-xs text-[#1A1A1A] dark:text-white placeholder-[#8E8E88] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                Send Support Request &rarr;
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E7E1] dark:border-[#2A2A28] py-8 text-center text-xs text-[#71716E] dark:text-[#8E8E88]">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} RoomSync Inc. Support & Documentation.</p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:underline">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link to="/" className="hover:underline">Landing Page</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
