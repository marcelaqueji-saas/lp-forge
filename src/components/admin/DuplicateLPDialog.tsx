import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, X, Loader2 } from 'lucide-react';
import { duplicateLP, LandingPage } from '@/lib/lpContentApi';
import { toast } from '@/hooks/use-toast';

interface DuplicateLPDialogProps {
  sourceLP: LandingPage;
  isOpen: boolean;
  onClose: () => void;
  onDuplicated: (newLP: LandingPage) => void;
}

export const DuplicateLPDialog = ({ sourceLP, isOpen, onClose, onDuplicated }: DuplicateLPDialogProps) => {
  const [name, setName] = useState(`${sourceLP.nome} (cópia)`);
  const [slug, setSlug] = useState(`${sourceLP.slug}-copia`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDuplicate = async () => {
    if (!name.trim() || !slug.trim()) {
      setError('Nome e slug são obrigatórios');
      return;
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      setError('Slug deve conter apenas letras minúsculas, números e hífens');
      return;
    }

    setLoading(true);
    setError('');

    const newLP = await duplicateLP(sourceLP.id, name.trim(), slug.trim());

    if (newLP) {
      toast({ title: 'LP duplicada com sucesso!' });
      onDuplicated(newLP);
      onClose();
    } else {
      setError('Erro ao duplicar LP. O slug pode já estar em uso.');
    }

    setLoading(false);
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-card rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Copy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Duplicar Landing Page</h2>
                <p className="text-sm text-muted-foreground">Criar uma cópia de "{sourceLP.nome}"</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome da nova LP</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="input-field"
                  placeholder="Nome da landing page"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Slug (URL)</label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    className="input-field"
                    placeholder="slug-da-lp"
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
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDuplicate}
                  disabled={loading}
                  className="flex-1 btn-primary"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Duplicando...
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicar
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};