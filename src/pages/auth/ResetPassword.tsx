import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Lock, KeyRound, CheckCircle } from 'lucide-react';
import InteractiveTilesBackground from '@/components/layout/InteractiveTilesBackground';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { isPasswordValid } from '@/lib/passwordValidation';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has a valid reset session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Link expirado',
          description: 'Solicite um novo link de redefinição de senha.',
          variant: 'destructive',
        });
        navigate('/reset-password-request');
        return;
      }
      
      setCheckingSession(false);
    };

    // Handle auth state changes (for when user clicks email link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setCheckingSession(false);
      }
    });

    checkSession();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid(password)) {
      toast({
        title: 'Senha inválida',
        description: 'A senha não atende aos requisitos mínimos.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Senhas diferentes',
        description: 'A confirmação de senha não confere.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast({
          title: 'Erro ao redefinir senha',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setSuccess(true);
      toast({
        title: 'Senha redefinida!',
        description: 'Sua nova senha foi salva com sucesso.',
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    } catch {
      toast({
        title: 'Erro ao redefinir senha',
        description: 'Ocorreu um erro. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <InteractiveTilesBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="glass-card px-8 py-6">
            <Loader2 className="w-8 h-8 animate-spin text-slate-600 mx-auto" />
            <p className="text-sm text-slate-600 mt-3">Verificando sessão...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <InteractiveTilesBackground />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full max-w-[320px] sm:max-w-[340px] md:max-w-[360px]"
        >
          <div className="glass-card px-5 py-6 sm:px-6 sm:py-7 border border-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
            <div className="text-center mb-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/85 shadow-[0_10px_30px_rgba(15,23,42,0.18)] flex items-center justify-center mx-auto mb-3">
                {success ? (
                  <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
                ) : (
                  <KeyRound className="w-6 h-6 sm:w-7 sm:h-7 text-slate-800" />
                )}
              </div>

              <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                {success ? 'Senha redefinida!' : 'Nova senha'}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {success
                  ? 'Você será redirecionado para o login.'
                  : 'Crie uma senha forte para sua conta.'}
              </p>
            </div>

            {success ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm text-green-800 text-center">
                  Redirecionando para o login...
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium mb-1.5 text-slate-800"
                  >
                    Nova senha
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
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {password && <PasswordStrengthIndicator password={password} />}

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-xs font-medium mb-1.5 text-slate-800"
                  >
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field pl-10 h-11 text-sm"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive mt-1">
                      As senhas não conferem
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !isPasswordValid(password) || password !== confirmPassword}
                  className="btn-primary w-full gap-2 mt-3 h-11 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar nova senha'
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
