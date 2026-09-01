export type ScreenId =
  | 'landing'
  | 'bio'
  | 'login'
  | 'register'
  | 'recover'
  | 'home'
  | 'jobs'
  | 'courses'
  | 'profile'
  | 'favorites'
  | 'applications'
  | 'messages'
  | 'mentor'
  | 'support'
  | 'map'
  | 'settings'
  | 'details'
  | 'enrollments'
  | 'privacy'
  | 'course-player'
  | 'terms'
  | 'apply'
  | 'change-password'
  | 'admin'
  | 'completed';

export interface User {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  experience?: string;
  education?: string;
  skills?: string[];
  phone?: string;
  notificationsEnabled?: boolean;
  marketingEmailsEnabled?: boolean;
  tiJobsPushEnabled?: boolean;
  isAdmin?: boolean;
  isBlocked?: boolean;
  blockReason?: string;
  status?: 'active' | 'blocked' | string;
  role?: string;
  cargo?: string;
  favorites?: string[];
  updatedAt?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  category: string;
  description: string;
  requirements: string[];
  salary: string;
  type: string; // "Estágio" | "CLT" | "Jovem Aprendiz" | "Freelancer"
  isRemote: boolean;
  location: string;
  lat?: number;
  lng?: number;
  logo: string; // Lucide icon name or emoji or path
  dateString: string;
  color?: string; // Border color class
  active?: boolean;
}

export interface Course {
  id: string;
  title: string;
  desc: string;
  category: string;
  duration: string;
  instructor: string;
  rating: number;
  level: string; // "Iniciante" | "Intermediário" | "Avançado"
  logo?: string;
  coverImage?: string;
  lessons: { title: string; duration: string; done?: boolean; youtubeId?: string }[];
  completed?: boolean;
  active?: boolean;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: 'Em análise' | 'Entrevista' | 'Aprovado' | 'Reprovado';
  candidateName?: string;
  cvLink?: string;
  cvFileName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  instructor: string;
  enrolledDate: string;
  status: 'Iniciado' | 'Em andamento' | 'Concluído';
  progress: number;
  userName?: string;
}

export interface UserCourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  user_name: string;
  course_title: string;
  completed_at: string;
}
