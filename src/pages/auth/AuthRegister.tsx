// src/routes/AuthRegister.tsx
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import InteractiveTilesBackground from '@/components/layout/InteractiveTilesBackground';
import logo from '@/assets/logo.svg';

const AuthRegister = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Mesmo fundo da tela de login (blocos + spotlight) */}
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
                <img
                  src={logo}
                  alt="Logo"
                  className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
                />
              </div>

              <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                Abertura de contas fechada
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Em breve lançaremos a plataforma. Atualmente o noBRon está em uso
                restrito pela equipe interna da empresa.
              </p>
            </div>

            {/* Bloco informativo */}
            <div className="rounded-xl border border-slate-200/70 bg-white/80 backdrop-blur px-4 py-3 mb-4 flex gap-3">
              <div className="mt-0.5">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-700">
                  Estamos utilizando o noBRon em operação real para estruturar
                  processos, templates e automações antes de abrir novas contas.
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Se quiser ser avisado quando liberarmos acesso externo,
                  você pode registrar seu interesse.
                </p>
              </div>
            </div>

            {/* Ações */}
            <div className="space-y-2">
              <button
                type="button"
                className="btn-primary w-full h-11 text-sm"
                onClick={() => navigate('/')}
              >
                Voltar para o site
              </button>

              <button
                type="button"
                className="btn-secondary w-full h-11 text-sm"
                onClick={() => navigate('/interesse-nobron')}
              >
                Quero ser avisado quando abrir
              </button>
            </div>

            {/* Link para login (uso interno) */}
            <div className="mt-4 text-center">
              <p className="text-xs sm:text-sm text-slate-600">
                Já faz parte da equipe?{' '}
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
