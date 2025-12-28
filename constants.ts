
import { Course, User } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Johnson',
  email: 'alex@edustream.ai',
  avatar: 'https://picsum.photos/id/64/100/100',
  role: 'instructor',
  enrolledCourses: ['c1'],
  ownedCourses: ['c2']
};

export const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Advanced React Architecture',
    description: 'Learn how to build scalable React applications with cutting-edge patterns and the Gemini AI API.',
    thumbnail: 'https://picsum.photos/id/1/800/450',
    author: 'Sarah Drasner',
    category: 'Development',
    price: 49.99,
    rating: 4.8,
    enrolledCount: 1240,
    createdAt: '2023-10-01',
    videos: [
      { id: 'v1', title: 'Introduction to Architecture', description: 'Overview of what we will build.', url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '12:05', order: 1 },
      { id: 'v2', title: 'State Management Deep Dive', description: 'Comparing Redux vs Context vs Zustand.', url: 'https://www.w3schools.com/html/movie.mp4', duration: '24:15', order: 2 }
    ]
  },
  {
    id: 'c2',
    title: 'Generative AI for Designers',
    description: 'Master the art of prompt engineering and visual AI tools for modern design workflows.',
    thumbnail: 'https://picsum.photos/id/2/800/450',
    author: 'Alex Johnson',
    category: 'Design',
    price: 0,
    rating: 4.9,
    enrolledCount: 3500,
    createdAt: '2023-11-15',
    videos: [
      { id: 'v3', title: 'The Future of Design', description: 'How AI is changing the landscape.', url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '15:30', order: 1 }
    ]
  },
  {
    id: 'c3',
    title: 'Data Science with Python',
    description: 'A comprehensive guide from basics to advanced machine learning models.',
    thumbnail: 'https://picsum.photos/id/3/800/450',
    author: 'David Silver',
    category: 'Data Science',
    price: 29.99,
    rating: 4.7,
    enrolledCount: 890,
    createdAt: '2024-01-05',
    videos: [
      { id: 'v4', title: 'Python Fundamentals', description: 'Core basics for data science.', url: 'https://www.w3schools.com/html/movie.mp4', duration: '45:00', order: 1 }
    ]
  }
];
