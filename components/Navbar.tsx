
import React, { useState, useEffect } from 'react';
import { View } from '../types';

interface NavbarProps {
  onNavigate: (view: View) => void;
  onSearch: (query: string) => void;
  user: any;
  externalQuery?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, onSearch, user, externalQuery = '' }) => {
  const [query, setQuery] = useState(externalQuery);
  const [isSearchMobile, setIsSearchMobile] = useState(false);

  useEffect(() => {
    setQuery(externalQuery);
  }, [externalQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setIsSearchMobile(false);
  };

  return (
    <nav className="h-14 bg-[#050505]/95 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4">
      {/* Search overlay for mobile */}
      {isSearchMobile && (
        <div className="absolute inset-0 bg-[#050505] z-[110] flex items-center px-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <button onClick={() => setIsSearchMobile(false)} className="mr-4 text-zinc-400 w-10 h-10 flex items-center justify-center">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search EduStream..."
              className="w-full bg-transparent border-none text-white focus:outline-none placeholder-zinc-600 text-base"
            />
          </form>
          {query && (
            <button onClick={() => setQuery('')} className="ml-2 text-zinc-600 w-10 h-10 flex items-center justify-center">
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center group-hover:scale-105 transition-all shadow-lg shadow-white/10">
            <i className="fa-solid fa-bolt-lightning text-black text-[10px]"></i>
          </div>
          <span className="text-lg font-black tracking-tighter text-white">
            Edu<span className="text-zinc-500">Stream</span>
          </span>
        </div>
      </div>

      <div className="hidden md:flex flex-1 max-w-xl mx-8 items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative group">
          <div className="flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for courses, titles, or authors..."
              className="w-full bg-[#121212] border border-white/10 rounded-l-xl py-2 px-5 text-sm text-white focus:outline-none focus:border-white/30 placeholder-zinc-600 transition-all"
            />
            <button className="bg-[#222] border border-l-0 border-white/10 rounded-r-xl px-5 py-2 hover:bg-[#2a2a2a] transition-colors">
              <i className="fa-solid fa-magnifying-glass text-zinc-500 text-sm"></i>
            </button>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-1">
        <button 
          onClick={() => setIsSearchMobile(true)}
          className="md:hidden w-10 h-10 text-zinc-400 hover:bg-white/5 rounded-full transition-all flex items-center justify-center"
        >
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
        <button className="w-10 h-10 text-zinc-400 hover:bg-white/5 rounded-full transition-all flex items-center justify-center">
          <i className="fa-solid fa-bell text-lg"></i>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
