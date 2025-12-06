// src/routes/AuthRegister.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Lock, Sparkles } from 'lucide-react';
import InteractiveTilesBackground from '@/components/layout/InteractiveTilesBackground';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { validatePassword } from '@/lib/passwordValidation';

const AuthRegister = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const passwordValidation = validatePassword(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !email || !password) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    if (!passwordValidation.isValid) {
      toast({
        title: 'Senha não atende aos requisitos',
        description: 'A senha deve ter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula e um número.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome: nome,
          },
        },
      });

      if (error) {
        let message = error.message;
        if (error.message.includes('already registered')) {
          message = 'Este email já está cadastrado. Tente fazer login.';
        }
        toast({
          title: 'Erro ao cadastrar',
          description: message,
          variant: 'destructive',
        });
        return;
      }

      if (data.user) {
        localStorage.removeItem('saaslp_onboarding_completed');
        localStorage.removeItem('saaslp_editor_tour_completed');

        toast({
          title: 'Conta criada com sucesso!',
          description: 'Redirecionando...',
        });

        navigate('/onboarding');
      }
    } catch {
      toast({
        title: 'Erro ao cadastrar',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* mesmo fundo da tela de login (blocos + spotlight) */}
      <InteractiveTilesBackground />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[320px] sm:max-w-[340px] md:max-w-[360px]"
        >
          <div className="glass-card px-5 py-6 sm:px-6 sm:py-7 border border-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
            {/* Header */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/85 shadow-[0_10px_30px_rgba(15,23,42,0.18)] flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-slate-800" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                Crie sua conta
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Comece a criar suas páginas em poucos minutos.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label
                  htmlFor="nome"
                  className="block text-xs font-medium mb-1.5 text-slate-800"
                >
                  Nome
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="input-field pl-10 h-11 text-sm"
                    required
                  />
                </div>
              </div>

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
                    minLength={8}
                  />
                </div>
                <PasswordStrengthIndicator password={password} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full gap-2 mt-3 h-11 text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar conta'
                )}
              </button>
            </form>

            {/* Link para login */}
            <div className="mt-4 text-center">
              <p className="text-xs sm:text-sm text-slate-600">
                Já tem uma conta?{' '}
                <Link
                  to="/auth/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthRegister;
