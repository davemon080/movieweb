
import React, { useState, useEffect } from 'react';
import { Course, Video } from '../types';
import { geminiService } from '../services/geminiService';

interface VideoPlayerProps {
  course: Course;
  onEnroll: (courseId: string) => void;
  isEnrolled: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ course, onEnroll, isEnrolled }) => {
  const [activeVideo, setActiveVideo] = useState<Video>(course.videos[0]);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isAsking, setIsAsking] = useState(false);

  // Scroll to top on video change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeVideo]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    
    setIsAsking(true);
    const context = `Course: ${course.title}. Video: ${activeVideo.title}. Description: ${activeVideo.description}`;
    const response = await geminiService.askTutor(context, userMsg);
    setIsAsking(false);

    setChatHistory(prev => [...prev, { role: 'ai', text: response || 'I am sorry, I am having trouble processing your request.' }]);
  };

  return (
    <div className="max-w-[1700px] mx-auto p-4 pt-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content: Player + Info */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Video Container */}
          <div className="aspect-video bg-[#000] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/5 relative group">
            {!isEnrolled && course.price > 0 ? (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xl p-6 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/30 rotate-3">
                  <i className="fa-solid fa-lock text-2xl sm:text-3xl text-white"></i>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tighter">Premium Course</h2>
                <p className="text-zinc-400 mb-8 max-w-sm text-xs sm:text-sm font-medium">This content is reserved for enrolled students. Join {course.enrolledCount}+ learners now.</p>
                <button 
                  onClick={() => onEnroll(course.id)}
                  className="px-8 py-3.5 bg-white text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl text-sm"
                >
                  Buy Now for ${course.price}
                </button>
              </div>
            ) : (
              <video 
                key={activeVideo.id} 
                controls 
                className="w-full h-full shadow-inner" 
                autoPlay
              >
                <source src={activeVideo.url} type="video/mp4" />
              </video>
            )}
          </div>

          {/* Video Title & Actions */}
          <div className="px-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter mb-4">{activeVideo.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full ring-2 ring-white/5 p-0.5">
                  <img src={`https://ui-avatars.com/api/?name=${course.author}&background=000&color=fff&bold=true`} className="w-full h-full rounded-full" />
                </div>
                <div>
                  <p className="font-black text-white text-sm">{course.author} <i className="fa-solid fa-circle-check text-blue-500 text-[10px] ml-1"></i></p>
                  <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-tight">Verified Expert</p>
                </div>
                <button className="ml-2 sm:ml-4 bg-white/10 text-white font-bold px-4 py-2 rounded-full text-xs hover:bg-white/20 transition-all active:scale-95">
                  Follow
                </button>
              </div>
              
              <div className="flex gap-2 self-start sm:self-center">
                <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-full text-xs font-black transition-all">
                  <i className="fa-solid fa-thumbs-up"></i> LIKE
                </button>
                <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-full text-xs font-black transition-all">
                  <i className="fa-solid fa-share"></i> SHARE
                </button>
                <button className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-ellipsis"></i>
                </button>
              </div>
            </div>

            <div className="mt-6 bg-white/5 p-4 sm:p-5 rounded-2xl text-xs sm:text-[13px] leading-relaxed border border-white/5">
              <div className="flex items-center gap-4 text-white font-black mb-3 text-[11px] uppercase tracking-widest">
                <span>{course.enrolledCount.toLocaleString()} views</span>
                <span className="opacity-20">|</span>
                <span>{new Date(course.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-zinc-400 font-medium whitespace-pre-wrap">{activeVideo.description}</p>
            </div>
          </div>
        </div>

        {/* Sidebar: AI + Content */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Gemini AI Sidekick */}
          <div className="glass rounded-[2rem] flex flex-col h-[500px] lg:h-[550px] shadow-2xl overflow-hidden border border-blue-500/10 ai-glow">
            <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <i className="fa-solid fa-sparkles text-white text-[10px]"></i>
                </div>
                <h2 className="font-black text-white text-[13px] tracking-tight uppercase">AI Learning Partner</h2>
              </div>
              <div className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-black rounded border border-blue-500/20 uppercase">Gemini 3</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 scrollbar-hide bg-black/10">
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/10">
                    <i className="fa-solid fa-wand-magic-sparkles text-xl text-blue-500"></i>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Ready to assist</p>
                  <p className="text-[13px] text-zinc-600 font-medium">Ask me to summarize key points, explain difficult terms, or provide code examples.</p>
                </div>
              ) : (
                chatHistory.map((chat, i) => (
                  <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] px-4 py-3 text-[13px] leading-relaxed rounded-2xl font-medium shadow-sm ${
                      chat.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white/10 text-zinc-200 rounded-bl-none border border-white/5'
                    }`}>
                      {chat.text}
                    </div>
                  </div>
                ))
              )}
              {isAsking && (
                <div className="flex justify-start">
                  <div className="bg-white/5 rounded-2xl px-4 py-2 text-zinc-500 text-[11px] font-bold italic animate-pulse border border-white/5">
                    Analyzing context...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleAsk} className="p-4 bg-black/40 border-t border-white/5">
              <div className="relative group">
                <input
                  disabled={!isEnrolled && course.price > 0}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={!isEnrolled && course.price > 0 ? "Enroll to unlock AI chat..." : "Ask your tutor..."}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-12 py-3.5 text-[13px] text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-700 font-medium"
                />
                <button 
                  type="submit"
                  disabled={isAsking || !chatInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 transition-all active:scale-90 shadow-lg disabled:opacity-10"
                >
                  <i className="fa-solid fa-arrow-up text-[12px]"></i>
                </button>
              </div>
            </form>
          </div>

          {/* Course Playlist */}
          <div className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden flex flex-col h-[400px]">
            <div className="p-5 border-b border-white/5 bg-black/20">
              <h2 className="font-black text-white text-[13px] uppercase tracking-wider">Curriculum</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">{course.videos.length} Lectures</span>
                <span className="text-[10px] text-zinc-800">•</span>
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">Self-paced</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {course.videos.map((v, idx) => {
                const isLocked = !isEnrolled && course.price > 0 && idx > 0;
                return (
                  <button
                    key={v.id}
                    disabled={isLocked}
                    onClick={() => setActiveVideo(v)}
                    className={`w-full text-left p-4 flex gap-4 transition-all border-b border-white/5 relative group ${
                      activeVideo.id === v.id ? 'bg-blue-600/10' : 'hover:bg-white/5'
                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border border-white/5 ${
                      activeVideo.id === v.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-600'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-grow">
                      <p className={`text-[13px] font-bold leading-tight tracking-tight ${
                        activeVideo.id === v.id ? 'text-blue-400' : 'text-zinc-300'
                      }`}>
                        {v.title}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-1 font-black uppercase">{v.duration}</p>
                    </div>
                    {isLocked && (
                       <i className="fa-solid fa-lock text-zinc-700 text-[10px] self-center"></i>
                    )}
                    {activeVideo.id === v.id && !isLocked && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-pulse">
                        <i className="fa-solid fa-play text-blue-500 text-[10px]"></i>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
