// src/pages/marketing/InteresseNoBron.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Mail, Building2 } from 'lucide-react';
import InteractiveTilesBackground from '@/components/layout/InteractiveTilesBackground';

const panelVariants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.98 },
};

const InteresseNoBron = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    negocio: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nome.trim() || !form.email.trim()) {
      toast({
        title: 'Preencha nome e e-mail',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await (supabase as any)
        .from('nobron_waiting_list')
        .insert({
          nome: form.nome.trim(),
          email: form.email.trim(),
          negocio: form.negocio.trim() || null,
        });

      if (error) {
        toast({
          title: 'Erro ao enviar',
          description: 'Tente novamente em alguns instantes.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Cadastro recebido com sucesso',
        description: 'Você será priorizada quando abrirmos novas contas.',
      });

      setForm({ nome: '', email: '', negocio: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 🔹 Mesmo fundo do login */}
      <InteractiveTilesBackground />

      {/* 🔹 Container central com o mesmo grid do AuthLogin */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.98 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full max-w-[360px] sm:max-w-[420px] md:max-w-[520px]"
        >
          <div className="glass-card px-5 py-6 sm:px-6 sm:py-7 border border-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
            {/* Header – mesmo estilo do login, com copy de interesse */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/85 shadow-[0_10px_30px_rgba(15,23,42,0.18)] flex items-center justify-center mx-auto mb-3">
  <img
    src="/logo.svg"
    alt="noBRon"
    className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
  />
</div>


              <motion.h1
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900"
              >
                Lista interna de interesse noBRon
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="text-xs sm:text-sm text-slate-600 mt-1"
              >
                Neste momento, o noBRon está em uso interno e com acesso
                controlado. Deixe seus dados para ser avisada nas próximas
                <br></br>aberturas de conta e ciclos de teste.
              </motion.p>

              <div className="mt-4 inline-flex items-center rounded-full bg-white/70 backdrop-blur border border-white px-2 py-1 text-[11px] text-slate-700 shadow-sm">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Em operação real
                </span>
                <span className="px-2 py-0.5">
                  Acesso liberado por lotes priorizados
                </span>
              </div>
            </div>

            {/* Form – usando a mesma linguagem visual do login */}
            <motion.form
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onSubmit={handleSubmit}
              className="space-y-3"
            >
              <div>
                <label
                  htmlFor="nome"
                  className="block text-xs font-medium mb-1.5 text-slate-800"
                >
                  Nome
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="nome"
                    value={form.nome}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nome: e.target.value }))
                    }
                    placeholder="Como podemos te chamar?"
                    required
                    className="input-field pl-10 h-11 text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium mb-1.5 text-slate-800"
                >
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="seu@email.com"
                    required
                    className="input-field pl-10 h-11 text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="negocio"
                  className="block text-xs font-medium mb-1.5 text-slate-800"
                >
                  Tipo de negócio / uso pretendido
                </label>
                <div className="relative">
                  <Textarea
                    id="negocio"
                    rows={3}
                    value={form.negocio}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, negocio: e.target.value }))
                    }
                    placeholder="Ex.: agência que quer white-label, consultório, infoproduto, SaaS, etc."
                    className="input-field min-h-[90px] text-sm resize-none"
                  />
                </div>
              </div>

              <Button
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
                  'Entrar na lista de interesse'
                )}
              </Button>

              <p className="mt-2 text-[10px] leading-relaxed text-slate-500 text-center">
                Usaremos seu contato apenas para comunicações estratégicas
                sobre acesso, roadmap e oportunidades de teste controlado do
                noBRon. Sem spam.
              </p>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InteresseNoBron;
