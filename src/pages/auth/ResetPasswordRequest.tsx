import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Mail, RotateCcw, CheckCircle, ArrowLeft } from 'lucide-react';
import InteractiveTilesBackground from '@/components/layout/InteractiveTilesBackground';

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: 'Informe seu email',
        description: 'Digite o email da sua conta para receber o link.',
        variant: 'destructive',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Email inválido',
        description: 'Digite um endereço de email válido.',
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

      setSent(true);
      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada (e spam) para redefinir sua senha.',
      });
    } catch {
      toast({
        title: 'Erro ao enviar link',
        description: 'Ocorreu um erro. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setSent(false);
    setEmail('');
  };

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
                {sent ? (
                  <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
                ) : (
                  <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7 text-slate-800" />
                )}
              </div>

              <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                {sent ? 'Verifique seu email' : 'Esqueceu a senha?'}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {sent
                  ? 'Enviamos um link de redefinição para seu email.'
                  : 'Digite seu email para receber o link de redefinição.'}
              </p>
            </div>

            {sent ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-800 text-center">
                    Verifique sua caixa de entrada e a pasta de spam.
                    O link expira em 1 hora.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResend}
                  className="w-full text-sm text-slate-600 hover:text-slate-900 underline underline-offset-4"
                >
                  Não recebeu? Tentar novamente
                </button>

                <Link
                  to="/auth/login"
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-3 h-11 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResetRequest} className="space-y-3">
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
                      autoComplete="email"
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
                      Enviando...
                    </>
                  ) : (
                    'Enviar link de redefinição'
                  )}
                </button>

                <Link
                  to="/auth/login"
                  className="w-full text-xs text-slate-600 hover:text-slate-900 mt-2 underline underline-offset-4 block text-center"
                >
                  Voltar para login
                </Link>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordRequest;
