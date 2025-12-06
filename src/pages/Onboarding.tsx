import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Wand2, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserFirstLP, createUserFirstLP, createEmptyLP } from '@/lib/userApi';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { UpgradeModal } from '@/components/client/UpgradeModal';

const Onboarding = () => {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [creatingEmpty, setCreatingEmpty] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, isAdminMaster, canCreateSite, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      checkUserStatus();
    }
  }, [authLoading]);

  const checkUserStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth/login');
      return;
    }

    // Admin master goes to master panel
    if (isAdminMaster) {
      navigate('/master');
      return;
    }

    // Check if user already has LP
    const existingLP = await getUserFirstLP();
    
    if (existingLP) {
      // Go directly to dashboard or editor
      navigate('/painel');
      return;
    }

    setLoading(false);
  };

  const handleEditTemplate = async () => {
    if (!canCreateSite) {
      setUpgradeOpen(true);
      return;
    }

    setCreating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userName = session?.user?.user_metadata?.nome || '';
      
      const newLP = await createUserFirstLP(userName);
      
      if (newLP) {
        toast({ title: 'Página criada!', description: 'Vamos personalizar juntos.' });
        navigate(`/meu-site/${newLP.id}`);
      } else {
        toast({ title: 'Erro', description: 'Não foi possível criar sua página.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleBuildFromScratch = async () => {
    if (!canCreateSite) {
      setUpgradeOpen(true);
      return;
    }

    setCreatingEmpty(true);
    
    try {
      const newLP = await createEmptyLP();
      
      if (newLP) {
        toast({ title: 'Página criada!', description: 'Vamos montar sua estrutura.' });
        navigate(`/meu-site/${newLP.id}/construtor`);
      } else {
        toast({ title: 'Erro', description: 'Não foi possível criar sua página.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setCreatingEmpty(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8 md:mb-10">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl gradient-bg flex items-center justify-center mx-auto mb-4 md:mb-6">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
            Vamos criar sua página!
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto px-2">
            Escolha como você quer começar. Você pode editar tudo depois.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Option 1: Edit template */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : -20, y: isMobile ? 20 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div 
              className="glass-card p-5 md:p-6 h-full cursor-pointer hover:shadow-lg active:scale-[0.98] transition-all border-2 border-transparent hover:border-primary"
              onClick={handleEditTemplate}
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                <Wand2 className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Editar template pronto</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
                Comece com um modelo profissional e personalize textos, cores e imagens.
              </p>
              <Button 
                onClick={handleEditTemplate}
                disabled={creating}
                className="w-full h-10 md:h-11"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Criando...
                  </>
                ) : (
                  'Começar agora'
                )}
              </Button>
            </div>
          </motion.div>

          {/* Option 2: Build from scratch */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : 20, y: isMobile ? 20 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div 
              className="glass-card p-5 md:p-6 h-full cursor-pointer hover:shadow-lg active:scale-[0.98] transition-all border-2 border-transparent hover:border-muted"
              onClick={handleBuildFromScratch}
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-muted flex items-center justify-center mb-3 md:mb-4">
                <FileText className="w-6 h-6 md:w-7 md:h-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Construir do zero</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
                Monte sua página passo a passo, escolhendo cada seção.
              </p>
              <Button 
                variant="outline"
                onClick={handleBuildFromScratch}
                disabled={creatingEmpty}
                className="w-full h-10 md:h-11"
              >
                {creatingEmpty ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Criando...
                  </>
                ) : (
                  'Montar do zero'
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="criar mais sites"
        currentPlan={profile?.plan as any || 'free'}
        requiredPlan="pro"
      />
    </div>
  );
};

export default Onboarding;