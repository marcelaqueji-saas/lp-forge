// src/routes/AuthLogin.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Lock, Mail, LogIn, RotateCcw } from 'lucide-react';
import { getUserFirstLP } from '@/lib/userApi';
import InteractiveTilesBackground from '@/components/layout/InteractiveTilesBackground';

type AuthMode = 'login' | 'reset';

const panelVariants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.98 },
};

const AuthLogin = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        handlePostLogin();
      }
    };

    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePostLogin = async () => {
    const onboardingCompleted =
      localStorage.getItem('saaslp_onboarding_completed') === 'true';

    if (onboardingCompleted) {
      navigate('/painel');
    } else {
      const userLP = await getUserFirstLP();
      if (userLP) {
        navigate(`/meu-site/${userLP.id}`);
      } else {
        navigate('/onboarding');
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = error.message;
        
        // Handle specific error cases
        if (error.message === 'Invalid login credentials') {
          errorMessage = 'Email ou senha incorretos';
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          toast({
            title: 'Email não confirmado',
            description: 'Verifique sua caixa de entrada e clique no link de confirmação antes de fazer login.',
            variant: 'destructive',
          });
          return;
        }
        
        toast({
          title: 'Erro ao entrar',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }

      toast({ title: 'Login realizado com sucesso!' });
      await handlePostLogin();
    } catch {
      toast({
        title: 'Erro ao entrar',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: 'Informe seu email',
        description: 'Vamos enviar um link de redefinição para você.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: 'Erro ao enviar link',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Verifique seu email',
        description: 'Enviamos um link para redefinir sua senha.',
      });
      setMode('login');
    } catch {
      toast({
        title: 'Erro ao enviar link',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 🔹 Fundo com blocos glass + spotlight (mesmo do Admin/Login Register) */}
      <InteractiveTilesBackground />

      {/* 🔹 Container central com card glass claro */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.98 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full max-w-[320px] sm:max-w-[340px] md:max-w-[360px]"
        >
          <div className="glass-card px-5 py-6 sm:px-6 sm:py-7 border border-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
            {/* Header */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/85 shadow-[0_10px_30px_rgba(15,23,42,0.18)] flex items-center justify-center mx-auto mb-3">
                {mode === 'login' ? (
                  <LogIn className="w-6 h-6 sm:w-7 sm:h-7 text-slate-800" />
                ) : (
                  <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7 text-slate-800" />
                )}
              </div>

              <motion.h1
                key={mode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900"
              >
                {mode === 'login' ? 'Bem-vindo de volta' : 'Redefinir senha'}
              </motion.h1>

              <motion.p
                key={mode + '-subtitle'}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="text-xs sm:text-sm text-slate-600 mt-1"
              >
                {mode === 'login'
                  ? 'Entre para acessar seu painel.'
                  : 'Digite seu email para receber o link de redefinição.'}
              </motion.p>

              {/* Toggle Entrar / Esqueci a senha – versão clara */}
              <div className="mt-4 inline-flex items-center rounded-full bg-white/70 backdrop-blur border border-white px-1 py-1 text-[11px] text-slate-700 shadow-sm">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    mode === 'login'
                      ? 'bg-slate-900 text-white font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    mode === 'reset'
                      ? 'bg-slate-900 text-white font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Esqueci a senha
                </button>
              </div>
            </div>

            {/* Forms com transição suave */}
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.form
                  key="login-form"
                  variants={panelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  onSubmit={handleLogin}
                  className="space-y-3"
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium mb-1.5 text-slate-800"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="input-field pl-10 h-11 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs font-medium mb-1.5 text-slate-800"
                    >
                      Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-field pl-10 h-11 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full gap-2 mt-3 h-11 text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="reset-form"
                  variants={panelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  onSubmit={handleResetPassword}
                  className="space-y-3"
                >
                  <div>
                    <label
                      htmlFor="reset-email"
                      className="block text-xs font-medium mb-1.5 text-slate-800"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="input-field pl-10 h-11 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full gap-2 mt-3 h-11 text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando link...
                      </>
                    ) : (
                      'Enviar link de redefinição'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-full text-xs text-slate-600 hover:text-slate-900 mt-1 underline underline-offset-4"
                  >
                    Voltar para login
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="mt-4 text-center space-y-2">
              <p className="text-xs sm:text-sm text-slate-600">
                Não tem uma conta?{' '}
                <Link
                  to="/auth/register"
                  className="font-semibold text-primary hover:underline"
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLogin;
