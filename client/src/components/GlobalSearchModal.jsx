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
    <Modal isOpen={isOpen} onClose={onClose} title="Search Household Journal">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search chores, expenses, groceries, favors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs text-[#234653] placeholder:text-[#3E737C]/60 bg-[#FFF9F1] border border-[#E8DEC8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3E737C]/25 focus:border-[#3E737C] transition-all"
          />
          <span className="absolute left-3.5 top-3 text-sm">🔍</span>
          {loading && (
            <span className="absolute right-3.5 top-3 text-xs text-[#3E737C] animate-spin">⏳</span>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-80 overflow-y-auto space-y-4 pt-1">
          {query.trim() && totalMatches === 0 && !loading ? (
            <div className="text-center py-8 text-[#3E737C] text-xs">
              No household entries found for "{query}".
            </div>
          ) : null}

          {/* Chores */}
          {results.chores && results.chores.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E737C] block mb-1.5">
                🧹 Chores ({results.chores.length})
              </span>
              <div className="space-y-1.5">
                {results.chores.map(c => (
                  <div
                    key={c._id}
                    onClick={() => handleSelect(`/chores/${c._id}`)}
                    className="p-2.5 bg-[#FAF5ED] hover:bg-[#FBF1EB] rounded-xl border border-[#E8DEC8]/70 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-semibold text-[#234653]">{c.title}</span>
                    <span className="text-[#3E737C] capitalize">{c.category} • Due {c.dueDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expenses */}
          {results.expenses && results.expenses.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E737C] block mb-1.5">
                💰 Expenses ({results.expenses.length})
              </span>
              <div className="space-y-1.5">
                {results.expenses.map(exp => (
                  <div
                    key={exp._id}
                    onClick={() => handleSelect(`/expenses/${exp._id}`)}
                    className="p-2.5 bg-[#FAF5ED] hover:bg-[#FBF1EB] rounded-xl border border-[#E8DEC8]/70 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-semibold text-[#234653]">{exp.title}</span>
                    <span className="font-bold text-[#E86F5A]">₹{exp.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help Requests */}
          {results.helpRequests && results.helpRequests.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E737C] block mb-1.5">
                🤝 Favors & Help ({results.helpRequests.length})
              </span>
              <div className="space-y-1.5">
                {results.helpRequests.map(h => (
                  <div
                    key={h._id}
                    onClick={() => handleSelect(`/help/${h._id}`)}
                    className="p-2.5 bg-[#FAF5ED] hover:bg-[#FBF1EB] rounded-xl border border-[#E8DEC8]/70 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-semibold text-[#234653]">{h.title}</span>
                    <span className="text-[#3E737C] capitalize">{h.type} • {h.urgency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shopping */}
          {(results.shoppingLists?.length > 0 || results.shoppingItems?.length > 0) && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E737C] block mb-1.5">
                🛍️ Groceries & Shopping
              </span>
              <div className="space-y-1.5">
                {results.shoppingLists?.map(l => (
                  <div
                    key={l._id}
                    onClick={() => handleSelect(`/shopping`)}
                    className="p-2.5 bg-[#FAF5ED] hover:bg-[#FBF1EB] rounded-xl border border-[#E8DEC8]/70 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-semibold text-[#234653]">📋 List: {l.name}</span>
                    <span className="text-[#3E737C]">{l.store || 'Household'}</span>
                  </div>
                ))}
                {results.shoppingItems?.map(i => (
                  <div
                    key={i._id}
                    onClick={() => handleSelect(`/shopping`)}
                    className="p-2.5 bg-[#FAF5ED] hover:bg-[#FBF1EB] rounded-xl border border-[#E8DEC8]/70 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-medium text-[#234653]">🛒 {i.name}</span>
                    <span className="text-[#3E737C]">In {i.listId?.name || 'Shopping List'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Polls */}
          {results.polls && results.polls.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E737C] block mb-1.5">
                🗳️ Decisions & Polls ({results.polls.length})
              </span>
              <div className="space-y-1.5">
                {results.polls.map(p => (
                  <div
                    key={p._id}
                    onClick={() => handleSelect(`/decisions`)}
                    className="p-2.5 bg-[#FAF5ED] hover:bg-[#FBF1EB] rounded-xl border border-[#E8DEC8]/70 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-semibold text-[#234653]">{p.title}</span>
                    <span className="text-[#3E737C] capitalize">{p.status}</span>
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
