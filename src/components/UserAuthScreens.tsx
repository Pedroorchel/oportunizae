import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowLeft, Eye, EyeOff, ShieldCheck, Loader2, ShieldAlert } from 'lucide-react';
import { ScreenId, User } from '../types';
import { supabase, getAppRedirectUrl } from '../lib/supabaseClient';
import { isAccountBlocked, isUserRecordBlocked, fetchAccountBlockReason, extractBlockReasonFromRecord } from '../lib/blockedAccounts';

const logo = 'https://www.image2url.com/r2/default/images/1781824138816-3fd9702f-4521-41d2-8411-d8fc61114350.png';

interface AuthProps {
  currentScreen: 'login' | 'register' | 'recover';
  onNavigate: (screen: ScreenId) => void;
  onSetUser: (user: User | null) => void;
}

export default function UserAuthScreens({
  currentScreen,
  onNavigate,
  onSetUser,
}: AuthProps) {
  // Common states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const getFriendlyErrorMessage = (errMsg: string) => {
    if (!errMsg) return 'Ocorreu um erro na autenticação';
    const lower = errMsg.toLowerCase();
    if (lower.includes('rate limit') || lower.includes('email rate limit exceeded')) {
      return 'Limite de e-mails do Supabase excedido! Por favor, aguarde alguns minutos para tentar novamente.';
    }
    if (lower.includes('user already registered') || lower.includes('already exists')) {
      return 'Este e-mail já está cadastrado. Tente fazer login.';
    }
    if (lower.includes('password should be') || lower.includes('password must be')) {
      return 'A senha deve conter pelo menos 6 caracteres.';
    }
    if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
      return 'E-mail ou senha incorretos.';
    }
    if (lower.includes('email not confirmed')) {
      return 'Por favor, confirme seu e-mail antes de fazer login.';
    }
    return errMsg;
  };

  const handleResendConfirmation = async () => {
    setResendLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { error } = await supabase.auth.signUp({ 
        email: registeredEmail, 
        password: password,
        options: {
          emailRedirectTo: getAppRedirectUrl(),
          data: {
            full_name: name.trim() || (registeredEmail || '').split('@')[0]
          }
        }
      });
      if (error) throw error;
      setSuccessMsg('Uhu! Reenviamos o e-mail de confirmação com um novo link!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao reenviar e-mail de confirmação.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!email || !password) {
      setErrorMsg('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Verificação prévia de bloqueio
      const isPreBlocked = await isAccountBlocked({ email: cleanEmail });
      if (isPreBlocked) {
        const reason = await fetchAccountBlockReason({ email: cleanEmail });
        setErrorMsg(`Esta conta foi bloqueada pelo administrador. Motivo: "${reason}". Acesso negado e revogado.`);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (error) {
        throw error;
      }

      if (data && data.user) {
        const isPostBlocked = await isAccountBlocked({ id: data.user.id, email: cleanEmail });
        if (isPostBlocked) {
          await supabase.auth.signOut();
          const reason = await fetchAccountBlockReason({ id: data.user.id, email: cleanEmail });
          setErrorMsg(`Esta conta foi bloqueada pelo administrador. Motivo: "${reason}". Acesso negado e revogado.`);
          setLoading(false);
          return;
        }
      }

      // App.tsx handles onAuthStateChange, so we just navigate if success
      onNavigate('home');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('invalid login credentials')) {
        setErrorMsg('E-mail ou senha incorretos!');
      } else {
        setErrorMsg(msg || 'E-mail ou senha incorretos!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem!');
      setLoading(false);
      return;
    }

    try {
      const cleanEmail = email.trim().toLowerCase();

      // Verificação prévia se email já existe ou está bloqueado
      const isBlocked = await isAccountBlocked({ email: cleanEmail });
      if (isBlocked) {
        const reason = await fetchAccountBlockReason({ email: cleanEmail });
        setErrorMsg(`Esta conta/e-mail foi bloqueada pelo administrador. Motivo: "${reason}". Novos cadastros estão impedidos.`);
        setLoading(false);
        return;
      }

      try {
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();

        if (existingUser) {
          if (isUserRecordBlocked(existingUser)) {
            const reason = extractBlockReasonFromRecord(existingUser) || await fetchAccountBlockReason({ email: cleanEmail });
            setErrorMsg(`Esta conta/e-mail foi bloqueada pelo administrador. Motivo: "${reason}". Novos cadastros estão impedidos.`);
          } else {
            setErrorMsg('Este e-mail já está sendo utilizado ou encontra-se bloqueado.');
          }
          setLoading(false);
          return;
        }
      } catch (checkErr) {
        console.warn('Aviso verificação pré-cadastro:', checkErr);
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          emailRedirectTo: getAppRedirectUrl(),
          data: {
            full_name: name.trim()
          }
        }
      });

      if (error) {
        const lower = (error.message || '').toLowerCase();
        if (lower.includes('already registered') || lower.includes('already exists') || lower.includes('duplicate')) {
          throw new Error('Este e-mail já está sendo utilizado ou encontra-se bloqueado.');
        }
        throw error;
      }

      let activeSession = data?.session;
      if (!activeSession) {
        try {
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password
          });
          if (signInData?.session) {
            activeSession = signInData.session;
          }
        } catch {
          // Email confirmation is required by Supabase project
        }
      }

      if (activeSession && activeSession.user) {
        const isSessionBlocked = await isAccountBlocked({ id: activeSession.user.id, email: cleanEmail });
        if (isSessionBlocked) {
          await supabase.auth.signOut();
          setErrorMsg('Esta conta/e-mail foi bloqueada pelo administrador e está impedida de criar novos acessos.');
          setLoading(false);
          return;
        }

        const loggedUser: User = {
          id: activeSession.user.id,
          name: name.trim() || activeSession.user.user_metadata?.full_name || cleanEmail.split('@')[0],
          email: cleanEmail,
          avatarUrl: '',
          bio: '',
          education: 'Ensino Médio em andamento',
          experience: 'Nenhuma registrada',
          phone: '',
          skills: [],
          favorites: []
        };

        try {
          await supabase.from('users').upsert({
            id: activeSession.user.id,
            name: loggedUser.name,
            email: loggedUser.email,
            education: 'Ensino Médio em andamento',
            experience: 'Nenhuma registrada',
            phone: '',
            skills: []
          }, { onConflict: 'id' });
        } catch (dbErr) {
          console.warn('Erro ao registrar perfil no banco:', dbErr);
        }

        setSuccessMsg('Cadastro realizado com sucesso!');
        onSetUser(loggedUser);
        setTimeout(() => {
          onNavigate('home');
        }, 500);
        return;
      }

      setRegisteredEmail(cleanEmail);
      setVerificationSent(true);
      setSuccessMsg('Conta criada! Enviamos um e-mail com o link de confirmação para ativar seu acesso.');
    } catch (err: any) {
      setErrorMsg(getFriendlyErrorMessage(err.message || 'Erro ao criar conta.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Informe o e-mail de cadastro para a recuperação.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: getAppRedirectUrl(),
      });

      if (error) {
        throw error;
      }

      setSuccessMsg('Se o e-mail existir, você receberá um link de recuperação em instantes!');
      setEmail('');
    } catch (err: any) {
      setErrorMsg(getFriendlyErrorMessage(err.message || 'Erro ao solicitar recuperação.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scroll px-6 py-6 bg-gradient-to-b from-[#eef7ff] to-white pb-10">
      {/* Back button */}
      <header className="mb-6">
        <button
          onClick={() => onNavigate('landing')}
          className="p-2.5 rounded-full bg-white hover:bg-gray-100 transition-colors shadow-sm text-gray-700 cursor-pointer"
          aria-label="Voltar para a página inicial"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </header>

      {/* Brand logo top spacing */}
      <div className="text-center flex flex-col items-center gap-2 mb-8 animate-fadeIn">
          <div className="w-32 h-32 bg-white flex items-center justify-center overflow-hidden rounded-3xl shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
            <img src={logo} alt="Oportuniza" className="w-full h-full object-cover object-center block" />
          </div>
        <h2 className="text-xl font-bold tracking-tight text-gray-950 font-sans">
          {currentScreen === 'login' && 'Seja bem-vindo de volta'}
          {currentScreen === 'register' && 'Crie sua conta gratuita'}
          {currentScreen === 'recover' && 'Recupere seus dados'}
        </h2>
        <p className="text-xs text-gray-500">
          {currentScreen === 'login' && 'Acesse suas vagas, cursos e histórico.'}
          {currentScreen === 'register' && 'Cadastre-se para iniciar a jornada profissional.'}
          {currentScreen === 'recover' && 'Te enviaremos as orientações por e-mail.'}
        </p>
      </div>

      {/* Dynamic forms */}
      <div className="bg-white p-6 rounded-[28px] shadow-[0_15px_35px_rgba(79,162,192,0.06)] border border-gray-100">
        {/* Error / Success alerts */}
        {errorMsg && (
          <div className={`mb-4 p-3.5 rounded-xl text-xs font-medium border ${
            errorMsg.toLowerCase().includes('bloquead') || errorMsg.includes('Motivo:')
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {errorMsg.toLowerCase().includes('bloquead') || errorMsg.includes('Motivo:') ? (
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-left">
                  <strong className="block text-rose-900 font-bold text-xs uppercase tracking-wide">Conta Bloqueada</strong>
                  <p className="text-rose-800 leading-relaxed font-normal">{errorMsg}</p>
                </div>
              </div>
            ) : (
              errorMsg
            )}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold border border-emerald-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 animate-bounce" />
            <span>{successMsg}</span>
          </div>
        )}

        {currentScreen === 'login' && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700" htmlFor="login-email">E-mail</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-700" htmlFor="login-password">Senha</label>
                <button
                  type="button"
                  onClick={() => onNavigate('recover')}
                  className="text-[10px] text-primary hover:underline font-semibold"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Insira sua senha"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-10 text-xs focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1.5 text-gray-400 hover:text-gray-600 rounded"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary select-none mt-2 text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Entrar no Oportuniza
            </button>

            <div className="text-center mt-2">
              <span className="text-[11px] text-gray-400">Não possui conta? </span>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="text-[11px] text-primary font-bold hover:underline"
              >
                Cadastre-se grátis
              </button>
            </div>
          </form>
        )}

        {currentScreen === 'register' && !verificationSent && (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700" htmlFor="reg-name">Nome Completo</label>
              <div className="relative flex items-center">
                <UserIcon className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  id="reg-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700" htmlFor="reg-email">E-mail Corporativo ou Pessoal</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700" htmlFor="reg-password">Crie uma Senha Forte</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 4 caracteres"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-10 text-xs focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700" htmlFor="reg-confirm-password">Confirme sua Senha</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  id="reg-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita sua senha"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-10 text-xs focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1.5 text-gray-400 hover:text-gray-600 rounded"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary select-none mt-2 text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar & Criar Conta
            </button>

            <div className="text-center mt-2">
              <span className="text-[11px] text-gray-400">Já é cadastrado? </span>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-[11px] text-primary font-bold hover:underline"
              >
                Fazer login
              </button>
            </div>
          </form>
        )}

        {currentScreen === 'register' && verificationSent && (
          <div className="flex flex-col items-center animate-fadeIn py-2 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 relative shadow-inner">
              <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25" />
              <Mail className="w-8 h-8 text-emerald-600 relative z-10" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Verifique sua caixa de entrada
            </h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Enviamos um e-mail de confirmação para ativar sua conta:
            </p>

            <div className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 mb-6 inline-flex justify-center items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-800 text-xs font-mono font-bold truncate">
                {registeredEmail}
              </span>
            </div>

            {/* Passos */}
            <div className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-left mb-6 space-y-3">
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-slate-800">Abra o e-mail recebido</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">
                    Procure a mensagem do <strong className="text-slate-700">Supabase Auth</strong> ("Confirm your email address").
                  </p>
                </div>
              </div>

              <div className="flex gap-2 border-t border-slate-100/70 pt-2 text-left">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-slate-800">Clique para confirmar</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">
                    Ao confirmar, você ativará seu perfil na base de dados.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl text-[10px] text-slate-600 text-left mb-6">
              💡 <b>Não encontrou?</b> Verifique sua aba de Spam ou Promoções.
            </div>

            <div className="w-full space-y-2">
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resendLoading}
                className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-[11px]"
              >
                {resendLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
                ) : (
                  <span>Reenviar link de confirmação</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setVerificationSent(false);
                  onNavigate('login');
                }}
                className="w-full text-slate-400 hover:text-slate-600 text-[11px] font-semibold py-2"
              >
                Voltar ao login
              </button>
            </div>
          </div>
        )}

        {currentScreen === 'recover' && (
          <form onSubmit={handleRecoverySubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">Informe seu E-mail</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="emaildocadastro@provedor.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold shadow-md active:scale-95 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Processando...' : 'Enviar Instruções'}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => onNavigate('login')}
              className="w-full px-6 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
            >
              Voltar ao Login
            </button>
          </form>
        )}
      </div>

      {/* Visual notice */}
      <div className="mt-8 text-center px-4">
        <p className="text-[10px] text-gray-400 leading-normal">
          Dica rápida: Para fins de teste e demonstração rápida de banca, use o login padrão pré-cadastrado abaixo:
          <br />
          <strong className="text-primary font-mono select-all">pedroorchel12@gmail.com</strong> com senha <strong className="text-primary font-mono select-all">123</strong>
        </p>
      </div>
    </div>
  );
}
