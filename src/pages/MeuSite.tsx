import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  getLPById,
  getAllContent,
  getSettings,
  getUserRoleForLP,
  LPContent,
  LPSettings,
} from '@/lib/lpContentApi';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { BlockEditor } from '@/components/editor/BlockEditor';
import { useAuth } from '@/hooks/useAuth';
import type { PlanTier } from '@/lib/authApi';
import type { PlanLevel, PlanLevelWithMaster } from '@/lib/sectionModels';

const MeuSite = () => {
  const { lpId } = useParams();
  const navigate = useNavigate();
  const { profile, isAdminMaster } = useAuth();

  const [loading, setLoading] = useState(true);
  const [lpData, setLpData] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndLoad();
  }, [lpId]);

  const checkAuthAndLoad = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate('/auth/login');
      return;
    }

    if (!lpId) {
      navigate('/painel');
      return;
    }

    // Check user role for this LP
    const role = await getUserRoleForLP(lpId);
    
    // Admin master always has access
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle();
    
    const isAdmin = roleData?.role === 'admin_master';
    
    if (!role && !isAdmin) {
      toast({ title: 'Acesso negado', variant: 'destructive' });
      navigate('/painel');
      return;
    }
    setUserRole(isAdmin ? 'owner' : role);

    // Load LP data
    await loadLP();
  };

  const loadLP = async () => {
    if (!lpId) return;

    setLoading(true);

    const lp = await getLPById(lpId);

    if (!lp) {
      toast({ title: 'LP não encontrada', variant: 'destructive' });
      navigate('/painel');
      return;
    }

    setLpData(lp);
    setLoading(false);
  };

  const handlePublish = async () => {
    if (!lpId) return;

    const { error } = await supabase
      .from('landing_pages')
      .update({ publicado: true })
      .eq('id', lpId);

    if (error) {
      toast({ title: 'Erro ao publicar', variant: 'destructive' });
    } else {
      setLpData((prev: any) => ({ ...prev, publicado: true }));
      toast({
        title: 'Página publicada!',
        description: 'Sua página está no ar.',
      });
    }
  };

  const handleViewPublic = () => {
    if (lpData?.slug) {
      window.open(`/lp/${lpData.slug}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="section-padding">
          <div className="section-container">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-16 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const canEdit = userRole === 'owner' || userRole === 'editor';
  
  // CRITICAL: Se o usuário é admin_master, usar plano "master" com tudo liberado
  // Caso contrário, usar o plano do profile
  const userPlan: PlanLevelWithMaster = isAdminMaster 
    ? 'master' 
    : ((profile?.plan as PlanLevel) || 'free');

  if (!canEdit) {
    toast({ title: 'Você não tem permissão para editar esta página', variant: 'destructive' });
    navigate('/painel');
    return null;
  }

  return (
    <BlockEditor
      lpId={lpId!}
      lpData={{
        nome: lpData?.nome || 'Minha Página',
        slug: lpData?.slug || '',
        publicado: lpData?.publicado || false,
      }}
      userPlan={userPlan}
      onPublish={handlePublish}
      onViewPublic={handleViewPublic}
    />
  );
};

export default MeuSite;
