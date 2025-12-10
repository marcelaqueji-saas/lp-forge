/**
 * Profile Page - Perfil do Cliente (Sprint 3)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Building2,
  Lock,
  Crown,
  ArrowLeft,
  Camera,
  Loader2,
  Check,
  HardDrive,
  LayoutGrid,
  Globe,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PLAN_INFO, getEffectivePlanLimits, type PlanLimits } from '@/lib/billingApi';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, isAdminMaster } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  
  // Form state
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [organization, setOrganization] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // [S4.4 QA] Log profile load
  console.log('[S4.4 QA] Profile loaded:', { isAdminMaster, plan: profile?.plan });

  useEffect(() => {
    loadLimits();
  }, []);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
    }
  }, [profile]);

  const loadLimits = async () => {
    setLoading(true);
    try {
      const data = await getEffectivePlanLimits();
      setLimits(data);
    } catch (error) {
      console.error('Error loading limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: displayName,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast.success('Perfil atualizado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não conferem');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar senha');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 2MB.');
      return;
    }

    setSaving(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `avatars/${user.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('lp-media')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('lp-media')
        .getPublicUrl(path);

      setAvatarUrl(publicUrl);
      toast.success('Avatar atualizado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer upload');
    } finally {
      setSaving(false);
    }
  };

  // [S4.4] Master plan override
  const currentPlan = isAdminMaster ? 'master' : (limits?.plan || profile?.plan || 'free');
  const planInfo = isAdminMaster 
    ? { name: 'Master', price: '∞', period: '', features: ['Acesso total', 'LPs ilimitadas', 'Armazenamento ilimitado', 'Todos os recursos'] }
    : PLAN_INFO[currentPlan as keyof typeof PLAN_INFO];
  const storageUsed = profile?.storage_used_mb || 0;
  const storageLimit = isAdminMaster ? 999999 : (limits?.max_storage_mb || 50);
  const storagePercent = isAdminMaster ? 0 : Math.min((storageUsed / storageLimit) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/painel')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-lg font-semibold">Meu Perfil</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Avatar & Name Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-2xl bg-primary/10">
                    {displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <h2 className="text-xl font-semibold">{displayName || 'Sem nome'}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge variant="secondary" className="gap-1">
                  <Crown className="w-3 h-3" />
                  Plano {planInfo?.name || 'Free'}
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Plan & Usage Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Plano e Uso
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Current Plan */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{planInfo?.name}</span>
                    <span className="text-lg font-bold">{planInfo?.price}{planInfo?.period}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {planInfo?.features.slice(0, 4).map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-3 h-3 text-primary" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hide upgrade button for Master users */}
                {!isAdminMaster && currentPlan !== 'premium' && (
                  <Button
                    onClick={() => navigate('/upgrade')}
                    className="w-full"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Fazer Upgrade
                  </Button>
                )}
              </div>

              {/* Usage Stats - Hide for Master */}
              {!isAdminMaster && (
                <div className="space-y-4">
                  {/* Storage */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-muted-foreground" />
                        Armazenamento
                      </div>
                      <span className="text-muted-foreground">
                        {storageUsed}MB / {storageLimit}MB
                      </span>
                    </div>
                    <Progress value={storagePercent} className="h-2" />
                  </div>

                  {/* Sites */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                        Landing Pages
                      </div>
                      <span className="text-muted-foreground">
                        - / {limits?.max_sites || 1}
                      </span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>

                  {/* Domains */}
                  <div className="flex items-center justify-between text-sm py-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      Domínios personalizados
                    </div>
                    <span className="text-muted-foreground">
                      {limits?.custom_domain_limit === 0 
                        ? 'Não disponível' 
                        : `Até ${limits?.custom_domain_limit}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Master info */}
              {isAdminMaster && (
                <div className="text-center py-6 text-muted-foreground">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Acesso Master</p>
                  <p className="text-sm">Sem limites de uso</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Profile Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações
            </h3>

            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Nome de exibição</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>

              <div className="space-y-2">
                <Label>Organização (opcional)</Label>
                <Input
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Nome da sua empresa"
                />
              </div>

              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={user?.email || ''} disabled className="bg-muted" />
              </div>

              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Salvar alterações
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Password Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Alterar Senha
            </h3>

            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Nova senha</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div className="space-y-2">
                <Label>Confirmar nova senha</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite novamente"
                />
              </div>

              <Button 
                onClick={handleChangePassword} 
                disabled={changingPassword || !newPassword || !confirmPassword}
                variant="outline"
              >
                {changingPassword ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                Alterar Senha
              </Button>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
