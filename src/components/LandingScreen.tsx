import { 
  ArrowRight, 
  Sparkles 
} from 'lucide-react';
import { ScreenId } from '../types';
import DesktopLanding from './DesktopLanding';

const logo = 'https://www.image2url.com/r2/default/images/1781824138816-3fd9702f-4521-41d2-8411-d8fc61114350.png';

interface LandingScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export default function LandingScreen({ onNavigate }: LandingScreenProps) {
  return (
    <div className="w-full h-full overflow-y-auto custom-scroll bg-[#F8FAFC] relative select-none">
      {/* ========================================================================= */}
      {/* MOBILE VIEW (< md) - Modern, Native-Feel App Experience                  */}
      {/* ========================================================================= */}
      <div className="block md:hidden min-h-full pb-20">
        {/* Main Mobile Content Container */}
        <div className="px-4 pt-4 flex flex-col gap-4">
          {/* Hero Highlight Card */}
          <div className="bg-gradient-to-br from-white via-[#f0f8ff] to-[#f5f3ff] rounded-3xl p-5 border border-blue-100/80 shadow-[0_10px_30px_rgba(79,162,192,0.12)] flex flex-col gap-4">
            
            {/* Center Logo with glow */}
            <div className="w-full flex justify-center py-1">
              <div className="w-[180px] h-[180px] rounded-3xl shadow-[0_12px_32px_rgba(79,162,192,0.22)] overflow-hidden bg-white relative">
                <img 
                  src={logo} 
                  alt="Oportuniza Logo" 
                  className="w-full h-full object-cover object-center block select-none" 
                />
              </div>
            </div>

            {/* Title & Slogan */}
            <div className="text-center flex flex-col gap-1.5">
              <div className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit mx-auto">
                <Sparkles className="w-3 h-3 text-primary" />
                <span>Vagas, Cursos e IA em Araucária</span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-snug pt-1">
                Seu futuro profissional começa aqui
              </h1>
              <p className="text-xs text-gray-600 leading-relaxed px-1">
                Estágios, menor aprendiz e CLT, minicursos com certificado grátis em PDF e mentor IA de entrevista.
              </p>
            </div>

            {/* Quick Action CTA Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-[0_8px_20px_rgba(79,162,192,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                onClick={() => onNavigate('login')}
              >
                <span>Começar Agora Gratuitamente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                className="w-full py-3 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold border border-gray-200 shadow-2xs active:scale-[0.98] transition-all"
                onClick={() => onNavigate('bio')}
              >
                Conhecer a Plataforma (Bio)
              </button>
            </div>

            {/* Micro Stats Banner */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200/60 text-center">
              <div className="flex flex-col">
                <span className="text-sm font-black text-primary">+1.200</span>
                <span className="text-[9px] text-gray-500 font-medium">Alunos</span>
              </div>
              <div className="flex flex-col border-x border-gray-200">
                <span className="text-sm font-black text-[#6C63FF]">100%</span>
                <span className="text-[9px] text-gray-500 font-medium">Grátis</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-teal-600">Certificado</span>
                <span className="text-[9px] text-gray-500 font-medium">em PDF</span>
              </div>
            </div>
          </div>

          {/* 3 Step Timeline */}
          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-xs flex flex-col gap-3 mt-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Como funciona em 3 passos</h2>
            
            <div className="flex flex-col gap-3.5 pl-1.5 border-l-2 border-primary/20">
              <div className="relative pl-3.5">
                <div className="absolute left-[-11px] top-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[9px] font-bold shadow-xs">1</div>
                <strong className="text-xs font-bold text-gray-900 block">Crie sua Conta Grátis</strong>
                <span className="text-[10px] text-gray-500">Cadastre-se em menos de 1 minuto.</span>
              </div>
              
              <div className="relative pl-3.5">
                <div className="absolute left-[-11px] top-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[9px] font-bold shadow-xs">2</div>
                <strong className="text-xs font-bold text-gray-900 block">Candidate-se & Estude</strong>
                <span className="text-[10px] text-gray-500">Envie currículo para vagas e assista minicursos.</span>
              </div>

              <div className="relative pl-3.5">
                <div className="absolute left-[-11px] top-0.5 w-5 h-5 rounded-full bg-[#6C63FF] flex items-center justify-center text-white text-[9px] font-bold shadow-xs">3</div>
                <strong className="text-xs font-bold text-gray-900 block">Emita seu Certificado</strong>
                <span className="text-[10px] text-gray-500">Gere PDF instantâneo com selo oficial.</span>
              </div>
            </div>
          </div>

          {/* Bottom Floating CTA Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary to-[#6C63FF] text-white flex flex-col gap-2.5 shadow-md text-center">
            <h3 className="text-sm font-bold">Pronto para conquistar sua vaga?</h3>
            <p className="text-[11px] text-blue-100">Junte-se à comunidade de Araucária agora mesmo.</p>
            <button
              onClick={() => onNavigate('register')}
              className="w-full py-2.5 rounded-xl bg-white text-gray-900 text-xs font-bold shadow-xs hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
            >
              Cadastrar Gratuitamente
            </button>
          </div>

          {/* Footer links */}
          <div className="text-center text-[10px] text-gray-400 py-3 flex items-center justify-center gap-4">
            <button onClick={() => onNavigate('privacy')} className="hover:text-primary">Privacidade</button>
            <span>•</span>
            <button onClick={() => onNavigate('terms')} className="hover:text-primary">Termos</button>
            <span>•</span>
            <button onClick={() => onNavigate('bio')} className="hover:text-primary">Sobre</button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEW (>= md) - Dedicated High-Performance PC Experience          */}
      {/* ========================================================================= */}
      <div className="hidden md:block w-full min-h-full">
        <DesktopLanding onNavigate={onNavigate} />
      </div>
    </div>
  );
}
