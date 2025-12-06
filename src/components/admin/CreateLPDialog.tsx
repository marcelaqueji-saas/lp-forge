import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Loader2, Rocket, BookOpen } from 'lucide-react';
import { createLPFromTemplate, LandingPage } from '@/lib/lpContentApi';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreateLPDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newLP: LandingPage) => void;
}

type Template = 'conversao_direta' | 'lead_magnet' | 'vazio';

const templates: { id: Template; name: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'conversao_direta',
    name: 'Conversão Direta',
    description: 'LP focada em vendas com Hero, Benefícios, Planos, FAQ e CTA forte',
    icon: <Rocket className="w-6 h-6" />,
  },
  {
    id: 'lead_magnet',
    name: 'Lead Magnet',
    description: 'LP para captura de leads com oferta de eBook ou material gratuito',
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    id: 'vazio',
    name: 'Em branco',
    description: 'Comece do zero com uma LP vazia',
    icon: <Plus className="w-6 h-6" />,
  },
];

export const CreateLPDialog = ({ isOpen, onClose, onCreated }: CreateLPDialogProps) => {
  const [step, setStep] = useState<'template' | 'details'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<Template>('conversao_direta');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim()) {
      setError('Nome e slug são obrigatórios');
      return;
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      setError('Slug deve conter apenas letras minúsculas, números e hífens');
      return;
    }

    setLoading(true);
    setError('');

    let newLP: LandingPage | null = null;

    if (selectedTemplate === 'vazio') {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError('Você precisa estar logado');
        setLoading(false);
        return;
      }

      const { data, error: createError } = await supabase
        .from('landing_pages')
        .insert({
          nome: name.trim(),
          slug: slug.trim(),
          publicado: false,
          owner_id: session.user.id,
        })
        .select()
        .single();

      if (createError || !data) {
        setError('Erro ao criar LP. O slug pode já estar em uso.');
        setLoading(false);
        return;
      }

      newLP = data;
    } else {
      newLP = await createLPFromTemplate(name.trim(), slug.trim(), selectedTemplate);
      
      if (!newLP) {
        setError('Erro ao criar LP. O slug pode já estar em uso.');
        setLoading(false);
        return;
      }
    }

    toast({ title: 'LP criada com sucesso!' });
    onCreated(newLP);
    handleClose();
  };

  const handleClose = () => {
    setStep('template');
    setSelectedTemplate('conversao_direta');
    setName('');
    setSlug('');
    setError('');
    setLoading(false);
    onClose();
  };

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(generateSlug(value));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-card rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {step === 'template' ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">Escolha um template</h2>
                    <p className="text-sm text-muted-foreground">Comece com um modelo pronto ou do zero</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedTemplate === template.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          selectedTemplate === template.id ? 'bg-primary/10 text-primary' : 'bg-muted'
                        }`}>
                          {template.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setStep('details')}
                  className="w-full btn-primary"
                >
                  Continuar
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">Detalhes da LP</h2>
                    <p className="text-sm text-muted-foreground">
                      Template: {templates.find(t => t.id === selectedTemplate)?.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome da LP</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="input-field"
                      placeholder="Minha Landing Page"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Slug (URL)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">/lp/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase())}
                        className="input-field"
                        placeholder="minha-lp"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Apenas letras minúsculas, números e hífens
                    </p>
                  </div>

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setStep('template')}
                      className="flex-1 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={loading}
                      className="flex-1 btn-primary"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Criar LP
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};