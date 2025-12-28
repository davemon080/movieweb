
import React, { useState } from 'react';
import { Course, User } from '../types';
import { geminiService } from '../services/geminiService';

interface DashboardProps {
  user: User;
  courses: Course[];
  onAddCourse: (course: Course) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, courses, onAddCourse }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '0',
    category: 'Software'
  });

  const userCourses = courses.filter(c => user.ownedCourses.includes(c.id));

  const handleAIAnalyze = async () => {
    if (!formData.title || !formData.description) return;
    setIsAnalyzing(true);
    const analysis = await geminiService.analyzeCourseContent(formData.title, formData.description);
    if (analysis) {
      setFormData(prev => ({ ...prev, description: `${prev.description}\n\nAI Tagline: ${analysis.hook}` }));
    }
    setIsAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCourse: Course = {
      id: `c${Date.now()}`,
      title: formData.title,
      description: formData.description,
      thumbnail: `https://picsum.photos/seed/${formData.title}/1280/720`,
      author: user.name,
      category: formData.category,
      price: parseFloat(formData.price),
      rating: 5.0,
      enrolledCount: 0,
      createdAt: new Date().toISOString(),
      videos: [
        { id: 'v_new', title: 'Course Introduction', description: 'Overview of what students will achieve.', url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '10:00', order: 1 }
      ]
    };
    onAddCourse(newCourse);
    setShowUpload(false);
    setFormData({ title: '', description: '', price: '0', category: 'Software' });
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-2">Creator Studio</h1>
          <p className="text-zinc-500 font-medium text-sm">Welcome back, {user.name}. Your dashboard is ready.</p>
        </div>
        <button 
          onClick={() => setShowUpload(true)}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-8 rounded-[1.2rem] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-blue-500/20"
        >
          <i className="fa-solid fa-plus"></i>
          Publish Content
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[
          { label: 'Revenue', value: '$12.4k', icon: 'fa-wallet', color: 'bg-green-500/10 text-green-500' },
          { label: 'Students', value: '3,842', icon: 'fa-users', color: 'bg-blue-500/10 text-blue-500' },
          { label: 'Rating', value: '4.9/5', icon: 'fa-star', color: 'bg-amber-500/10 text-amber-500' },
          { label: 'Hours', value: '1,240h', icon: 'fa-clock', color: 'bg-purple-500/10 text-purple-500' }
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/5 p-6 rounded-[1.5rem] hover:border-white/10 transition-all">
            <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
              <i className={`fa-solid ${stat.icon} text-sm`}></i>
            </div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-lg font-black text-white uppercase tracking-tighter">Your Courses</h2>
        <div className="h-px flex-1 bg-white/5"></div>
      </div>

      {userCourses.length === 0 ? (
        <div className="bg-white/5 rounded-[2rem] border border-dashed border-white/10 p-12 sm:p-20 text-center">
          <i className="fa-solid fa-clapperboard text-4xl text-zinc-800 mb-6"></i>
          <p className="text-zinc-500 font-bold mb-6">No courses published yet. Share your expertise today.</p>
          <button onClick={() => setShowUpload(true)} className="text-blue-500 font-black hover:underline uppercase text-xs tracking-widest">Start Uploading</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userCourses.map(course => (
            <div key={course.id} className="bg-white/5 rounded-[1.5rem] border border-white/5 overflow-hidden group hover:border-white/10 transition-all">
              <div className="aspect-video relative overflow-hidden">
                <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                   <button className="bg-white text-black w-10 h-10 rounded-full hover:scale-110 transition-transform flex items-center justify-center"><i className="fa-solid fa-pen text-sm"></i></button>
                   <button className="bg-red-500 text-white w-10 h-10 rounded-full hover:scale-110 transition-transform flex items-center justify-center"><i className="fa-solid fa-trash text-sm"></i></button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-black text-white text-[14px] leading-tight mb-4 h-10 line-clamp-2">{course.title}</h3>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">Published</span>
                  </div>
                  <span className="text-white font-black text-base tracking-tighter">${course.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#0a0a0a] w-full max-w-xl rounded-[2rem] border border-white/10 shadow-2xl p-6 sm:p-8 relative">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tighter">New Course</h2>
              <button onClick={() => setShowUpload(false)} className="w-9 h-9 bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  placeholder="Master React..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                  placeholder="Tell students what they will learn..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Price (USD)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none"
                  >
                    <option>Software</option>
                    <option>Design</option>
                    <option>AI Tools</option>
                    <option>Business</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={handleAIAnalyze}
                  disabled={isAnalyzing || !formData.title}
                  className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all disabled:opacity-20 text-blue-500 border border-white/5"
                  title="Optimize Description with AI"
                >
                  <i className={`fa-solid ${isAnalyzing ? 'fa-circle-notch fa-spin' : 'fa-wand-magic-sparkles'} text-xl`}></i>
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-white text-black font-black text-base rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                >
                  Publish Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
