import { useState } from 'react';
import { 
  ArrowRight, 
  Award, 
  Briefcase, 
  Sparkles, 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  Users, 
  Compass, 
  MessageSquare, 
  BookOpen, 
  MapPin, 
  Check, 
  Search, 
  Star, 
  AlertCircle, 
  XCircle, 
  Quote, 
  Send, 
  Zap, 
  TrendingUp, 
  ChevronRight, 
  CheckCircle, 
  Lock, 
  Lightbulb,
  BrainCircuit,
  X
} from 'lucide-react';
import { ScreenId } from '../types';

const logo = 'https://www.image2url.com/r2/default/images/1781824138816-3fd9702f-4521-41d2-8411-d8fc61114350.png';

interface DesktopLandingProps {
  onNavigate: (screen: ScreenId) => void;
}

export default function DesktopLanding({ onNavigate }: DesktopLandingProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // FAQ Category Filter
  const [faqCategory, setFaqCategory] = useState<'todos' | 'vagas' | 'cursos' | 'ia' | 'seguranca'>('todos');
  const [faqSearch, setFaqSearch] = useState('');

  // FAQ List
  const allFaqs = [
    {
      category: 'vagas',
      q: 'O Oportuniza Araucária cobra alguma mensalidade ou taxa de cadastro?',
      a: 'Não! O Oportuniza é 100% gratuito tanto para os candidatos quanto para os alunos dos cursos. Você nunca precisará cadastrar cartão de crédito ou pagar taxa para se candidatar ou emitir certificados.'
    },
    {
      category: 'vagas',
      q: 'Não tenho nenhuma experiência anterior na carteira de trabalho. Consigo vaga?',
      a: 'Com certeza. Grande parte das vagas cadastradas no portal são especificamente estruturadas para Primeiro Emprego, Jovem Aprendiz e Estágio, onde as empresas valorizam a vontade de aprender e a capacitação realizada nos cursos gratuitos.'
    },
    {
      category: 'cursos',
      q: 'Como funciona a emissão do certificado em PDF? Tem custo?',
      a: 'A emissão do certificado é instantânea e totalmente gratuita após a conclusão das videoaulas do minicurso. O PDF é gerado com código de verificação autêntico, válido para enriquecer seu currículo e comprovar horas complementares acadêmicas.'
    },
    {
      category: 'ia',
      q: 'O que faz o Mentor IA de Entrevistas e como ele me ajuda?',
      a: 'O Mentor IA é um assistente inteligente treinado nas perguntas reais que os recrutadores de Araucária fazem. Ele simula entrevistas, avalia suas respostas, corrige pontos fracos e dá dicas de ouro de postura e clareza para você não travar na hora H.'
    },
    {
      category: 'seguranca',
      q: 'As vagas anunciadas são verificadas?',
      a: 'Sim. Todas as oportunidades passam por uma curadoria interna para garantir que sejam oportunidades reais de empresas estabelecidas em Araucária e região, prevenindo golpes ou anúncios falsos.'
    },
    {
      category: 'cursos',
      q: 'Posso assistir às aulas pelo celular ou pelo computador?',
      a: 'Sim, a plataforma é totalmente responsiva. Você pode assistir às videoaulas no seu celular ou computador a qualquer momento e continuar exatamente de onde parou.'
    }
  ];

  const filteredFaqs = allFaqs.filter(faq => {
    const matchesCat = faqCategory === 'todos' || faq.category === faqCategory;
    const matchesSearch = faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || faq.a.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-primary/20 selection:text-primary relative antialiased">
      
      {/* ========================================================================= */}
      {/* 1. TOP STICKY HEADER WITH REFINED GLASSMORPHISM                          */}
      {/* ========================================================================= */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-40 px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Araucária Seal */}
          <div 
            onClick={() => onNavigate('landing')} 
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-2xs p-0.5 group-hover:scale-105 transition-all flex items-center justify-center">
              <img src={logo} alt="Oportuniza Araucária" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-slate-950 tracking-tight">Oportuniza</span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md">
                  Araucária
                </span>
              </div>
              <span className="text-[10px] text-slate-600 font-medium -mt-0.5">Empregabilidade & Qualificação Gratuita</span>
            </div>
          </div>

          {/* Quick Nav Anchors */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-600">
            <a href="#como-funciona" className="hover:text-primary transition-colors flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> Como Funciona
            </a>
            <a href="#pilares-secao" className="hover:text-primary transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Recursos
            </a>
            <a href="#comparativo-secao" className="hover:text-primary transition-colors flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Comparativo
            </a>
            <a href="#depoimentos-secao" className="hover:text-primary transition-colors flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Depoimentos
            </a>
            <a href="#faq-secao" className="hover:text-primary transition-colors">
              Dúvidas
            </a>
          </nav>

          {/* User Auth CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-primary rounded-xl transition-all cursor-pointer hover:bg-slate-100/70"
            >
              Já tenho conta (Entrar)
            </button>

            <button
              onClick={() => onNavigate('register')}
              className="px-5 py-2.5 text-xs font-extrabold text-white bg-primary hover:bg-primary-dark shadow-[0_4px_14px_rgba(79,162,192,0.35)] rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Cadastre-se Grátis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION - CENTERED HIGH-CONVERTING LAYOUT                        */}
      {/* ========================================================================= */}
      <section className="w-full px-6 sm:px-8 pt-12 pb-20 bg-gradient-to-b from-[#EEF7FC] via-[#F4F9FD] to-[#F8FAFC] relative overflow-hidden border-b border-slate-200/60">
        
        {/* Background Subtle Tech Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#4FA2C0_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6 relative z-10">
          
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-primary/30 text-primary text-xs font-bold shadow-2xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>Portal Oficial de Empregabilidade e Qualificação de Araucária</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-black text-slate-950 tracking-tight leading-[1.14] max-w-3xl">
            Conquiste sua vaga em Araucária <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#3B82F6] to-[#6C63FF]">
              mesmo sem ter experiência prévia.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
            Conecte-se a vagas reais de <strong>Estágio, Jovem Aprendiz e CLT</strong> nas empresas da nossa cidade. Estude com <strong>minicursos gratuitos com certificado em PDF</strong> e treine respostas com o <strong>Mentor IA de Entrevistas</strong>.
          </p>

          {/* Primary Action Buttons (Centered) */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 w-full">
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-black shadow-[0_10px_25px_rgba(79,162,192,0.38)] hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2.5"
            >
              <span>CRIAR CONTA 100% GRATUITA</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const elem = document.getElementById('como-funciona');
                elem?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold border border-slate-300/80 shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-primary" />
              <span>Como Funciona o Portal</span>
            </button>
          </div>

          {/* Friction Reducers (Centered) */}
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-xs text-slate-500 font-semibold pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> Sem mensalidade
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> Cadastro em 60 segundos
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> Certificado em PDF na hora
            </span>
          </div>

          {/* Hero Live Stats Bar (Centered) */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 mt-2 border-t border-slate-200/90 w-full max-w-xl">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">+1.240</span>
              <span className="text-xs text-slate-500 font-medium mt-0.5">Jovens cadastrados</span>
            </div>
            <div className="flex flex-col items-center border-x border-slate-200 px-3">
              <span className="text-2xl sm:text-3xl font-black text-primary tracking-tight">+860</span>
              <span className="text-xs text-slate-500 font-medium mt-0.5">Certificados gerados</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-teal-600 tracking-tight">4.9 / 5.0</span>
              <span className="text-xs text-slate-500 font-medium mt-0.5">Avaliação da comunidade</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. COMO FUNCIONA EM 3 PASSOS SIMPLES                                      */}
      {/* ========================================================================= */}
      <section id="como-funciona" className="w-full px-8 py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          
          <div className="text-center flex flex-col items-center gap-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              Passo a Passo Simples
            </span>
            <h2 className="text-3xl font-black text-slate-950 tracking-tight">
              Como funciona o Oportuniza Araucária
            </h2>
            <p className="text-sm text-slate-600">
              Três passos práticos para sair do zero e conquistar sua vaga no mercado de trabalho.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-[#F8FAFC] border border-slate-200 flex flex-col gap-4 text-left relative group hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-xs">
                1
              </div>
              <h3 className="text-lg font-black text-slate-950">Cadastre seu Perfil Grátis</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Crie sua conta em menos de 1 minuto. Não exigimos histórico profissional na carteira e nem cobramos qualquer mensalidade.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-[#F8FAFC] border border-slate-200 flex flex-col gap-4 text-left relative group hover:border-teal-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-lg shadow-xs">
                2
              </div>
              <h3 className="text-lg font-black text-slate-950">Faça Minicursos com Certificado</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Assista a aulas práticas e rápidas de Excel e Estruturação de Currículo. Emita seu certificado oficial em PDF na hora com código de autenticidade.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-[#F8FAFC] border border-slate-200 flex flex-col gap-4 text-left relative group hover:border-brand-purple/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-brand-purple text-white flex items-center justify-center font-black text-lg shadow-xs">
                3
              </div>
              <h3 className="text-lg font-black text-slate-950">Candidate-se & Treine com IA</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Envie seu currículo diretamente para as vagas abertas em Araucária e simule perguntas reais de RH com o Mentor de Inteligência Artificial.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. OS 4 PILARES DA PLATAFORMA                                              */}
      {/* ========================================================================= */}
      <section id="pilares-secao" className="w-full px-8 py-16 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          
          <div className="text-center flex flex-col items-center gap-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              Recursos Completos
            </span>
            <h2 className="text-3xl font-black text-slate-950 tracking-tight">
              Tudo o que você precisa em uma única plataforma
            </h2>
            <p className="text-sm text-slate-600">
              Desenvolvido especialmente para as necessidades dos candidatos e empresas de Araucária.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pilar 1 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3.5 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-primary flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Vagas Locais Verificadas</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Oportunidades em comércios, indústrias e clínicas de Araucária filtradas por bairros como Centro, Costeira e Polo Industrial.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3.5 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Cursos Gratuitos</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Capacitações práticas em ferramentas exigidas pelo mercado de trabalho com linguagem simples e direta.
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3.5 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-brand-purple flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Mentor IA de Entrevistas</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Simule perguntas reais de recrutadores, descubra seus pontos fortes e receba dicas de postura para não travar na entrevista.
              </p>
            </div>

            {/* Pilar 4 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3.5 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Certificados Oficiais</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Documentos autênticos em PDF com código de verificação para comprovar suas habilidades aos recrutadores.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SEÇÃO DE DOR vs. SOLUÇÃO: OPORTUNIZA vs MÉTODOS ANTIGOS                */}
      {/* ========================================================================= */}
      <section id="comparativo-secao" className="w-full px-8 py-16 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          
          <div className="text-center flex flex-col items-center gap-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
              Por Que o Oportuniza Funciona?
            </span>
            <h2 className="text-3xl font-black text-slate-950 tracking-tight">
              Compare a sua busca por emprego
            </h2>
            <p className="text-sm text-slate-600">
              Veja a diferença prática entre os métodos tradicionais e o nosso portal gratuito.
            </p>
          </div>

          {/* Modern Side-by-Side Comparison Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* BAD: Old Methods */}
            <div className="p-8 rounded-3xl bg-white border border-rose-200/80 shadow-2xs flex flex-col gap-5 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Procurando Emprego Sozinho</h3>
                  <p className="text-xs text-rose-700 font-medium">Método tradicional cansativo e sem retorno</p>
                </div>
              </div>

              <div className="flex flex-col gap-3.5 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Currículos sem resposta:</strong> Envia dezenas de e-mails genéricos sem saber se o recrutador chegou a abrir.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Bloqueio por falta de experiência:</strong> Desiste das vagas porque quase todas pedem comprovante na carteira.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Cursos pagos caros:</strong> Precisa pagar mensalidades pesadas só para conseguir um certificado simples.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Nervosismo e travas na entrevista:</strong> Chega na entrevista sem nunca ter treinado e perde a chance por insegurança.</span>
                </div>
              </div>
            </div>

            {/* GOOD: With Oportuniza */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-white via-blue-50/40 to-teal-50/40 border-2 border-primary/50 shadow-md flex flex-col gap-5 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xs">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Com o Oportuniza Araucária</h3>
                  <p className="text-xs text-primary font-bold">100% Gratuito, Direto e Focado na Cidade</p>
                </div>
              </div>

              <div className="flex flex-col gap-3.5 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Vagas para 1º Emprego e Aprendiz:</strong> Oportunidades em empresas locais que valorizam candidatos motivados.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Certificados Oficiais em PDF Gratuitos:</strong> Cursos rápidos de Excel e Currículo com emissão imediata.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Mentor IA para Simular Entrevistas:</strong> Treine suas respostas antes de ir falar com o recrutador e chegue confiante.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Envio Direto sem Intermediários:</strong> Candidatura simplificada com seu perfil já formatado profissionalmente.</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('register')}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-black shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>QUERO COMEÇAR AGORA DE GRAÇA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. PROVA SOCIAL & DEPOIMENTOS DE CANDIDATOS REAIS EM ARAUCÁRIA            */}
      {/* ========================================================================= */}
      <section id="depoimentos-secao" className="w-full px-8 py-16 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          
          <div className="text-center flex flex-col items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              Resultados Reais
            </span>
            <h2 className="text-3xl font-black text-slate-950 tracking-tight">
              Quem usa o Oportuniza conquista sua vaga
            </h2>
            <p className="text-sm text-slate-600">
              Histórias de jovens e profissionais que conseguiram emprego e qualificação em Araucária.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Depoimento 1 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "Eu não sabia o que colocar no currículo porque nunca tinha trabalhado de carteira assinada. Fiz o curso de currículo e treinei as perguntas com o Mentor IA. Passei na entrevista de Jovem Aprendiz na Costeira!"
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Lucas Mendes, 17 anos</h4>
                  <span className="text-[11px] text-slate-500">Costeira • Jovem Aprendiz</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Contratado
                </span>
              </div>
            </div>

            {/* Depoimento 2 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "Precisava de horas complementares na faculdade e de certificado de Excel para conseguir meu estágio. As aulas foram super objetivas e o certificado saiu na mesma hora em PDF com código de verificação."
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Beatriz Silva, 20 anos</h4>
                  <span className="text-[11px] text-slate-500">Centro • Estágio de Administração</span>
                </div>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                  Certificada
                </span>
              </div>
            </div>

            {/* Depoimento 3 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "Estava há 6 meses procurando emprego no Polo Industrial de Araucária. Pelo Oportuniza me candidatei direto na vaga de montagem e recebi o retorno do RH em menos de 1 semana."
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Rodrigo F., 22 anos</h4>
                  <span className="text-[11px] text-slate-500">Polo Industrial • CLT Auxiliar</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Contratado
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FAQ COMPLETO COM CATEGORIAS E BUSCA EM TEMPO REAL                       */}
      {/* ========================================================================= */}
      <section id="faq-secao" className="w-full px-8 py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          
          <div className="text-center flex flex-col items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              Transparência & Dúvidas
            </span>
            <h2 className="text-3xl font-black text-slate-950 tracking-tight">
              Perguntas Frequentes
            </h2>
            <p className="text-xs text-slate-500">
              Tudo o que você precisa saber sobre as vagas, os cursos e a plataforma gratuita.
            </p>
          </div>

          {/* Search and Category Filters for FAQ */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 w-full sm:w-80 shadow-2xs">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Pesquisar dúvida..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full text-xs text-slate-900 outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0">
              {[
                { id: 'todos', label: 'Todas' },
                { id: 'vagas', label: 'Vagas' },
                { id: 'cursos', label: 'Cursos & Certificados' },
                { id: 'ia', label: 'Mentor IA' },
                { id: 'seguranca', label: 'Gratuidade & Segurança' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFaqCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    faqCategory === cat.id 
                      ? 'bg-slate-900 text-white shadow-2xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div className="flex flex-col gap-3">
            {filteredFaqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-[#F8FAFC] rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-4.5 text-left font-bold text-sm text-slate-900 flex items-center justify-between cursor-pointer hover:text-primary transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openFaq === index ? 'rotate-180 text-primary' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-4.5 pb-4.5 text-xs text-slate-600 leading-relaxed border-t border-slate-200/70 pt-3 bg-white/70">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. CTA FINAL DE ALTA CONVERSÃO                                             */}
      {/* ========================================================================= */}
      <section className="w-full px-8 py-16 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary via-[#418DAA] to-[#6C63FF] rounded-[36px] p-10 lg:p-16 text-white text-center flex flex-col items-center gap-6 shadow-[0_25px_60px_rgba(79,162,192,0.28)] relative overflow-hidden">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comece Hoje Mesmo • 100% Gratuito</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-black tracking-tight max-w-2xl leading-snug">
            Sua próxima oportunidade de trabalho em Araucária começa agora.
          </h2>

          <p className="text-sm text-blue-100 max-w-xl leading-relaxed">
            Não deixe para depois a vaga que pode transformar sua carreira ainda esta semana. Crie seu perfil em menos de 1 minuto e acesse todas as vagas e cursos gratuitos.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('register')}
              className="px-9 py-4 rounded-2xl bg-white text-slate-950 text-sm font-black shadow-lg hover:bg-slate-50 active:scale-95 transition-all cursor-pointer flex items-center gap-2.5"
            >
              <span>CRIAR MINHA CONTA GRATUITA AGORA</span>
              <ArrowRight className="w-4 h-4 text-primary" />
            </button>

            <button
              onClick={() => onNavigate('login')}
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/20 transition-all cursor-pointer"
            >
              Já possuo cadastro (Entrar)
            </button>
          </div>

          <span className="text-xs text-blue-200">
            🔒 Sem cartão de crédito • Sem taxas escondidas • Acesso imediato
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FOOTER                                                                */}
      {/* ========================================================================= */}
      <footer className="w-full bg-white border-t border-slate-200/80 px-8 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg overflow-hidden border border-slate-200 bg-white p-0.5">
              <img src={logo} alt="Oportuniza" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-slate-800">Oportuniza Araucária</span>
            <span>• © {new Date().getFullYear()} Todos os direitos reservados</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <button onClick={() => onNavigate('bio')} className="hover:text-primary transition-colors cursor-pointer">
              Sobre o Projeto
            </button>
            <button onClick={() => onNavigate('privacy')} className="hover:text-primary transition-colors cursor-pointer">
              Privacidade
            </button>
            <button onClick={() => onNavigate('terms')} className="hover:text-primary transition-colors cursor-pointer">
              Termos de Uso
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
}
