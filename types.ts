
export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: string;
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  author: string;
  category: string;
  price: number; // 0 for free
  rating: number;
  enrolledCount: number;
  videos: Video[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'student' | 'instructor';
  enrolledCourses: string[]; // Course IDs
  ownedCourses: string[]; // Course IDs for instructors
}

export type View = 'home' | 'dashboard' | 'watch' | 'search';
