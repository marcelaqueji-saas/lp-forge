import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { getLPById, getUserRoleForLP, saveSettings, getSettings, LandingPage, LPRole, LPSettings } from '@/lib/lpContentApi';
import { 
  Loader2, ArrowLeft, Globe, ShieldCheck, AlertCircle, Copy, CheckCircle2, 
  ExternalLink, RefreshCw, Lock, Unlock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminDomainSettings = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [lp, setLP] = useState<LandingPage | null>(null);
  const [userRole, setUserRole] = useState<LPRole | null>(null);
  const [settings, setSettings] = useState<LPSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  const [domain, setDomain] = useState('');
  const [verificationToken, setVerificationToken] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      if (!id) {
        navigate('/admin');
        return;
      }

      const [lpData, role, settingsData] = await Promise.all([
        getLPById(id),
        getUserRoleForLP(id),
        getSettings(id),
      ]);

      if (!lpData) {
        toast({ title: 'LP não encontrada', variant: 'destructive' });
        navigate('/admin');
        return;
      }

      if (role !== 'owner') {
        toast({ title: 'Acesso negado', description: 'Apenas o dono pode configurar domínios.', variant: 'destructive' });
        navigate(`/admin/lp/${id}/sections`);
        return;
      }

      setLP(lpData);
      setUserRole(role);
      setSettings(settingsData);
      setDomain(lpData.dominio || '');
      
      // Generate verification token if not exists
      const token = (lpData as any).dominio_verificacao_token || generateToken();
      setVerificationToken(token);
      
      setLoading(false);
    };

    loadData();
  }, [id, navigate]);

  const generateToken = () => {
    return `saas-lp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  };

  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const handleSaveDomain = async () => {
    if (!id || !lp) return;
    
    if (domain && !validateDomain(domain)) {
      toast({ title: 'Domínio inválido', description: 'Use formato: meusite.com.br', variant: 'destructive' });
      return;
    }

    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('landing_pages')
        .update({ 
          dominio: domain || null,
          dominio_verificado: false,
          dominio_verificacao_token: verificationToken
        })
        .eq('id', id);

      if (error) throw error;

      // Update SSL status
      await saveSettings(id, { ssl_status: domain ? 'pending' : 'none' });

      setLP({ ...lp, dominio: domain || undefined, dominio_verificado: false });
      toast({ title: 'Domínio salvo', description: 'Configure o DNS para ativar.' });
    } catch (error) {
      console.error('Error saving domain:', error);
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!id) return;
    
    setVerifying(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-domain', {
        body: { lp_id: id }
      });

      if (error) throw error;

      if (data?.verified) {
        setLP(lp => lp ? { ...lp, dominio_verificado: true } : null);
        await saveSettings(id, { ssl_status: 'active' });
        toast({ title: 'Domínio verificado!', description: 'Seu domínio está ativo.' });
      } else {
        toast({ title: 'Verificação falhou', description: data?.message || 'Verifique as configurações de DNS.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
      toast({ title: 'Erro na verificação', variant: 'destructive' });
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado!' });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lp || userRole !== 'owner') return null;

  const sslStatus = settings.ssl_status || 'none';
  const isVerified = lp.dominio_verificado;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to={`/admin/lp/${id}/estilos`} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold">Domínio Personalizado</h1>
                <p className="text-sm text-muted-foreground">{lp.nome}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Status Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  lp.dominio ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                }`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Domínio</p>
                  <p className="font-medium">{lp.dominio || 'Não configurado'}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isVerified ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                }`}>
                  {isVerified ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">DNS</p>
                  <p className="font-medium">{isVerified ? 'Verificado' : 'Aguardando'}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  sslStatus === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                }`}>
                  {sslStatus === 'active' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SSL</p>
                  <p className="font-medium">
                    {sslStatus === 'active' ? 'Ativo' : sslStatus === 'pending' ? 'Aguardando' : 'Não configurado'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Domain Configuration */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Configurar Domínio</h2>
            
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Seu domínio</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/^https?:\/\//, ''))}
                placeholder="meusite.com.br"
                className="input-field"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Sem http:// ou https://
              </p>
            </div>

            <button
              onClick={handleSaveDomain}
              disabled={saving}
              className="btn-primary gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              Salvar Domínio
            </button>
          </div>

          {/* DNS Instructions */}
          {domain && (
            <div className="glass-card p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Instruções de DNS
              </h2>
              
              <p className="text-sm text-muted-foreground">
                Configure os seguintes registros DNS no seu provedor de domínio:
              </p>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Registro A (raiz)</span>
                    <button onClick={() => copyToClipboard('185.158.133.1')} className="p-1 hover:bg-muted rounded">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <code className="text-sm">@ → 185.158.133.1</code>
                </div>

                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Registro A (www)</span>
                    <button onClick={() => copyToClipboard('185.158.133.1')} className="p-1 hover:bg-muted rounded">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <code className="text-sm">www → 185.158.133.1</code>
                </div>

                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Registro TXT (verificação)</span>
                    <button onClick={() => copyToClipboard(verificationToken)} className="p-1 hover:bg-muted rounded">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <code className="text-sm break-all">_lovable → {verificationToken}</code>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleVerifyDomain}
                  disabled={verifying || !domain}
                  className="btn-secondary gap-2"
                >
                  {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Verificar DNS
                </button>

                {lp.dominio && isVerified && (
                  <a
                    href={`https://${lp.dominio}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visitar
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Help */}
          <div className="p-4 rounded-lg bg-muted/30 text-sm text-muted-foreground">
            <p className="font-medium mb-2">Dúvidas frequentes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>A propagação do DNS pode levar até 72 horas</li>
              <li>O SSL é emitido automaticamente após verificação</li>
              <li>Use ferramentas como dnschecker.org para verificar DNS</li>
            </ul>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDomainSettings;