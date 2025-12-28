
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  isOpen: boolean;
  onNavigate: (view: View) => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, isOpen, onNavigate }) => {
  const primaryLinks = [
    { id: 'home', icon: 'fa-house', label: 'Home' },
    { id: 'search', icon: 'fa-compass', label: 'Explore' },
    { id: 'dashboard', icon: 'fa-clapperboard', label: 'Studio' },
  ];

  const secondaryLinks = [
    { id: 'history', icon: 'fa-clock-rotate-left', label: 'History' },
    { id: 'playlist', icon: 'fa-list-ul', label: 'Playlists' },
    { id: 'liked', icon: 'fa-thumbs-up', label: 'Liked' },
  ];

  // Hidden on mobile, static on desktop
  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-0 bottom-0 bg-[#050505] z-[80] transition-all duration-300 border-r border-white/5 flex flex-col pt-14 w-64 hidden xl:flex">
      <div className="flex-1 flex flex-col overflow-y-auto px-3 py-4 scrollbar-hide">
        <div className="space-y-1 pb-4 border-b border-white/5">
          {primaryLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id as View)}
              className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all group ${
                currentView === link.id 
                  ? 'bg-white/10 text-white font-bold' 
                  : 'text-zinc-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${link.icon} text-lg w-6 text-center transition-transform group-hover:scale-110`}></i>
              <span className="text-[13px] tracking-tight">{link.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-1 py-4 border-b border-white/5">
          <h3 className="px-3 text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-2">Library</h3>
          {secondaryLinks.map((link) => (
            <button
              key={link.id}
              className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-zinc-500 hover:bg-white/5 hover:text-white transition-all group"
            >
              <i className={`fa-solid ${link.icon} text-lg w-6 text-center transition-transform group-hover:scale-110`}></i>
              <span className="text-[13px] tracking-tight">{link.label}</span>
            </button>
          ))}
        </div>

        <div className="py-6 px-3">
          <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-2xl border border-white/5 p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/20 transition-all"></div>
            <div className="flex items-center gap-2 mb-2">
              <i className="fa-solid fa-sparkles ai-gradient-text text-sm"></i>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">AI Learning</span>
            </div>
            <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">Personalized tutoring for every video lecture.</p>
            <button className="w-full py-2 bg-white text-black text-[11px] font-black rounded-lg hover:bg-zinc-200 transition-all shadow-xl active:scale-95">
              Go Premium
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 text-[10px] font-medium text-zinc-700 space-y-2">
        <p>© 2024 EduStream AI LLC</p>
      </div>
    </aside>
  );
};

export default Sidebar;
