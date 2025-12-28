
import React from 'react';
import { Course } from '../types';

interface VideoCardProps {
  course: Course;
  onClick: (courseId: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ course, onClick }) => {
  return (
    <div 
      className="group cursor-pointer flex flex-col gap-1.5 mb-2 w-full"
      onClick={() => onClick(course.id)}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-900 ring-1 ring-white/5">
        <img 
          src={course.thumbnail} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all duration-300"></div>
        
        {/* Time Badge - Smaller */}
        <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-md text-[8px] font-black text-white px-1 py-0.5 rounded shadow-lg uppercase tracking-tighter">
          {course.videos.length} Lectures
        </div>
        
        {/* Price/Free Badge - Smaller */}
        <div className="absolute top-1 left-1 flex gap-1">
          <div className="bg-white/90 backdrop-blur-md text-black text-[8px] font-black px-1 py-0.5 rounded shadow-sm uppercase">
            {course.price > 0 ? `$${Math.round(course.price)}` : 'FREE'}
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-0.5">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-7 h-7 rounded-full bg-zinc-800 ring-1 ring-white/10 overflow-hidden">
            <img 
              src={`https://ui-avatars.com/api/?name=${course.author}&background=000&color=fff&bold=true`} 
              alt={course.author} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="text-white font-bold text-[12px] leading-[1.3] line-clamp-2 group-hover:text-zinc-300 transition-colors tracking-tight">
            {course.title}
          </h3>
          <div className="flex flex-col mt-0.5">
            <p className="text-zinc-500 text-[10px] font-medium flex items-center hover:text-white transition-colors">
              {course.author} <i className="fa-solid fa-circle-check text-[8px] text-zinc-500 ml-1"></i>
            </p>
            <div className="flex items-center text-zinc-500 text-[10px] font-medium">
              <span>{course.enrolledCount >= 1000 ? `${(course.enrolledCount / 1000).toFixed(1)}k` : course.enrolledCount} learners</span>
              <span className="mx-1 opacity-30">•</span>
              <div className="flex items-center">
                <i className="fa-solid fa-star text-[8px] mr-1 text-zinc-600"></i>
                <span>{course.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
