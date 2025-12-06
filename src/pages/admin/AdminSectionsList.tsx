import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { getLPById, getSettings, getUserRoleForLP, LandingPage, LPSettings, LPRole } from '@/lib/lpContentApi';
import { Loader2, ArrowLeft, Shield } from 'lucide-react';
import { SortableSections } from '@/components/admin/SortableSections';

const AdminSectionsList = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lp, setLp] = useState<LandingPage | null>(null);
  const [settings, setSettings] = useState<LPSettings>({});
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<LPRole | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }

      if (!id) return;

      const [lpData, settingsData, role] = await Promise.all([
        getLPById(id),
        getSettings(id),
        getUserRoleForLP(id),
      ]);

      setLp(lpData);
      setSettings(settingsData);
      setUserRole(role);
      setLoading(false);
    };

    checkAuth();
  }, [id, navigate]);

  const canEdit = userRole === 'owner' || userRole === 'editor';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lp) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Landing page não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 rounded-xl hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-semibold">{lp.nome}</h1>
              <p className="text-sm text-muted-foreground">Seções (arraste para reordenar)</p>
            </div>
          </div>
          {userRole && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm">
              <Shield className="w-4 h-4" />
              {userRole === 'owner' ? 'Proprietário' : userRole === 'editor' ? 'Editor' : 'Visualizador'}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SortableSections
            lpId={id!}
            settings={settings}
            onSettingsChange={setSettings}
            canEdit={canEdit}
          />
        </motion.div>
      </main>
    </div>
  );
};

export default AdminSectionsList;