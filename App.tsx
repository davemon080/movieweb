
import React, { useState, useEffect, useRef } from 'react';
import { View, Course, User } from './types';
import { INITIAL_COURSES, MOCK_USER } from './constants';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import VideoCard from './components/VideoCard';
import Dashboard from './components/Dashboard';
import VideoPlayer from './components/VideoPlayer';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [user, setUser] = useState<User>(MOCK_USER);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const suggestedSearchTitles = [
    'All',
    'How to build React Apps',
    'Advanced Python Tips',
    'Generative AI Tutorials',
    'Mobile UI Design',
    'Machine Learning 101',
    'Business Growth Strategies',
    'Social Media Marketing',
    'Deep Learning',
    'Blockchain Dev'
  ];

  // Scroll listener to hide/show header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down
        setShowHeader(false);
      } else {
        // Scrolling up
        setShowHeader(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredCourses = courses.filter(c => {
    if (!searchQuery || searchQuery === 'All') return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.author.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    if (view === 'home') {
      setSearchQuery('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchTrigger = (term: string) => {
    const finalTerm = term === 'All' ? '' : term;
    setSearchQuery(finalTerm);
    if (currentView !== 'home' && currentView !== 'search') {
      setCurrentView('home');
    }
  };

  const handleCourseClick = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setCurrentView('watch');
    }
  };

  const handleEnroll = (courseId: string) => {
    if (user.enrolledCourses.includes(courseId)) return;
    setUser(prev => ({ ...prev, enrolledCourses: [...prev.enrolledCourses, courseId] }));
  };

  const handleAddCourse = (newCourse: Course) => {
    setCourses([newCourse, ...courses]);
    setUser(prev => ({ ...prev, ownedCourses: [...prev.ownedCourses, newCourse.id] }));
  };

  const activeTerm = searchQuery === '' ? 'All' : searchQuery;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-50 selection:bg-white/20">
      <div className={`fixed top-0 left-0 right-0 z-[100] transition-header ${!showHeader ? 'hide-header' : ''}`}>
        <Navbar 
          user={user} 
          onNavigate={handleNavigate} 
          onSearch={handleSearchTrigger} 
          externalQuery={searchQuery}
        />
      </div>
      
      <div className="flex pt-14">
        <Sidebar 
          isOpen={isSidebarOpen} 
          currentView={currentView} 
          onNavigate={handleNavigate} 
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className={`flex-1 transition-all duration-300 min-h-[calc(100vh-3.5rem)] ${
          isSidebarOpen ? 'xl:ml-64' : 'ml-0'
        }`}>
          
          {(currentView === 'home' || currentView === 'search') && (
            <div className="max-w-[2000px] mx-auto p-4 md:p-6 pb-24 xl:pb-8">
              {/* Suggested Search Titles Header - Sticky and hides with Navbar */}
              <header className={`sticky top-14 bg-[#050505]/95 backdrop-blur-md py-3 z-40 border-b border-white/5 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 transition-header ${!showHeader ? 'hide-header -mt-14' : ''}`}>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {suggestedSearchTitles.map(term => (
                    <button 
                      key={term}
                      onClick={() => handleSearchTrigger(term)}
                      className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        (activeTerm === term)
                        ? 'bg-white border-white text-black shadow-lg shadow-white/5' 
                        : 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </header>

              {filteredCourses.length > 0 ? (
                <div className="video-grid mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {filteredCourses.map(course => (
                    <VideoCard 
                      key={course.id} 
                      course={course} 
                      onClick={handleCourseClick} 
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <i className="fa-solid fa-magnifying-glass text-zinc-700 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-black text-white mb-2">No matching results</h3>
                  <button 
                    onClick={() => handleSearchTrigger('All')}
                    className="mt-4 px-5 py-2 bg-white text-black font-black rounded-lg hover:scale-105 active:scale-95 transition-all text-xs"
                  >
                    Reset Search
                  </button>
                </div>
              )}
            </div>
          )}

          {currentView === 'dashboard' && (
            <div className="max-w-[1400px] mx-auto p-4 sm:p-6 pb-24 xl:pb-8 animate-in fade-in duration-500">
              <Dashboard user={user} courses={courses} onAddCourse={handleAddCourse} />
            </div>
          )}

          {currentView === 'watch' && selectedCourse && (
            <div className="pb-24 xl:pb-8 animate-in fade-in duration-700">
              <VideoPlayer 
                course={selectedCourse} 
                isEnrolled={user.enrolledCourses.includes(selectedCourse.id)}
                onEnroll={handleEnroll}
              />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Nav - Static, doesn't hide on scroll for accessibility */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/10 backdrop-blur-xl border-t border-white/10 flex xl:hidden items-center justify-around px-2 z-[90]">
        <button
          onClick={() => handleNavigate('home')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${
            currentView === 'home' || currentView === 'search' ? 'text-white' : 'text-zinc-400'
          }`}
        >
          <i className="fa-solid fa-house text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-tighter">Home</span>
        </button>

        <button
          onClick={() => {
            handleSearchTrigger('All');
            handleNavigate('search');
          }}
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-zinc-400"
        >
          <i className="fa-solid fa-compass text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-tighter">Explore</span>
        </button>

        <div className="relative flex justify-center w-full h-full -mt-6">
          <button
            onClick={() => handleNavigate('dashboard')}
            className="w-14 h-14 bg-white/15 backdrop-blur-2xl text-white rounded-full flex items-center justify-center shadow-2xl border border-white/20 transition-all active:scale-90"
          >
            <i className="fa-solid fa-plus text-2xl"></i>
          </button>
        </div>

        <button
          onClick={() => handleNavigate('dashboard')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${
            currentView === 'dashboard' ? 'text-white' : 'text-zinc-400'
          }`}
        >
          <i className="fa-solid fa-clapperboard text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-tighter">Studio</span>
        </button>

        <button
          onClick={() => {}} 
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-zinc-400"
        >
          <i className="fa-solid fa-user-circle text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-tighter">Library</span>
        </button>
      </div>
    </div>
  );
};

export default App;
