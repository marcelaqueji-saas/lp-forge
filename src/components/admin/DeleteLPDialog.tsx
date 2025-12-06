import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, Loader2, AlertTriangle } from 'lucide-react';
import { deleteLP, LandingPage } from '@/lib/lpContentApi';
import { toast } from '@/hooks/use-toast';

interface DeleteLPDialogProps {
  lp: LandingPage;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export const DeleteLPDialog = ({ lp, isOpen, onClose, onDeleted }: DeleteLPDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== lp.nome) {
      toast({ title: 'Digite o nome exato da LP para confirmar', variant: 'destructive' });
      return;
    }

    setLoading(true);

    const success = await deleteLP(lp.id);

    if (success) {
      toast({ title: 'LP excluída com sucesso!' });
      onDeleted();
      onClose();
    } else {
      toast({ title: 'Erro ao excluir LP', variant: 'destructive' });
    }

    setLoading(false);
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
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Excluir Landing Page</h2>
                <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-4">
              <p className="text-sm">
                Você está prestes a excluir permanentemente a LP <strong>"{lp.nome}"</strong> e todos os seus dados associados:
              </p>
              <ul className="text-sm mt-2 space-y-1 text-muted-foreground">
                <li>• Todo o conteúdo das seções</li>
                <li>• Configurações e estilos</li>
                <li>• Todos os leads capturados</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Digite <strong>"{lp.nome}"</strong> para confirmar
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="input-field"
                  placeholder={lp.nome}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading || confirmText !== lp.nome}
                  className="flex-1 px-4 py-2 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2 inline" />
                      Excluir LP
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