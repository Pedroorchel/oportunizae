import React, { useState, useEffect } from 'react';
import { 
  Users, Briefcase, GraduationCap, ShieldAlert, LogOut, Plus, Trash2, 
  Edit3, CheckCircle, Clock, XCircle, ChevronRight, FileText, Search,
  TrendingUp, MapPin, DollarSign, BookOpen, Layers, BarChart2, Filter, 
  Calendar, Award, ListFilter, Check, ExternalLink, AlertOctagon, Info, Star, Play,
  Mail, Phone, Smartphone, ClipboardCheck, ArrowUpRight, CheckCircle2, UserCheck,
  Menu, X, Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Job, Course, Application, User, Enrollment } from '../types';
import { mockJobs, mockCourses, saveAdminJobs, saveAdminCourses } from '../data';
import { supabase } from '../lib/supabaseClient';

interface AdminPanelScreenProps {
  user: User;
  onLogout: () => void;
}

export default function AdminPanelScreen({ user, onLogout }: AdminPanelScreenProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'courses' | 'applications' | 'enrollments' | 'accounts'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Real dynamic in-memory states
  const [jobsList, setJobsList] = useState<Job[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [enrollmentsList, setEnrollmentsList] = useState<Enrollment[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  
  // Category selections
  const [selectedJobCategory, setSelectedJobCategory] = useState<string>('Todos');
  const [selectedCourseCategory, setSelectedCourseCategory] = useState<string>('Todos');

  // Loading/feedback indicators
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search queries
  const [jobsSearch, setJobsSearch] = useState('');
  const [coursesSearch, setCoursesSearch] = useState('');
  const [appSearch, setAppSearch] = useState('');

  // Spotlights and inline previews
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [previewingCourseLessons, setPreviewingCourseLessons] = useState<Course | null>(null);

  // Modal / forms triggers
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    category: 'Saúde',
    description: '',
    requirements: '',
    salary: '',
    type: 'CLT',
    isRemote: false,
    location: '',
    lat: '',
    lng: ''
  });

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    desc: '',
    category: 'Sistemas',
    duration: '',
    instructor: '',
    rating: '5.0',
    level: 'Iniciante',
    coverImage: '',
    lessonsInput: '',
    active: true
  });

  // Load initial jobs/courses from mock files or localStorage
  useEffect(() => {
    setJobsList([...mockJobs]);
    setCoursesList([...mockCourses]);

    // Also listen to events in case live fetch finishes after admin mounts
    const handleJobsChanged = () => setJobsList([...mockJobs]);
    const handleCoursesChanged = () => setCoursesList([...mockCourses]);

    window.addEventListener('oportuniza-jobs-changed', handleJobsChanged);
    window.addEventListener('oportuniza-courses-changed', handleCoursesChanged);

    return () => {
      window.removeEventListener('oportuniza-jobs-changed', handleJobsChanged);
      window.removeEventListener('oportuniza-courses-changed', handleCoursesChanged);
    };
  }, []);

  // Fetch all applications across all users from Supabase for real administration
  const fetchAllApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('applied_date', { ascending: false });

      if (error) throw error;
      if (data) {
        const mapped: Application[] = data.map(item => {
          let cName = item.candidate_name || item.user_id?.substring(0, 8) || 'Candidato';
          let cEmail = '';
          let cPhone = '';
          if (cName.includes('|')) {
            const parts = cName.split('|');
            cName = parts[0].trim();
            if (parts.length > 1) cEmail = parts[1].trim();
            if (parts.length > 2) cPhone = parts[2].trim();
          }

          return {
            id: item.id,
            jobId: item.job_id,
            jobTitle: item.job_title,
            company: item.company,
            appliedDate: item.created_at || item.applied_date,
            status: item.status,
            candidateName: cName,
            cvLink: item.cv_link,
            cvFileName: item.cv_file_name,
            candidateEmail: cEmail || undefined,
            candidatePhone: cPhone || undefined
          };
        });
        setApplications(mapped);
      }
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setErrorMsg('Erro ao buscar candidaturas do banco em tempo real.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEnrollments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .order('enrolled_date', { ascending: false });

      if (error) throw error;
      if (data) {
        const mapped: Enrollment[] = data.map(item => ({
          id: item.id,
          courseId: item.course_id,
          courseTitle: item.course_title,
          instructor: item.instructor,
          enrolledDate: item.enrolled_date || item.created_at,
          status: item.status,
          progress: item.progress || 0,
          userName: item.user_name || item.user_id?.substring(0, 8) || 'Aluno'
        }));
        setEnrollmentsList(mapped);
      }
    } catch (err: any) {
      console.error('Error fetching enrollments:', err);
      setErrorMsg('Erro ao buscar inscrições de cursos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) {
        console.error('Supabase error fetching users:', error);
        setErrorMsg(`Erro Supabase: ${error.message} - ${error.details || ''}`);
        throw error;
      }
      console.log('Fetched users raw data:', data);
      if (data) {
        const usersWithAdmin = (data as any[]).map(user => ({
          ...user,
          isAdmin: Boolean(user.is_admin || user.isAdmin || user.email === 'pedroorchel12@gmail.com')
        }));
        setUserList(usersWithAdmin as User[]);
        if (usersWithAdmin.length === 0) {
          setSuccessMsg("Nenhum usuário encontrado na base de dados.");
        }
      } else {
        setSuccessMsg("Nenhum dado retornado.");
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setErrorMsg(`Erro ao buscar usuários: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllApplications();
    fetchAllEnrollments();
    fetchAllUsers();
    
    const channel = supabase
      .channel('public:applications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, (payload) => {
        console.log('Realtime change received!', payload);
        fetchAllApplications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update application status directly in Supabase
  const handleUpdateAppStatus = async (appId: string, nextStatus: 'Em análise' | 'Entrevista' | 'Aprovado' | 'Reprovado') => {
    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      const { error } = await supabase
        .from('applications')
        .update({ status: nextStatus })
        .eq('id', appId);

      if (error) throw error;
      
      setSuccessMsg(`Status atualizado com sucesso para "${nextStatus}"!`);
      
      // Update local state and the selected spotlight if applicable
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: nextStatus } : app));
      if (selectedApplication && selectedApplication.id === appId) {
        setSelectedApplication(prev => prev ? { ...prev, status: nextStatus } : null);
      }
      
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg('Falha ao atualizar status na nuvem.');
    }
  };

  // JOB CRUD Handlers
  const handleOpenAddJobParams = () => {
    setEditingJob(null);
    setJobForm({
      title: '',
      company: '',
      category: 'Saúde',
      description: 'Responsável pelas funções de suporte ao setor do estabelecimento municipal, assegurando pontualidade e dedicação.',
      requirements: 'Ensino médio completo\nResidir em Araucária ou região metropolitana\nBoa comunicação interpessoal\nDisponibilidade de horários flexíveis',
      salary: 'R$ 1.800,00',
      type: 'CLT',
      isRemote: false,
      location: 'Araucária - PR',
      lat: '-25.5920',
      lng: '-49.4140'
    });
    setShowJobModal(true);
  };

  const handleOpenEditJob = (job: Job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      company: job.company,
      category: job.category,
      description: job.description,
      requirements: job.requirements.join('\n'),
      salary: job.salary,
      type: job.type,
      isRemote: job.isRemote,
      location: job.location,
      lat: job.lat?.toString() || '',
      lng: job.lng?.toString() || ''
    });
    setShowJobModal(true);
  };

  const handleDeleteJob = (id: string) => {
    if (window.confirm('Tem certeza de que deseja remover esta vaga cadastrada? Ela deixará de aparecer para os alunos.')) {
      const filtered = jobsList.filter(j => j.id !== id);
      setJobsList(filtered);
      saveAdminJobs(filtered);
      setSuccessMsg('Vaga removida com sucesso!');
      setTimeout(() => setSuccessMsg(null), 3500);
    }
  };

  const handleSaveJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.company) {
      alert('Por favor, preencha o título e a empresa.');
      return;
    }

    const jobData: Job = {
      id: editingJob ? editingJob.id : `job-${Date.now()}`,
      title: jobForm.title,
      company: jobForm.company,
      category: jobForm.category,
      description: jobForm.description,
      requirements: (jobForm.requirements || '').split('\n').filter(r => r.trim() !== ''),
      salary: jobForm.salary,
      type: jobForm.type,
      isRemote: jobForm.isRemote,
      location: jobForm.location,
      lat: jobForm.lat ? parseFloat(jobForm.lat) : undefined,
      lng: jobForm.lng ? parseFloat(jobForm.lng) : undefined,
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(jobForm.company)}&background=52A8C7&color=fff&size=128&bold=true`,
      dateString: editingJob ? editingJob.dateString : 'Novo!',
      color: 'border-l-[#52A8C7]'
    };

    let updatedList: Job[];
    if (editingJob) {
      updatedList = jobsList.map(j => j.id === editingJob.id ? jobData : j);
      setSuccessMsg('Vaga atualizada com sucesso!');
    } else {
      updatedList = [jobData, ...jobsList];
      setSuccessMsg('Nova vaga cadastrada no Feed com sucesso!');
    }

    setJobsList(updatedList);
    saveAdminJobs(updatedList);
    setShowJobModal(false);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // COURSE CRUD Handlers
  const handleOpenAddCourseParams = () => {
    setEditingCourse(null);
    setCourseForm({
      title: '',
      desc: '',
      category: 'Atendimento',
      duration: '4 horas',
      instructor: 'Instrutor Oportuniza',
      rating: '5.0',
      level: 'Iniciante',
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      lessonsInput: 'Boas-vindas ao Curso;10:00;I2taMQ3j6qo\nFundamentos Teóricos;15:30;OHM4CJbea54\nAtendimento e Prática Assistencial;25:00;I2taMQ3j6qo',
      active: true
    });
    setShowCourseModal(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    const lessonsStr = course.lessons.map(l => `${l.title};${l.duration};${l.youtubeId || 'I2taMQ3j6qo'}`).join('\n');
    setCourseForm({
      title: course.title,
      desc: course.desc,
      category: course.category,
      duration: course.duration,
      instructor: course.instructor,
      rating: course.rating.toString(),
      level: course.level,
      coverImage: course.coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      lessonsInput: lessonsStr,
      active: course.active !== false
    });
    setShowCourseModal(true);
  };

  const handleDeleteCourse = (id: string) => {
    const course = coursesList.find(c => c.id === id);
    if (!course) return;
    const isCurrentlyActive = course.active !== false;
    
    if (isCurrentlyActive) {
      if (window.confirm(`Deseja desativar o curso de capacitação "${course.title}"? Ele ficará oculto para os alunos.`)) {
        handleToggleCourseActive(id);
      }
    } else {
      handleToggleCourseActive(id);
    }
  };

  const handleToggleCourseActive = (id: string) => {
    const updatedList = coursesList.map(c => {
      if (c.id === id) {
        const isCurrentlyActive = c.active !== false;
        return { ...c, active: !isCurrentlyActive };
      }
      return c;
    });
    setCoursesList(updatedList);
    saveAdminCourses(updatedList);
    const targetCourse = updatedList.find(c => c.id === id);
    const statusMsg = targetCourse?.active !== false ? 'ativado' : 'desativado';
    setSuccessMsg(`Curso "${targetCourse?.title}" ${statusMsg} com sucesso!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSaveCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title) {
      alert('Por favor, insira um título para o curso.');
      return;
    }

    // Parse lessons
    const parsedLessons = (courseForm.lessonsInput || '').split('\n').filter(line => line.trim() !== '').map(line => {
      const parts = line.split(';');
      return {
        title: parts[0] || 'Aula Teórica',
        duration: parts[1] || '10:00',
        done: false,
        youtubeId: parts[2] || 'I2taMQ3j6qo'
      };
    });

    const courseData: Course = {
      id: editingCourse ? editingCourse.id : `course-${Date.now()}`,
      title: courseForm.title,
      desc: courseForm.desc,
      category: courseForm.category,
      duration: courseForm.duration,
      instructor: courseForm.instructor,
      rating: parseFloat(courseForm.rating) || 5.0,
      level: courseForm.level,
      logo: 'BookOpen',
      coverImage: courseForm.coverImage || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80`,
      lessons: parsedLessons,
      completed: false,
      active: courseForm.active
    };

    let updatedList: Course[];
    if (editingCourse) {
      updatedList = coursesList.map(c => c.id === editingCourse.id ? courseData : c);
      setSuccessMsg('Curso de capacitação atualizado com sucesso!');
    } else {
      updatedList = [courseData, ...coursesList];
      setSuccessMsg('Novo curso adicionado com sucesso!');
    }

    setCoursesList(updatedList);
    saveAdminCourses(updatedList);
    setShowCourseModal(false);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Metrics calculators
  const approvedCount = applications.filter(a => a.status === 'Aprovado').length;
  const analysisCount = applications.filter(a => a.status === 'Em análise').length;
  const interviewCount = applications.filter(a => a.status === 'Entrevista').length;
  const rejectedCount = applications.filter(a => a.status === 'Reprovado').length;

  // Job specific metrics
  const cltCount = jobsList.filter(j => j.type === 'CLT' || j.type === 'Jovem Aprendiz').length;
  const internshipCount = jobsList.filter(j => j.type === 'Estágio').length;
  const remoteJobsCount = jobsList.filter(j => j.isRemote).length;

  // Helper date string
  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('pt-BR', options);
  };

  // Safe date formatter for Brasília time
  const formatBrasiliaTime = (dateString: string) => {
    try {
      // Check if it's already in DD/MM/YYYY format and missing timestamp (legacy)
      if (dateString.includes('/') && dateString.length <= 10) {
        return dateString; // Just return old format
      }
      // If it's the recent ISO format or standard date
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleString('pt-BR', { 
        timeZone: 'America/Sao_Paulo',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Get WhatsApp redirect link
  const getCandidateWhatsAppLink = (candidateName: string, jobTitle: string, candidatePhone?: string) => {
    const defaultPhone = '5541996502358';
    let p = candidatePhone ? candidatePhone.replace(/\D/g, '') : defaultPhone;
    if (candidatePhone && p.length >= 10 && p.length <= 11) p = '55' + p;
    const textMsg = `Olá, ${candidateName}! Aqui é do setor administrativo da Oportuniza Araucária. Entramos em contato para conversar sobre a sua candidatura para a vaga de *${jobTitle}*.`;
    return `https://api.whatsapp.com/send?phone=${p}&text=${encodeURIComponent(textMsg)}`;
  };

  // Categorization collections
  const jobCategories = ['Todos', 'Saúde', 'Administração', 'Serviços Gerais', 'Alimentação', 'Comércio', 'Logística', 'Indústria', 'Estágios', 'Produtividade'];
  const courseCategories = ['Todos', 'Produtividade', 'Sistemas', 'Atendimento', 'Comércio', 'Saúde'];

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-[#52A8C7] selection:text-white">
      
      {/* 1. Header component - Pristine dashboard frame */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 py-3 md:py-4.5 px-4 md:px-6 flex justify-between items-center z-40 shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Mobile hamburger menu button */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 bg-slate-800 hover:bg-slate-700 hover:text-[#52A8C7] border border-slate-700/60 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
            title="Abrir Menu Lateral"
          >
            <Menu className="w-5 h-5 text-[#52A8C7]" />
          </button>

          <div className="p-2.5 md:p-3 bg-gradient-to-tr from-[#52A8C7] to-[#4EA8C7] rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-[#52A8C7]/20 transition-transform hover:rotate-6 hidden xs:flex">
            <Users className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-slate-950 stroke-[2.5px]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="text-[8px] md:text-[9px] font-black bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 px-1.5 md:p-2 py-0.5 rounded md:rounded-md tracking-wider">
                ADMIN
              </span>
              <h1 className="text-sm md:text-lg font-black tracking-tight text-white flex items-center gap-1">
                Oportuniza <span className="text-[#52A8C7] font-semibold text-xs md:text-sm">Control</span>
              </h1>
            </div>
            <p className="text-[9px] md:text-[11px] text-slate-400 font-medium">Painel Unificado de Empregabilidade Municipal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden lg:flex flex-col text-right pr-4 border-r border-slate-800">
            <span className="text-xs font-bold text-slate-200">{user.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">{user.email}</span>
          </div>
          
          <button 
            onClick={onLogout}
            id="admin-logout-btn"
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 border border-slate-705/60 hover:border-red-500/20 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair do Painel</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative overflow-hidden">
        
        {/* Navigation Sidebar (Desktop only, statically placed on the left side) */}
        <aside className="hidden md:flex w-64 bg-slate-900/40 border-r border-slate-800/80 p-5 shrink-0 flex-col gap-6 justify-between overflow-y-auto custom-scroll">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[9px] font-black tracking-widest text-[#52A8C7] uppercase px-1">
                Menu de Navegação
              </span>
              
              <div className="space-y-1">
                <button
                  id="tab-dashboard"
                  onClick={() => {
                    setActiveTab('dashboard');
                    setSelectedApplication(null);
                    setPreviewingCourseLessons(null);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === 'dashboard' 
                    ? 'bg-[#52A8C7] text-slate-950 shadow-lg shadow-[#52A8C7]/15 translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BarChart2 className="w-4 h-4" />
                    <span>Indicadores Gerais</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeTab === 'dashboard' ? 'rotate-90 opacity-80' : 'opacity-40'}`} />
                </button>

                <button
                  id="tab-jobs"
                  onClick={() => {
                    setActiveTab('jobs');
                    setSelectedApplication(null);
                    setPreviewingCourseLessons(null);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === 'jobs' 
                    ? 'bg-[#52A8C7] text-slate-950 shadow-lg shadow-[#52A8C7]/15 translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4" />
                    <span>Gerenciar Vagas</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${activeTab === 'jobs' ? 'bg-slate-900 text-[#52A8C7]' : 'bg-slate-800 text-slate-400'}`}>
                    {jobsList.length}
                  </span>
                </button>

                <button
                  id="tab-courses"
                  onClick={() => {
                    setActiveTab('courses');
                    setSelectedApplication(null);
                    setPreviewingCourseLessons(null);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === 'courses' 
                    ? 'bg-[#52A8C7] text-slate-950 shadow-lg shadow-[#52A8C7]/15 translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-4 h-4" />
                    <span>Cursos Disponíveis</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${activeTab === 'courses' ? 'bg-slate-900 text-[#52A8C7]' : 'bg-slate-800 text-slate-400'}`}>
                    {coursesList.length}
                  </span>
                </button>

                <button
                  id="tab-applications"
                  onClick={() => {
                    setActiveTab('applications');
                    setSelectedApplication(null);
                    setPreviewingCourseLessons(null);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === 'applications' 
                    ? 'bg-[#52A8C7] text-slate-950 shadow-lg shadow-[#52A8C7]/15 translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4" />
                    <span>Candidaturas</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${activeTab === 'applications' ? 'bg-slate-950 text-[#52A8C7]' : 'bg-slate-800 text-slate-400'}`}>
                    {applications.length}
                  </span>
                </button>

                <button
                  id="tab-enrollments"
                  onClick={() => {
                    setActiveTab('enrollments');
                    setSelectedApplication(null);
                    setPreviewingCourseLessons(null);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === 'enrollments' 
                    ? 'bg-[#52A8C7] text-slate-950 shadow-lg shadow-[#52A8C7]/15 translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-4 h-4" />
                    <span>Inscrições</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${activeTab === 'enrollments' ? 'bg-slate-950 text-[#52A8C7]' : 'bg-slate-800 text-slate-400'}`}>
                    {enrollmentsList.length}
                  </span>
                </button>

                <button
                  id="tab-accounts"
                  onClick={() => {
                    setActiveTab('accounts');
                    setSelectedApplication(null);
                    setPreviewingCourseLessons(null);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === 'accounts' 
                    ? 'bg-[#52A8C7] text-slate-950 shadow-lg shadow-[#52A8C7]/15 translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4" />
                    <span>Contas Cadastradas</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${activeTab === 'accounts' ? 'bg-slate-950 text-[#52A8C7]' : 'bg-slate-800 text-slate-400'}`}>
                    {userList.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="border-t border-slate-800/85 pt-5 space-y-2">
              <span className="text-[9px] font-black tracking-widest text-[#52A8C7] uppercase px-1 block mb-1">
                Ações Administrativas
              </span>
              <button 
                onClick={handleOpenAddJobParams}
                className="w-full flex items-center justify-between bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold py-2.5 px-3.5 rounded-xl text-xs transition-all cursor-pointer active:scale-[0.97]"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-[#52A8C7]" />
                  <span>Publicar Nova Vaga</span>
                </div>
              </button>
              <button 
                onClick={handleOpenAddCourseParams}
                className="w-full flex items-center justify-between bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold py-2.5 px-3.5 rounded-xl text-xs transition-all cursor-pointer active:scale-[0.97]"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-[#52A8C7]" />
                  <span>Cadastrar Curso</span>
                </div>
              </button>
            </div>
          </div>

          {/* Connected Cloud DB indicators */}
          <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/80 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-12 h-12 bg-[#52A8C7]/5 rounded-bl-full transition-transform group-hover:scale-110" />
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <h4 className="text-[11px] font-extrabold text-slate-300">
                Sincronização Ativa
              </h4>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal font-medium">
              Acompanhamento de candidaturas municipais em tempo real integradas com o Supabase.
            </p>
          </div>
        </aside>

        {/* Mobile slide-out drawer inside AnimatePresence overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              />
              {/* Sliding sheet */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="relative w-72 max-w-[80vw] h-full bg-slate-900 border-r border-slate-800/80 p-5 flex flex-col gap-6 justify-between overflow-y-auto custom-scroll z-51 text-left"
              >
                <div className="space-y-6">
                  {/* Drawer header */}
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#52A8C7]" />
                      <span className="text-[10px] font-black tracking-widest text-[#52A8C7] uppercase">
                        Navegação
                      </span>
                    </div>
                    <button 
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1 px-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px] font-bold"
                    >
                      Fechar ✕
                    </button>
                  </div>

                  {/* Sidebar Navigation */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black tracking-widest text-[#52A8C7] uppercase px-1">
                      Menu de Navegação
                    </span>
                    
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setActiveTab('dashboard');
                          setSelectedApplication(null);
                          setPreviewingCourseLessons(null);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all duration-200 cursor-pointer ${
                          activeTab === 'dashboard' 
                          ? 'bg-[#52A8C7] text-slate-950 shadow-lg shadow-[#52A8C7]/15 translate-x-1' 
                          : 'text-slate-400 hover:bg-slate-950 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <BarChart2 className="w-4 h-4" />
                          <span>Indicadores Gerais</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeTab === 'dashboard' ? 'rotate-90 opacity-80' : 'opacity-40'}`} />
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('jobs');
                          setSelectedApplication(null);
                          setPreviewingCourseLessons(null);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all duration-200 cursor-pointer ${
                          activeTab === 'jobs' 
                          ? 'bg-[#52A8C7] text-slate-950 shadow-lg shadow-[#52A8C7]/15 translate-x-1' 
                          : 'text-slate-400 hover:bg-slate-950 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-4 h-4" />
                          <span>Gerenciar Vagas</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${activeTab === 'jobs' ? 'bg-slate-800 text-[#52A8C7]' : 'bg-slate-800 text-slate-400'}`}>
                          {jobsList.length}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('courses');
                          setSelectedApplication(null);
                          setPreviewingCourseLessons(null);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all duration-200 cursor-pointer ${
                          activeTab === 'courses' 
                          ? 'bg-[#52A8C7] text-slate-950 shadow-lg shadow-[#52A8C7]/15 translate-x-1' 
                          : 'text-slate-400 hover:bg-slate-950 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <GraduationCap className="w-4 h-4" />
                          <span>Cursos Disponíveis</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${activeTab === 'courses' ? 'bg-slate-850 text-[#52A8C7]' : 'bg-slate-800 text-slate-400'}`}>
                          {coursesList.length}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('applications');
                          setSelectedApplication(null);
                          setPreviewingCourseLessons(null);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all duration-200 cursor-pointer ${
                          activeTab === 'applications' 
                          ? 'bg-[#52A8C7] text-slate-950 shadow-lg shadow-[#52A8C7]/15 translate-x-1' 
                          : 'text-slate-400 hover:bg-slate-950 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4" />
                          <span>Candidaturas</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${activeTab === 'applications' ? 'bg-slate-855 text-[#52A8C7]' : 'bg-slate-800 text-slate-400'}`}>
                          {applications.length}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('enrollments');
                          setSelectedApplication(null);
                          setPreviewingCourseLessons(null);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all duration-200 cursor-pointer ${
                          activeTab === 'enrollments' 
                          ? 'bg-[#52A8C7] text-slate-950 shadow-lg shadow-[#52A8C7]/15 translate-x-1' 
                          : 'text-slate-400 hover:bg-slate-950 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <GraduationCap className="w-4 h-4" />
                          <span>Inscrições</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${activeTab === 'enrollments' ? 'bg-slate-955 text-[#52A8C7]' : 'bg-slate-800 text-slate-400'}`}>
                          {enrollmentsList.length}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('accounts');
                          setSelectedApplication(null);
                          setPreviewingCourseLessons(null);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all duration-200 cursor-pointer ${
                          activeTab === 'accounts' 
                          ? 'bg-[#52A8C7] text-slate-950 shadow-lg shadow-[#52A8C7]/15 translate-x-1' 
                          : 'text-slate-400 hover:bg-slate-950 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4" />
                          <span>Contas Cadastradas</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${activeTab === 'accounts' ? 'bg-slate-855 text-[#52A8C7]' : 'bg-slate-800 text-slate-400'}`}>
                          {userList.length}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Actions Drawer */}
                  <div className="border-t border-slate-800/85 pt-4 space-y-2">
                    <span className="text-[9px] font-black tracking-widest text-[#52A8C7] uppercase px-1 block mb-1">
                      Ações Administrativas
                    </span>
                    <button 
                      onClick={() => {
                        handleOpenAddJobParams();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 font-bold py-2 px-3 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="w-3.5 h-3.5 text-[#52A8C7]" />
                        <span>Publicar Nova Vaga</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        handleOpenAddCourseParams();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 font-bold py-2 px-3 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="w-3.5 h-3.5 text-[#52A8C7]" />
                        <span>Cadastrar Curso</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Cloud DB indicator */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 relative overflow-hidden">
                  <div className="flex items-center gap-1.5 mb-1 text-xs">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span className="font-extrabold text-slate-300">Sincronização de Dados</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Conectado ao Supabase municipal.
                  </p>
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* Display Screens - Each option is separated and tidy */}
        <main className="flex-1 overflow-y-auto custom-scroll p-6 lg:p-8 flex flex-col gap-6 bg-slate-950">
          
          {/* Notifications Feedback */}
          <AnimatePresence>
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xl shadow-emerald-500/5 select-none"
              >
                <CheckCircle className="w-4.5 h-4.5 shrink-0 stroke-[2.5px]" />
                <span>{successMsg}</span>
              </motion.div>
            )}
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xl shadow-red-500/5 select-none"
              >
                <ShieldAlert className="w-4.5 h-4.5 shrink-0 stroke-[2.5px]" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SCREEN 1: INDICATORS DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Profile Welcome Header */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 bg-gradient-to-r from-slate-900 to-slate-900/40 border border-slate-800 rounded-3xl gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#52A8C7]/5 rounded-bl-full" />
                <div>
                  <h2 className="text-xl lg:text-2xl font-black text-white tracking-tight">
                    Bem-vindo de volta, {(user?.name || '').split(' ')[0] || 'Administrador'}! 👋
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Sua atuação ajuda os jovens de Araucária a se colocarem profissionalmente e se capacitarem.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2.5 border border-slate-800 rounded-2xl text-slate-300 font-semibold text-xs">
                  <Calendar className="w-4 h-4 text-[#52A8C7]" />
                  <span>{getFormattedDate()}</span>
                </div>
              </div>

              {/* Bento Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Stat 1: Jobs published */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden group hover:border-[#52A8C7]/50 transition-all duration-300">
                  <span className="text-[9px] font-black text-[#52A8C7] uppercase tracking-widest block">
                    Vagas Disponíveis
                  </span>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-white tracking-tight">{jobsList.length}</span>
                    <Briefcase className="w-5.5 h-5.5 text-slate-500 group-hover:text-[#52A8C7] transition-colors" />
                  </div>
                  <div className="mt-3.5 flex items-center gap-1 text-[10px] text-slate-400">
                    <span className="text-slate-200 font-semibold font-mono">{cltCount}</span> CLT ou Aprendiz • <span className="text-slate-200 font-semibold font-mono">{internshipCount}</span> Estágio
                  </div>
                </div>

                {/* Stat 2: Active Courses */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden group hover:border-violet-500/50 transition-all duration-300">
                  <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest block">
                    Cursos Livres
                  </span>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-white tracking-tight">{coursesList.length}</span>
                    <GraduationCap className="w-5.5 h-5.5 text-slate-500 group-hover:text-violet-400 transition-colors" />
                  </div>
                  <div className="mt-3.5 text-[10px] text-slate-400">
                    Capacitação EAD gratuita cadastrada
                  </div>
                </div>

                {/* Stat 3: Total Submissions */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden group hover:border-amber-500/50 transition-all duration-300">
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">
                    Candidatos Totais
                  </span>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-white tracking-tight">{applications.length}</span>
                    <FileText className="w-5.5 h-5.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <div className="mt-3.5 text-[10px] text-slate-450 flex items-center gap-1 text-amber-400/80">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Integrado ao WhatsApp</span>
                  </div>
                </div>

                {/* Stat 5: Enrollments */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden group hover:border-[#52A8C7]/50 transition-all duration-300">
                  <span className="text-[9px] font-black text-[#52A8C7] uppercase tracking-widest block">
                    Matrículas em Cursos
                  </span>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-white tracking-tight">{enrollmentsList.length}</span>
                    <GraduationCap className="w-5.5 h-5.5 text-slate-500 group-hover:text-[#52A8C7] transition-colors" />
                  </div>
                  <div className="mt-3.5 text-[10px] text-slate-400">
                    Alunos ativos em trilhas de aprendizado
                  </div>
                </div>

                {/* Stat 4: Fast selections */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300">
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block">
                    Aprovados / Convocados
                  </span>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-emerald-400 tracking-tight">{(approvedCount + interviewCount)}</span>
                    <UserCheck className="w-5.5 h-5.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div className="mt-3.5 text-[10px] text-slate-400">
                    <span className="text-emerald-400 font-bold font-mono">{approvedCount}</span> contratados e <span className="text-blue-400 font-bold font-mono">{interviewCount}</span> em entrevista
                  </div>
                </div>

              </div>

              {/* Status workflow chart and info blocks */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Proportions widget */}
                <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-5">
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">Pipeline de Sucesso Seletivo</h3>
                      <p className="text-[10px] text-slate-400">Distribuição percentual dos candidatos em Araucária-PR.</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#52A8C7] bg-[#52A8C7]/10 px-2.5 py-1 rounded-full">{applications.length} Inscritos</span>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Em análise */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-amber-400">Em Análise Curricular</span>
                        <span className="text-slate-305 font-black">{analysisCount} ({applications.length ? Math.round((analysisCount / applications.length) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800/60">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${applications.length ? (analysisCount / applications.length) * 105 : 0}%` }}
                          className="bg-amber-400 h-full rounded-full"
                        />
                      </div>
                    </div>

                    {/* Entrevista */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-blue-400">Agendados para Entrevista</span>
                        <span className="text-slate-305 font-black">{interviewCount} ({applications.length ? Math.round((interviewCount / applications.length) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800/60">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${applications.length ? (interviewCount / applications.length) * 105 : 0}%` }}
                          className="bg-blue-400 h-full rounded-full"
                        />
                      </div>
                    </div>

                    {/* Aprovado */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-emerald-400 font-semibold">Admitidos & Contratados</span>
                        <span className="text-slate-305 font-black">{approvedCount} ({applications.length ? Math.round((approvedCount / applications.length) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800/60">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${applications.length ? (approvedCount / applications.length) * 105 : 0}%` }}
                          className="bg-emerald-400 h-full rounded-full"
                        />
                      </div>
                    </div>

                    {/* Reprovado */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-red-400">Reprovados ou Desqualificados</span>
                        <span className="text-slate-305 font-black">{rejectedCount} ({applications.length ? Math.round((rejectedCount / applications.length) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800/60">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${applications.length ? (rejectedCount / applications.length) * 105 : 0}%` }}
                          className="bg-red-500/80 h-full rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Info card */}
                <div className="p-6 bg-[#52A8C7]/5 border border-[#52A8C7]/15 rounded-3xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-11 h-11 bg-[#52A8C7]/10 rounded-2xl flex items-center justify-center text-[#52A8C7]">
                      <Info className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">
                        Gestão Descentralizada
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed mt-2">
                        Como administrador, você pode interagir com os candidatos do portal enviando mensagens diretas, alterando o status de suas candidaturas de análise no Supabase, e mantendo o feed de incentivos e capacitações municipais sempre preenchido.
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block mb-1.5 font-mono">Araucária Control System v2.1</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                      <span className="text-[10px] font-bold text-emerald-400">Serviços municipais online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Applications table excerpt */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
                  <div className="flex justify-between items-center mb-5">
                    <div className="space-y-0.5">
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">Últimas Candidaturas</h3>
                      <p className="text-[10px] text-slate-400">Estudantes cadastrados em processos seletivos locais.</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('applications')}
                      className="text-[10px] font-bold text-[#52A8C7] hover:underline flex items-center gap-1 transition-all hover:gap-1.5 cursor-pointer"
                    >
                      <span>Ver Todas</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {loading ? (
                    <p className="text-xs text-slate-400 text-center py-6">Carregando...</p>
                  ) : applications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">Nenhuma candidatura registrada.</p>
                  ) : (
                    <div className="divide-y divide-slate-800/80">
                      {applications.slice(0, 4).map((app) => (
                        <div key={app.id} className="py-3 flex justify-between items-center group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 font-black text-[10px] flex items-center justify-center text-[#52A8C7] uppercase">
                              {app.candidateName?.substring(0, 1) || 'C'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-slate-200 truncate group-hover:text-[#52A8C7] transition-colors">{app.jobTitle}</p>
                              <p className="text-[9px] text-slate-450 mt-0.5 truncate">
                                {app.candidateName}
                              </p>
                            </div>
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-tight px-2 py-0.5 rounded-md ${
                            app.status === 'Aprovado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            app.status === 'Entrevista' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Enrollment Excerpt */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
                  <div className="flex justify-between items-center mb-5">
                    <div className="space-y-0.5">
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">Últimas Inscrições</h3>
                      <p className="text-[10px] text-slate-400">Jovens matriculados em cursos de capacitação.</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('enrollments')}
                      className="text-[10px] font-bold text-[#52A8C7] hover:underline flex items-center gap-1 transition-all hover:gap-1.5 cursor-pointer"
                    >
                      <span>Ver Todas</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {loading ? (
                    <p className="text-xs text-slate-400 text-center py-6">Carregando...</p>
                  ) : enrollmentsList.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">Nenhuma matrícula registrada.</p>
                  ) : (
                    <div className="divide-y divide-slate-800/80">
                      {enrollmentsList.slice(0, 4).map((enr) => (
                        <div key={enr.id} className="py-3 flex justify-between items-center group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 font-black text-[10px] flex items-center justify-center text-violet-400 uppercase">
                              {enr.userName?.substring(0, 1) || 'A'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-slate-200 truncate group-hover:text-violet-400 transition-colors">{enr.courseTitle}</p>
                              <p className="text-[9px] text-slate-450 mt-0.5 truncate">
                                Aluno(a): <span className="text-slate-300 font-bold">{enr.userName}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[8px] font-mono font-bold text-slate-500">{enr.enrolledDate}</span>
                            <span className="text-[8px] text-[#52A8C7] font-bold uppercase">{enr.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN 2: JOBS MANAGEMENT */}
          {activeTab === 'jobs' && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Header section */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Painel de Mudança de Vagas</h2>
                  <p className="text-xs text-slate-400 mt-1">Gerencie os postos de estágio e admissões em tempo real voltados ao ambiente jovem.</p>
                </div>
                <button 
                  onClick={handleOpenAddJobParams}
                  className="bg-[#52A8C7] hover:bg-[#3d91ad] text-slate-950 font-black py-3.5 px-5 rounded-2xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#52A8C7]/15 active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3px]" />
                  <span>Cadastrar Nova Vaga</span>
                </button>
              </div>

              {/* Jobs quick indicator row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4.5 bg-slate-900 border border-slate-800 rounded-3xl text-xs font-semibold">
                <div className="p-3 bg-slate-950/50 rounded-2xl border border-slate-850">
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Total Vagas</p>
                  <p className="text-xl font-bold text-white mt-1">{jobsList.length}</p>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-2xl border border-slate-850">
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Regime CLT</p>
                  <p className="text-xl font-bold text-[#52A8C7] mt-1">{jobsList.filter(j=>j.type==='CLT').length}</p>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-2xl border border-slate-850">
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Estágio / Aprendiz</p>
                  <p className="text-xl font-bold text-amber-400 mt-1">{jobsList.filter(j=>j.type==='Estágio' || j.type==='Jovem Aprendiz').length}</p>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-2xl border border-slate-850">
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Permite Remoto</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{remoteJobsCount}</p>
                </div>
              </div>

              {/* Selection query filters */}
              <div className="space-y-3.5 p-5 bg-slate-900 border border-slate-800 rounded-3xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Pesquisar vaga por cargo, empresa, localização ou tags de seleção..."
                    value={jobsSearch}
                    onChange={(e) => setJobsSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-[#52A8C7] rounded-xl text-xs focus:outline-none text-slate-100 placeholder-slate-500"
                  />
                </div>

                {/* Quick categories pills slider */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">
                    filtrar por categoria curricular:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jobCategories.map((catKey) => (
                      <button
                        key={catKey}
                        onClick={() => setSelectedJobCategory(catKey)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          selectedJobCategory === catKey 
                            ? 'bg-[#52A8C7] text-slate-950 font-black' 
                            : 'bg-slate-951 text-slate-400 hover:bg-slate-950 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {catKey}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid List of jobs */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {jobsList
                  .filter(job => {
                    const textMatch = (job.title || '').toLowerCase().includes((jobsSearch || '').toLowerCase()) || 
                                      (job.company || '').toLowerCase().includes((jobsSearch || '').toLowerCase()) ||
                                      (job.location || '').toLowerCase().includes((jobsSearch || '').toLowerCase());
                    const categoryMatch = selectedJobCategory === 'Todos' || job.category === selectedJobCategory;
                    return textMatch && categoryMatch;
                  })
                  .map((job) => (
                    <div 
                      key={job.id} 
                      className="p-5 bg-slate-900 border border-slate-800 rounded-3xl hover:border-slate-700/80 transition-all flex flex-col justify-between gap-5 relative group"
                    >
                      <div className="flex items-start gap-4">
                        <img 
                          referrerPolicy="no-referrer"
                          src={job.logo} 
                          alt={job.company} 
                          className="w-12 h-12 rounded-xl object-contain bg-slate-950 border border-slate-800 shrink-0" 
                        />
                        <div className="space-y-1 overflow-hidden flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black tracking-widest text-[#52A8C7] uppercase">{job.category}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-950 text-slate-400 rounded border border-slate-800 capitalize">{job.type}</span>
                          </div>
                          
                          <h3 className="text-sm font-bold text-white tracking-tight line-clamp-1 group-hover:text-[#52A8C7] transition-colors">{job.title}</h3>
                          <p className="text-xs text-slate-300 font-medium">{job.company}</p>
                          
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-[10px] text-slate-400 font-semibold font-mono">
                            <span className="flex items-center gap-0.5"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5"><DollarSign className="w-3.5 h-3.5" /> {job.salary}</span>
                            {job.isRemote && (
                              <React.Fragment>
                                <span>•</span>
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 rounded text-[8px] font-bold">Remoto</span>
                              </React.Fragment>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3.5 border-t border-slate-800/80">
                        <span className="text-[9px] font-mono text-slate-500 font-bold">REG: {job.id}</span>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => handleOpenEditJob(job)}
                            className="p-2 bg-slate-950 border border-slate-850 hover:border-slate-700/80 rounded-xl hover:bg-[#52A8C7]/10 hover:text-[#52A8C7] transition-all text-slate-400 cursor-pointer active:scale-95"
                            title="Editar Atributos da Vaga"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-2 bg-slate-950 border border-slate-850 hover:border-slate-700/80 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all text-slate-400 cursor-pointer active:scale-95"
                            title="Remover Vaga"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>

              {jobsList.filter(job => {
                const textMatch = (job.title || '').toLowerCase().includes((jobsSearch || '').toLowerCase()) || 
                                  (job.company || '').toLowerCase().includes((jobsSearch || '').toLowerCase());
                const categoryMatch = selectedJobCategory === 'Todos' || job.category === selectedJobCategory;
                return textMatch && categoryMatch;
              }).length === 0 && (
                <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
                  <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Nenhuma vaga atende aos filtros de emprego definidos no momento.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* SCREEN 3: COURSES PORTFOLIO */}
          {activeTab === 'courses' && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Header layout */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Capacitações Livres Araucária</h2>
                  <p className="text-xs text-slate-400 mt-1">Gerencie trilhas e canais de palestras educacionais gratuitas e estimule o currículo.</p>
                </div>
                <button 
                  onClick={handleOpenAddCourseParams}
                  className="bg-[#52A8C7] hover:bg-[#3d91ad] text-slate-950 font-black py-3.5 px-5 rounded-2xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#52A8C7]/15 active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3px]" />
                  <span>Novo Curso Gratuito</span>
                </button>
              </div>

              {/* Indicator block for courses */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-[#52A8C7] uppercase block">Grade Profissional Geral</span>
                    <span className="text-xs font-semibold text-slate-305">{coursesList.length} trilhas EAD publicadas</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 text-right">
                  Média de <span className="text-white font-bold">5.0 ★</span> em avaliações
                </div>
              </div>

              {/* Filters container */}
              <div className="space-y-3 p-5 bg-slate-900 border border-slate-800 rounded-3xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Filtrar por nome de curso, instrutor ou ramos profissionais específicos..."
                    value={coursesSearch}
                    onChange={(e) => setCoursesSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-[#52A8C7] rounded-xl text-xs focus:outline-none text-slate-100 placeholder-slate-500"
                  />
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">
                    filtrar por ramo profissional:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {courseCategories.map((catKey) => (
                      <button
                        key={catKey}
                        onClick={() => setSelectedCourseCategory(catKey)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          selectedCourseCategory === catKey 
                            ? 'bg-[#52A8C7] text-slate-950 font-black' 
                            : 'bg-slate-951 text-slate-400 hover:bg-slate-950 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {catKey}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Render collection lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {coursesList
                  .filter(course => {
                    const textMatch = (course.title || '').toLowerCase().includes((coursesSearch || '').toLowerCase()) || 
                                      (course.instructor || '').toLowerCase().includes((coursesSearch || '').toLowerCase());
                    const categoryMatch = selectedCourseCategory === 'Todos' || course.category === selectedCourseCategory;
                    return textMatch && categoryMatch;
                  })
                  .map((course) => (
                    <div 
                      key={course.id} 
                      className={`bg-slate-900 border rounded-3xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group ${
                        course.active !== false ? 'border-slate-800' : 'border-[#F87171]/20 bg-slate-900/60 opacity-70'
                      }`}
                    >
                      <div>
                        {/* Course cover banner */}
                        <div className="h-32 w-full bg-slate-950 relative flex items-center justify-center border-b border-slate-800 overflow-hidden">
                          {course.coverImage ? (
                            <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform" />
                          ) : (
                            <BookOpen className="w-8 h-8 text-slate-600" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-90" />
                          
                          {/* Active / Inactive Status Badge */}
                          <span className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[8px] md:text-[9px] font-black border backdrop-blur-sm shadow-sm ${
                            course.active !== false 
                              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400' 
                              : 'bg-rose-955/80 border-rose-500/30 text-rose-400'
                          }`}>
                            {course.active !== false ? '● ATIVO' : '○ INATIVO'}
                          </span>

                          <span className="absolute top-3 right-3 px-2 py-0.5 bg-slate-950/80 backdrop-blur-sm border border-slate-800/60 rounded text-[9px] font-black text-[#52A8C7]">
                            {course.level}
                          </span>
                        </div>

                        {/* Title and duration */}
                        <div className="p-5 space-y-2">
                          <span className="text-[9px] font-black text-[#52A8C7] uppercase tracking-wider">{course.category}</span>
                          <h3 className="text-sm font-bold text-white tracking-tight leading-snug line-clamp-2 h-10">{course.title}</h3>
                          
                          <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-400 font-semibold">
                            <span className="flex items-center gap-1 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/80">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {course.rating.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span>{course.duration}</span>
                            <span>•</span>
                            <span className="text-indigo-400 font-mono text-[9px]">{course.lessons.length} aulas</span>
                          </div>
                          
                          <p className="text-[10px] text-slate-400 mt-1">Por {course.instructor}</p>
                        </div>
                      </div>

                      {/* Lesson Preview Button - Neat and integrated */}
                      <div className="px-5 pb-1">
                        <button 
                          onClick={() => setPreviewingCourseLessons(course)}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-950 border border-slate-850 hover:border-slate-800 hover:text-[#52A8C7] transition-all text-[11px] font-extrabold rounded-xl cursor-pointer"
                        >
                          <Play className="w-3 h-3 text-[#52A8C7]" />
                          <span>Ver Grade de Aulas ({course.lessons.length})</span>
                        </button>
                      </div>

                      {/* Card manipulation footer */}
                      <div className="p-4 px-5 bg-slate-950/40 border-t border-slate-800/80 flex justify-between items-center mt-3">
                        <span className="text-[9px] font-mono text-slate-500 font-semibold">COD: {course.id}</span>
                        <div className="flex items-center gap-2">
                          {/* Active Toggle Button */}
                          <button 
                            onClick={() => handleToggleCourseActive(course.id)}
                            className={`px-2.5 py-1.5 bg-slate-900 border rounded-lg text-[10px] font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                              course.active !== false 
                                ? 'border-slate-800 text-slate-400 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400' 
                                : 'border-emerald-900 text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10'
                            }`}
                            title={course.active !== false ? "Desativar Curso (Ocultar dos alunos)" : "Ativar Curso (Exibir para os alunos)"}
                          >
                            {course.active !== false ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                                <span>Desativar</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Ativar</span>
                              </>
                            )}
                          </button>

                          <button 
                            onClick={() => handleOpenEditCourse(course)}
                            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-lg hover:bg-[#52A8C7]/10 hover:text-[#52A8C7] transition-all text-slate-400 cursor-pointer active:scale-95 flex items-center gap-1.5 text-[10px] font-bold"
                            title="Editar Atributos do Curso"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>

              {coursesList.filter(course => {
                const textMatch = (course.title || '').toLowerCase().includes((coursesSearch || '').toLowerCase());
                const categoryMatch = selectedCourseCategory === 'Todos' || course.category === selectedCourseCategory;
                return textMatch && categoryMatch;
              }).length === 0 && (
                <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
                  <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Nenhum curso atende aos critérios do filtro atualmente.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* SCREEN 4: SUBMISSIONS AND CANDIDATURES (ATS tracking system) */}
          {activeTab === 'applications' && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Candidaturas Ativas</h2>
                  <p className="text-xs text-slate-400 mt-1">Gerencie os status e perfis curriculares cadastrados no banco de vagas.</p>
                </div>

                <button 
                  onClick={fetchAllApplications}
                  className="px-5 py-3.5 bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Clock className="w-4 h-4 text-[#52A8C7]" />
                  <span>Sincronizar Cloud</span>
                </button>
              </div>

              {/* Advanced candidate tracker and metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900 p-4.5 border border-slate-800 rounded-3xl text-xs font-semibold">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Triagem Inicial</p>
                  <p className="text-xl font-black text-amber-400">{analysisCount} vagas</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entrevistas Ativas</p>
                  <p className="text-xl font-black text-blue-400">{interviewCount} convocados</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admitidos</p>
                  <p className="text-xl font-black text-emerald-400">{approvedCount} contratados</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispensas</p>
                  <p className="text-xl font-black text-slate-400">{rejectedCount} perfis</p>
                </div>
              </div>

              {/* Search inputs */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Pesquisar por nome do aluno, vaga concorrida ou nome da empresa parceira..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-850 focus:border-[#52A8C7] rounded-2xl text-xs focus:outline-none text-slate-100 placeholder-slate-500"
                />
              </div>

              {/* Main DB Table */}
              {loading ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-9 h-9 border-3 border-[#52A8C7] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Verificando banco de dados...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="py-16 text-center bg-slate-900 border border-slate-850 rounded-3xl">
                  <ShieldAlert className="w-12 h-12 text-slate-655 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-300">Nenhum registro encontrado</p>
                  <p className="text-xs text-slate-500 mt-1">Os candidatos cadastrados aparecerão aqui em tempo real.</p>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black tracking-widest block py-3 px-6 sm:table-row">
                          <th className="py-4.5 px-6 table-cell">Identificação / Data</th>
                          <th className="py-4.5 px-6 table-cell">Estudante Candidato</th>
                          <th className="py-4.5 px-6 table-cell">Cargo Desejado</th>
                          <th className="py-4.5 px-6 table-cell">Status Seletivo</th>
                          <th className="py-4.5 px-6 text-right table-cell">Ações de Triagem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 text-xs">
                        {applications
                          .filter(app => 
                            (app.jobTitle || '').toLowerCase().includes((appSearch || '').toLowerCase()) || 
                            (app.company || '').toLowerCase().includes((appSearch || '').toLowerCase()) ||
                            (app.candidateName && app.candidateName.toLowerCase().includes((appSearch || '').toLowerCase()))
                          )
                          .map((app) => (
                            <tr key={app.id} className="hover:bg-slate-950/40 transition-colors flex flex-col sm:table-row py-4 px-6 sm:p-0">
                              <td className="py-1 sm:py-4 px-0 sm:px-6 block sm:table-cell">
                                <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0.5">
                                  <span className="font-mono text-[9px] text-slate-500 font-bold">#{app.id.substring(0, 8).toUpperCase()}</span>
                                  <span className="text-[10px] text-slate-400">{formatBrasiliaTime(app.appliedDate)}</span>
                                </div>
                              </td>
                              <td className="py-1.5 sm:py-4 px-0 sm:px-6 block sm:table-cell font-bold text-slate-100">
                                <button 
                                  onClick={() => setSelectedApplication(app)}
                                  className="text-left text-[#52A8C7] hover:underline flex items-center gap-1 cursor-pointer font-bold text-xs"
                                  title="Ver Ficha Cadastral do Candidato"
                                >
                                  <span>{app.candidateName || 'Estudante'}</span>
                                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                                </button>
                              </td>
                              <td className="py-1 sm:py-4 px-0 sm:px-6 block sm:table-cell">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-205">{app.jobTitle}</span>
                                  <span className="text-[10px] text-slate-400">{app.company}</span>
                                </div>
                              </td>
                              <td className="py-1 sm:py-4 px-0 sm:px-6 block sm:table-cell">
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-tight ${
                                  app.status === 'Aprovado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  app.status === 'Entrevista' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                  app.status === 'Reprovado' ? 'bg-red-500/10 text-red-500/20 text-red-400 border border-red-500/20' :
                                  'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                  {app.status}
                                </span>
                              </td>
                              <td className="py-2 sm:py-4 px-0 sm:px-6 block sm:table-cell text-right">
                                <div className="flex flex-wrap gap-1 md:justify-end">
                                  <button 
                                    onClick={() => handleUpdateAppStatus(app.id, 'Em análise')}
                                    className="px-2 py-1 text-[9px] font-black bg-slate-950 hover:bg-amber-400 hover:text-slate-950 border border-slate-800 hover:border-amber-400 rounded-lg text-amber-400 transition-all cursor-pointer active:scale-95"
                                  >
                                    Análise
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateAppStatus(app.id, 'Entrevista')}
                                    className="px-2 py-1 text-[9px] font-black bg-slate-950 hover:bg-blue-400 hover:text-slate-950 border border-slate-800 hover:border-blue-400 rounded-lg text-blue-400 transition-all cursor-pointer active:scale-95"
                                  >
                                    Entrevista
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateAppStatus(app.id, 'Aprovado')}
                                    className="px-2 py-1 text-[9px] font-black bg-slate-950 hover:bg-emerald-400 hover:text-slate-950 border border-slate-800 hover:border-emerald-400 rounded-lg text-emerald-450 transition-all cursor-pointer active:scale-95"
                                  >
                                    Aprovar
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateAppStatus(app.id, 'Reprovado')}
                                    className="px-2 py-1 text-[9px] font-black bg-slate-950 hover:bg-red-500/20 hover:text-red-400 border border-slate-800 hover:border-red-400 rounded-lg text-slate-400 transition-all cursor-pointer active:scale-95"
                                  >
                                    Reprovar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* SCREEN 5: ENROLLMENTS DATABASE */}
          {activeTab === 'enrollments' && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Inscrições em Cursos</h2>
                  <p className="text-xs text-slate-400 mt-1">Veja quem está matriculado nos cursos de capacitação do Oportuniza.</p>
                </div>

                <button 
                  onClick={fetchAllEnrollments}
                  className="px-5 py-3.5 bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Clock className="w-4 h-4 text-[#52A8C7]" />
                  <span>Sincronizar Cloud</span>
                </button>
              </div>

              {enrollmentsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 bg-slate-900 border border-slate-800 rounded-[32px] text-center">
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-500">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">Sem inscrições registradas</h3>
                  <p className="text-[10px] text-slate-400 max-w-xs">Aguarde até que os alunos comecem a se inscrever em cursos.</p>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden">
                  <div className="overflow-x-auto custom-scroll">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-950/50 border-b border-slate-800/80">
                          <th className="px-5 py-4 text-[10px] font-black text-[#52A8C7] uppercase tracking-widest">Aluno</th>
                          <th className="px-5 py-4 text-[10px] font-black text-[#52A8C7] uppercase tracking-widest">Curso</th>
                          <th className="px-5 py-4 text-[10px] font-black text-[#52A8C7] uppercase tracking-widest">Instrutor</th>
                          <th className="px-5 py-4 text-[10px] font-black text-[#52A8C7] uppercase tracking-widest text-center">Data</th>
                          <th className="px-5 py-4 text-[10px] font-black text-[#52A8C7] uppercase tracking-widest text-center">Progresso</th>
                          <th className="px-5 py-4 text-[10px] font-black text-[#52A8C7] uppercase tracking-widest text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollmentsList.map((enr) => (
                          <tr key={enr.id} className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors group">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-200">
                                  {enr.userName?.substring(0, 1) || 'A'}
                                </div>
                                <span className="text-xs font-bold text-white whitespace-nowrap">{enr.userName}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-xs font-medium text-slate-300">{enr.courseTitle}</span>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-[10px] font-mono text-slate-400">{enr.instructor}</span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className="text-[10px] font-mono text-slate-400">{enr.enrolledDate}</span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#52A8C7]" style={{ width: `${enr.progress}%` }} />
                                </div>
                                <span className="text-[10px] font-mono text-slate-300">{enr.progress}%</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                enr.status === 'Concluído' ? 'bg-emerald-500/10 text-emerald-400' :
                                enr.status === 'Em andamento' ? 'bg-blue-500/10 text-blue-400' :
                                'bg-slate-800 text-slate-400'
                              }`}>
                                {enr.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* SCREEN 6: ACCOUNTS DATABASE */}
          {activeTab === 'accounts' && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Contas Cadastradas</h2>
                  <p className="text-xs text-slate-400 mt-1">Lista de todos os usuários registrados no aplicativo.</p>
                </div>
                <button 
                  onClick={fetchAllUsers}
                  className="px-5 py-3.5 bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Clock className="w-4 h-4 text-[#52A8C7]" />
                  <span>Sincronizar</span>
                </button>
              </div>

              {loading ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-9 h-9 border-3 border-[#52A8C7] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Carregando usuários...</p>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                        <th className="py-4 px-6">Nome</th>
                        <th className="py-4 px-6">Email</th>
                        <th className="py-4 px-6 text-center">Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {userList.map((u) => {
                        console.log("Rendering user:", u);
                        return (
                          <tr key={u.id} className="hover:bg-slate-950/40 transition-colors">
                            <td className="py-4 px-6 font-bold text-slate-100">{u.name}</td>
                            <td className="py-4 px-6 text-slate-400 font-mono">{u.email}</td>
                            <td className="py-4 px-6 text-center">
                              {u.isAdmin ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

        </main>
      </div>

      {/* MODAL / DRAWER 1: DETAILED STUDENT CV CARD ("Sua Ficha Cadastral") */}
      <AnimatePresence>
        {selectedApplication && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-end z-50">
            <motion.div 
              initial={{ opacity: 0, x: 280 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 280 }}
              className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6 text-left">
                {/* Header panel */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-[#52A8C7]" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Perfil do Candidato</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedApplication(null)}
                    className="p-1 px-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    Fechar ✕
                  </button>
                </div>

                {/* Candidate main contact info card */}
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-850 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#52A8C7]/15 flex items-center justify-center text-xl font-bold text-[#52A8C7] uppercase select-none">
                      {selectedApplication.candidateName?.substring(0, 2) || 'C'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{selectedApplication.candidateName}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-mono font-bold text-slate-500">ID: {selectedApplication.id.substring(0, 8).toUpperCase()}</span>
                        <span className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                        <span className="text-[10px] text-slate-400">Cidade: Araucária - PR</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#52A8C7]" />
                      <span className="font-mono">{selectedApplication.candidateEmail || 'Email não informado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#52A8C7]" />
                      <span>{selectedApplication.candidatePhone || 'Telefone não informado'}</span>
                    </div>
                  </div>

                  {/* Direct WhatsApp connect */}
                  <div className="pt-1">
                    <a 
                      href={getCandidateWhatsAppLink(selectedApplication.candidateName || 'Candidato', selectedApplication.jobTitle, selectedApplication.candidatePhone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white font-extrabold py-2.5 rounded-xl text-[10px] transition-colors flex items-center justify-center gap-2 cursor-pointer text-center"
                    >
                      <span>Abrir Conversa no WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Applied details */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Vaga Interposta</span>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                    <p className="text-xs font-bold text-slate-200">{selectedApplication.jobTitle}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{selectedApplication.company}</p>
                    <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-slate-800/60 text-[10px] text-slate-455 font-mono">
                      <span>Candidatou-se em: {formatBrasiliaTime(selectedApplication.appliedDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Synthetic Student Profile Resume */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Currículo & Qualificações</span>
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3 text-[11px] leading-relaxed text-slate-300">
                    
                    {/* Exibe o CV se houver link */}
                    {(selectedApplication.cvLink || selectedApplication.cvFileName) && (
                      <div className="mb-4 pb-3 border-b border-slate-800">
                        <strong className="text-white block mb-2">Currículo Anexado</strong>
                        {selectedApplication.cvLink ? (
                          <a href={selectedApplication.cvLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[#52A8C7] hover:underline font-medium">
                            <span className="truncate max-w-[200px]">{selectedApplication.cvLink}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">{selectedApplication.cvFileName} (Arquivo)</span>
                        )}
                      </div>
                    )}
                    
                    <div>
                      <strong className="text-white block mb-0.5">Objetivo Profissional</strong>
                      <p className="text-slate-400">Jovem estudante proativo em busca de sua primeira oportunidade profissional no município para aplicar conhecimentos básicos de informática e atendimento.</p>
                    </div>
                    <div>
                      <strong className="text-white block mb-0.5">Educação e Escolaridade</strong>
                      <p className="text-slate-400">Ensino Médio - Colégio Estadual de Araucária (Cursando no período noturno).</p>
                    </div>
                    <div>
                      <strong className="text-white block mb-1">Qualidades e Hard Skills</strong>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 bg-slate-900 rounded font-mono text-[9px] text-[#52A8C7]">Pacote Office</span>
                        <span className="px-2 py-0.5 bg-slate-900 rounded font-mono text-[9px] text-[#52A8C7]">Atendimento comercial</span>
                        <span className="px-2 py-0.5 bg-slate-900 rounded font-mono text-[9px] text-[#52A8C7]">Trabalho em grupo</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* State timeline visualization */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Status Seletivo Atual</span>
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Estado atual:</span>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                      selectedApplication.status === 'Aprovado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      selectedApplication.status === 'Entrevista' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      selectedApplication.status === 'Reprovado' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {selectedApplication.status}
                    </span>
                  </div>
                </div>

              </div>

              {/* Status fast action change options */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2 mt-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Alterar Status do Candidato:</span>
                <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                  <button 
                    onClick={() => handleUpdateAppStatus(selectedApplication.id, 'Em análise')}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                      selectedApplication.status === 'Em análise' 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-amber-450 hover:bg-slate-900'
                    }`}
                  >
                    Mover para Análise
                  </button>
                  <button 
                    onClick={() => handleUpdateAppStatus(selectedApplication.id, 'Entrevista')}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                      selectedApplication.status === 'Entrevista' 
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-blue-450 hover:bg-slate-900'
                    }`}
                  >
                    Mover para Entrevista
                  </button>
                  <button 
                    onClick={() => handleUpdateAppStatus(selectedApplication.id, 'Aprovado')}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                      selectedApplication.status === 'Aprovado' 
                        ? 'bg-emerald-500/20 border-emerald-505 text-emerald-400' 
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-emerald-450 hover:bg-slate-900'
                    }`}
                  >
                    Aprovar Candidato
                  </button>
                  <button 
                    onClick={() => handleUpdateAppStatus(selectedApplication.id, 'Reprovado')}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                      selectedApplication.status === 'Reprovado' 
                        ? 'bg-red-500/20 border-red-500 text-red-400' 
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-red-450 hover:bg-slate-900'
                    }`}
                  >
                    Reprovar Candidato
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL / DRAWER 2: INTERACTIVE COURSE LESSON PREVIEW ("Grade de Aulas") */}
      <AnimatePresence>
        {previewingCourseLessons && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                <div className="text-left space-y-0.5">
                  <span className="text-[9px] font-black tracking-widest text-[#52A8C7] uppercase">{previewingCourseLessons.category}</span>
                  <h3 className="text-base font-black text-white">{previewingCourseLessons.title}</h3>
                </div>
                <button 
                  onClick={() => setPreviewingCourseLessons(null)}
                  className="p-1 px-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
                >
                  Fechar
                </button>
              </div>

              {/* Course curriculum description */}
              <p className="text-xs text-slate-400 leading-relaxed text-left">
                {previewingCourseLessons.desc || 'Sem resumo cadastrado para esta capacitação escolar.'}
              </p>

              <div className="space-y-2 max-h-72 overflow-y-auto custom-scroll pt-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left">Grade de Aulas Cadastrada ({previewingCourseLessons.lessons.length}):</span>
                {previewingCourseLessons.lessons.map((lesson, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-850 rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0 text-left">
                      <div className="w-6 h-6 rounded-lg bg-[#52A8C7]/10 flex items-center justify-center text-[#52A8C7] text-xs font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate">{lesson.title}</p>
                        <p className="text-[9px] font-mono text-slate-500">YouTube Video ID: {lesson.youtubeId || 'I2taMQ3j6qo'}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">{lesson.duration || '10:00'}</span>
                  </div>
                ))}
              </div>

              {/* Video verification play simulator */}
              <div className="p-3 bg-[#52A8C7]/5 border border-[#52A8C7]/15 rounded-2xl flex items-center gap-2 text-slate-350 text-[11px] leading-snug">
                <Play className="w-4.5 h-4.5 text-[#52A8C7] shrink-0" />
                <p className="text-left">
                  Como administrador, as aulas acima podem ser vistas pelos alunos cadastrados utilizando o reprodutor nativo incorporado do YouTube.
                </p>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => {
                    handleOpenEditCourse(previewingCourseLessons);
                    setPreviewingCourseLessons(null);
                  }}
                  className="w-full bg-[#52A8C7] hover:bg-[#3d91ad] text-slate-950 font-black py-3 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Editar Dados e Grade Teórica do Curso
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* JOB MODAL (ADD / EDIT) */}
      <AnimatePresence>
        {showJobModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 my-8"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                <div className="text-left space-y-0.5">
                  <h3 className="text-base font-black text-white">
                    {editingJob ? 'Alterar Atributos da Vaga' : 'Publicar Novo Cadastro de Vaga'}
                  </h3>
                  <p className="text-[10px] text-slate-400">Preencha os dados abaixo que serão refletidos no Feed de Vagas do aluno correspondente.</p>
                </div>
                <button 
                  onClick={() => setShowJobModal(false)}
                  className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveJobSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Título do Cargo</label>
                    <input 
                      type="text" 
                      required
                      value={jobForm.title} 
                      onChange={e => setJobForm({...jobForm, title: e.target.value})}
                      placeholder="Ex: Auxiliar de Mecânico"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#52A8C7] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Empresa Contratante</label>
                    <input 
                      type="text" 
                      required
                      value={jobForm.company} 
                      onChange={e => setJobForm({...jobForm, company: e.target.value})}
                      placeholder="Ex: Transportadora Araucária"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#52A8C7] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Categoria</label>
                    <select 
                      value={jobForm.category} 
                      onChange={e => setJobForm({...jobForm, category: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#52A8C7] rounded-xl px-3 py-2.5 text-xs focus:outline-none text-slate-350"
                    >
                      <option value="Saúde">Saúde</option>
                      <option value="Administração">Administração</option>
                      <option value="Serviços Gerais">Serviços Gerais</option>
                      <option value="Alimentação">Alimentação</option>
                      <option value="Comércio">Comércio</option>
                      <option value="Logística">Logística</option>
                      <option value="Indústria">Indústria</option>
                      <option value="Estágios">Estágios</option>
                      <option value="Produtividade">Produtividade</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tipo de Vaga</label>
                    <select 
                      value={jobForm.type} 
                      onChange={e => setJobForm({...jobForm, type: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#52A8C7] rounded-xl px-3 py-2.5 text-xs focus:outline-none text-slate-350"
                    >
                      <option value="Estágio">Estágio</option>
                      <option value="CLT">CLT</option>
                      <option value="Jovem Aprendiz">Jovem Aprendiz</option>
                      <option value="Freelancer">Freelancer</option>
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Remuneração</label>
                    <input 
                      type="text" 
                      value={jobForm.salary} 
                      onChange={e => setJobForm({...jobForm, salary: e.target.value})}
                      placeholder="R$ 1.650,00 + VT"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#52A8C7] rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Descrição Breve do Cargo</label>
                  <textarea 
                    rows={2}
                    value={jobForm.description} 
                    onChange={e => setJobForm({...jobForm, description: e.target.value})}
                    placeholder="Descrição sobre a rotina diária no setor correspondente..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-[#52A8C7] rounded-xl p-3 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Requisitos Mandatórios (Um por linha)</label>
                  <textarea 
                    rows={3}
                    value={jobForm.requirements} 
                    onChange={e => setJobForm({...jobForm, requirements: e.target.value})}
                    placeholder="Ensino médio concluído&#10;Residir em Araucária-PR&#10;Noções básicas de Pacote Office"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-[#52A8C7] rounded-xl p-3 text-xs focus:outline-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Local do Trabalho</label>
                    <input 
                      type="text" 
                      value={jobForm.location} 
                      onChange={e => setJobForm({...jobForm, location: e.target.value})}
                      placeholder="Araucária - PR"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#52A8C7] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                  
                  <div className="flex items-center pt-4">
                    <input 
                      id="is-remote-input"
                      type="checkbox" 
                      checked={jobForm.isRemote} 
                      onChange={e => setJobForm({...jobForm, isRemote: e.target.checked})}
                      className="w-4 h-4 bg-slate-950 border-slate-800 rounded focus:ring-[#52A8C7] accent-[#52A8C7] mr-2.5"
                    />
                    <label htmlFor="is-remote-input" className="text-xs font-semibold text-slate-300">Essa vaga permite trabalhar Remoto</label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Latitude do Mapa (opcional)</label>
                    <input 
                      type="text" 
                      value={jobForm.lat} 
                      onChange={e => setJobForm({...jobForm, lat: e.target.value})}
                      placeholder="-25.5920"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-[#52A8C7] rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Longitude do Mapa (opcional)</label>
                    <input 
                      type="text" 
                      value={jobForm.lng} 
                      onChange={e => setJobForm({...jobForm, lng: e.target.value})}
                      placeholder="-49.4140"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-[#52A8C7] rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-300"
                    />
                  </div>
                </div>

                <div className="pt-3 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowJobModal(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-705 text-slate-300 font-bold py-3.5 rounded-xl text-xs transition-colors cursor-pointer select-none text-center"
                  >
                    Descartar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-[#52A8C7] hover:bg-[#3d91ad] text-slate-950 font-black py-3.5 rounded-xl text-xs transition-colors cursor-pointer select-none"
                  >
                    {editingJob ? 'Salvar Mudanças' : 'Publicar Vaga Agora'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COURSE MODAL (ADD / EDIT) */}
      <AnimatePresence>
        {showCourseModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 my-8"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                <div className="text-left space-y-0.5">
                  <h3 className="text-base font-black text-white">
                    {editingCourse ? 'Configurações de Capacitação' : 'Adicionar Novo Curso Profissional'}
                  </h3>
                  <p className="text-[10px] text-slate-400">Preencha as aulas e vídeos de capacitação oferecidos gratuitamente.</p>
                </div>
                <button 
                  onClick={() => setShowCourseModal(false)}
                  className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveCourseSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Título do Curso</label>
                    <input 
                      type="text" 
                      required
                      value={courseForm.title} 
                      onChange={e => setCourseForm({...courseForm, title: e.target.value})}
                      placeholder="Ex: Boas Práticas em Supermercados"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#52A8C7] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Palestrante / Instrutor</label>
                    <input 
                      type="text" 
                      required
                      value={courseForm.instructor} 
                      onChange={e => setCourseForm({...courseForm, instructor: e.target.value})}
                      placeholder="Ex: Oportuniza Capacita"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#52A8C7] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Ramo de Atuação</label>
                    <select 
                      value={courseForm.category} 
                      onChange={e => setCourseForm({...courseForm, category: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#52A8C7] rounded-xl px-3 py-2.5 text-xs focus:outline-none text-slate-300"
                    >
                      <option value="Produtividade">Produtividade</option>
                      <option value="Sistemas">Sistemas</option>
                      <option value="Atendimento">Atendimento</option>
                      <option value="Comércio">Comércio</option>
                      <option value="Saúde">Saúde</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Carga Horária</label>
                    <input 
                      type="text" 
                      required
                      value={courseForm.duration} 
                      onChange={e => setCourseForm({...courseForm, duration: e.target.value})}
                      placeholder="Ex: 5 horas"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#52A8C7] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nível de Estudo</label>
                    <select 
                      value={courseForm.level} 
                      onChange={e => setCourseForm({...courseForm, level: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-[#52A8C7] rounded-xl px-3 py-2.5 text-xs focus:outline-none text-slate-350"
                    >
                      <option value="Iniciante">Iniciante</option>
                      <option value="Intermediário">Intermediário</option>
                      <option value="Avançado">Avançado</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Imagem de Capa (URL)</label>
                  <input 
                    type="url" 
                    value={courseForm.coverImage} 
                    onChange={e => setCourseForm({...courseForm, coverImage: e.target.value})}
                    placeholder="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-[#52A8C7] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Resumo Curricular (Descrição)</label>
                  <textarea 
                    rows={2}
                    value={courseForm.desc} 
                    onChange={e => setCourseForm({...courseForm, desc: e.target.value})}
                    placeholder="Nesta capacitação, você aprenderá sobre..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-[#52A8C7] rounded-xl p-3 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1 p-3.5 bg-slate-950 border border-slate-850 rounded-2xl">
                  <label className="text-[10px] font-black text-[#52A8C7] uppercase tracking-wider block mb-1">
                    Configuração de Aulas e IDs do YouTube
                  </label>
                  <span className="text-[9px] text-slate-400 block mb-2 leading-relaxed">
                    Formato por linha: <strong>Título da Palestra;Tempo;ID_do_Youtube_Video</strong>
                  </span>
                  <textarea 
                    rows={4}
                    required
                    value={courseForm.lessonsInput} 
                    onChange={e => setCourseForm({...courseForm, lessonsInput: e.target.value})}
                    placeholder="Introdução à Atividade;08:35;I2taMQ3j6qo&#10;Melhoria Contínua;14:20;OHM4CJbea54"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-[#52A8C7] rounded-xl p-2.5 text-xs font-mono focus:outline-none text-slate-200"
                  />
                </div>

                {/* Active Toggle Option */}
                <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-850 rounded-2xl">
                  <input 
                    type="checkbox" 
                    id="course-active-checkbox"
                    checked={courseForm.active} 
                    onChange={e => setCourseForm({...courseForm, active: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-[#52A8C7] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="flex flex-col text-left">
                    <label htmlFor="course-active-checkbox" className="text-xs font-bold text-white cursor-pointer pl-0.5 select-none font-sans">
                      Curso Ativo (Disponível aos Alunos)
                    </label>
                    <span className="text-[10px] text-slate-400 pl-0.5 leading-tight font-sans">
                      Se desmarcado, este curso ficará inativo e oculto na página de trilhas de capacitação dos alunos.
                    </span>
                  </div>
                </div>

                <div className="pt-3 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowCourseModal(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-xl text-xs transition-colors cursor-pointer select-none text-center"
                  >
                    Descartar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-[#52A8C7] hover:bg-[#3d91ad] text-slate-950 font-black py-3.5 rounded-xl text-xs transition-colors cursor-pointer select-none"
                  >
                    {editingCourse ? 'Gravar Alterações' : 'Salvar e Cadastrar Curso'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
