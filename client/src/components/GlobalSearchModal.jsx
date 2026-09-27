import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './ui/Modal';
import { globalSearch } from '../services/searchService';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ chores: [], expenses: [], shoppingLists: [], shoppingItems: [], helpRequests: [], polls: [] });
  const [loading, setLoading] = useState(false);
  const [totalMatches, setTotalMatches] = useState(0);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ chores: [], expenses: [], shoppingLists: [], shoppingItems: [], helpRequests: [], polls: [] });
      setTotalMatches(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ chores: [], expenses: [], shoppingLists: [], shoppingItems: [], helpRequests: [], polls: [] });
      setTotalMatches(0);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await globalSearch(query.trim());
        setResults(res.data.data.results);
        setTotalMatches(res.data.data.totalMatches);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url) => {
    onClose();
    navigate(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Search Household Journal" maxWidth="max-w-xl">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search chores, expenses, groceries, favors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm text-[#1A1A1A] dark:text-white placeholder:text-[#71716E] dark:placeholder:text-[#888880] bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-2xl focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white transition-all shadow-2xs"
          />
          <span className="absolute left-3.5 top-3.5 text-sm opacity-60">🔍</span>
          {loading && (
            <span className="absolute right-3.5 top-3.5 text-xs text-[#71716E] animate-spin">⏳</span>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-80 overflow-y-auto space-y-4 pt-1">
          {query.trim() && totalMatches === 0 && !loading ? (
            <div className="text-center py-8 text-[#71716E] dark:text-[#8E8E88] text-xs">
              No household entries found for "{query}".
            </div>
          ) : null}

          {/* Chores */}
          {results.chores && results.chores.length > 0 && (
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] block mb-1.5">
                🧹 Chores ({results.chores.length})
              </span>
              <div className="space-y-1.5">
                {results.chores.map(c => (
                  <div
                    key={c._id}
                    onClick={() => handleSelect(`/chores/${c._id}`)}
                    className="p-3 bg-[#FAF9F5] dark:bg-[#181816] hover:bg-[#EAE8E1] dark:hover:bg-[#20201E] rounded-xl border border-[#E8E7E1] dark:border-[#2A2A28] cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-medium text-[#1A1A1A] dark:text-white">{c.title}</span>
                    <span className="text-[#71716E] dark:text-[#8E8E88] capitalize">{c.category} • Due {c.dueDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expenses */}
          {results.expenses && results.expenses.length > 0 && (
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] block mb-1.5">
                💰 Expenses ({results.expenses.length})
              </span>
              <div className="space-y-1.5">
                {results.expenses.map(exp => (
                  <div
                    key={exp._id}
                    onClick={() => handleSelect(`/expenses/${exp._id}`)}
                    className="p-3 bg-[#FAF9F5] dark:bg-[#181816] hover:bg-[#EAE8E1] dark:hover:bg-[#20201E] rounded-xl border border-[#E8E7E1] dark:border-[#2A2A28] cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-medium text-[#1A1A1A] dark:text-white">{exp.title}</span>
                    <span className="font-semibold text-[#1A1A1A] dark:text-white">₹{exp.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help Requests */}
          {results.helpRequests && results.helpRequests.length > 0 && (
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] block mb-1.5">
                🤝 Favors & Help ({results.helpRequests.length})
              </span>
              <div className="space-y-1.5">
                {results.helpRequests.map(h => (
                  <div
                    key={h._id}
                    onClick={() => handleSelect(`/help/${h._id}`)}
                    className="p-3 bg-[#FAF9F5] dark:bg-[#181816] hover:bg-[#EAE8E1] dark:hover:bg-[#20201E] rounded-xl border border-[#E8E7E1] dark:border-[#2A2A28] cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-medium text-[#1A1A1A] dark:text-white">{h.title}</span>
                    <span className="text-[#71716E] dark:text-[#8E8E88] capitalize">{h.type} • {h.urgency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shopping */}
          {(results.shoppingLists?.length > 0 || results.shoppingItems?.length > 0) && (
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] block mb-1.5">
                🛍️ Groceries & Shopping
              </span>
              <div className="space-y-1.5">
                {results.shoppingLists?.map(l => (
                  <div
                    key={l._id}
                    onClick={() => handleSelect(`/shopping`)}
                    className="p-3 bg-[#FAF9F5] dark:bg-[#181816] hover:bg-[#EAE8E1] dark:hover:bg-[#20201E] rounded-xl border border-[#E8E7E1] dark:border-[#2A2A28] cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-medium text-[#1A1A1A] dark:text-white">📋 List: {l.name}</span>
                    <span className="text-[#71716E] dark:text-[#8E8E88]">{l.store || 'Household'}</span>
                  </div>
                ))}
                {results.shoppingItems?.map(i => (
                  <div
                    key={i._id}
                    onClick={() => handleSelect(`/shopping`)}
                    className="p-3 bg-[#FAF9F5] dark:bg-[#181816] hover:bg-[#EAE8E1] dark:hover:bg-[#20201E] rounded-xl border border-[#E8E7E1] dark:border-[#2A2A28] cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-medium text-[#1A1A1A] dark:text-white">🛒 {i.name}</span>
                    <span className="text-[#71716E] dark:text-[#8E8E88]">In {i.listId?.name || 'Shopping List'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Polls */}
          {results.polls && results.polls.length > 0 && (
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] block mb-1.5">
                🗳️ Decisions & Polls ({results.polls.length})
              </span>
              <div className="space-y-1.5">
                {results.polls.map(p => (
                  <div
                    key={p._id}
                    onClick={() => handleSelect(`/decisions`)}
                    className="p-3 bg-[#FAF9F5] dark:bg-[#181816] hover:bg-[#EAE8E1] dark:hover:bg-[#20201E] rounded-xl border border-[#E8E7E1] dark:border-[#2A2A28] cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-medium text-[#1A1A1A] dark:text-white">{p.title}</span>
                    <span className="text-[#71716E] dark:text-[#8E8E88] capitalize">{p.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
