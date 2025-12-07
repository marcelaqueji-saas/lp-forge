import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { getLPById, getLeads, getUserRoleForLP, getEventCounts, getWebhooks, createWebhook, updateWebhook, deleteWebhook, LandingPage, LPRole, LPEventCounts, LPWebhook } from '@/lib/lpContentApi';
import { Loader2, ArrowLeft, Mail, Phone, User, Calendar, Link as LinkIcon, Globe, Download, Eye, MousePointerClick, Users, TrendingUp, Webhook, Plus, Trash2, Power, PowerOff, FlaskConical, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { userHasFeature } from '@/lib/planFeatures';
import ABTestPanel from '@/components/admin/ABTestPanel';

interface Lead {
  id: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  utm: Record<string, string> | null;
  created_at: string;
}

const AdminAnalytics = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lp, setLp] = useState<LandingPage | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<LPRole | null>(null);
  const [eventCounts, setEventCounts] = useState<LPEventCounts>({ view: 0, cta_click: 0, lead_submit: 0 });
  const [webhooks, setWebhooks] = useState<LPWebhook[]>([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookTipo, setNewWebhookTipo] = useState<'generic' | 'hubspot' | 'pipedrive'>('generic');
  const [activeTab, setActiveTab] = useState<'leads' | 'metrics' | 'webhooks' | 'abtests'>('leads');
  const [canExportLeads, setCanExportLeads] = useState(false);
  const [canUseABTest, setCanUseABTest] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }

      if (!id) return;

      const [lpData, leadsData, role, counts, webhooksData] = await Promise.all([
        getLPById(id),
        getLeads(id),
        getUserRoleForLP(id),
        getEventCounts(id),
        getWebhooks(id),
      ]);

      if (!role) {
        navigate('/admin');
        return;
      }

      setLp(lpData);
      setLeads(leadsData as Lead[]);
      setUserRole(role);
      setEventCounts(counts);
      setWebhooks(webhooksData);
      
      // Verificar features do plano
      const [exportFeature, abTestFeature] = await Promise.all([
        userHasFeature('export_leads'),
        userHasFeature('ab_testing'),
      ]);
      setCanExportLeads(exportFeature);
      setCanUseABTest(abTestFeature);
      
      setLoading(false);
    };

    checkAuth();
  }, [id, navigate]);

  const handleExportCSV = async () => {
    if (!canExportLeads) {
      toast({ title: 'Recurso disponível no plano Pro', variant: 'destructive' });
      return;
    }
    if (userRole === 'viewer') {
      toast({ title: 'Você não tem permissão para exportar', variant: 'destructive' });
      return;
    }

    setExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-leads?lp_id=${id}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao exportar');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leads-${lp?.slug || 'export'}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({ title: 'CSV exportado com sucesso!' });
    } catch (error: any) {
      toast({ title: error.message || 'Erro ao exportar', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleCreateWebhook = async () => {
    if (!id || !newWebhookUrl || userRole !== 'owner') return;

    try {
      new URL(newWebhookUrl);
    } catch {
      toast({ title: 'URL inválida', variant: 'destructive' });
      return;
    }

    const webhook = await createWebhook(id, newWebhookUrl, newWebhookTipo);
    if (webhook) {
      setWebhooks([webhook, ...webhooks]);
      setNewWebhookUrl('');
      toast({ title: 'Webhook criado!' });
    } else {
      toast({ title: 'Erro ao criar webhook', variant: 'destructive' });
    }
  };

  const handleToggleWebhook = async (webhook: LPWebhook) => {
    if (userRole !== 'owner') return;

    const success = await updateWebhook(webhook.id, { ativo: !webhook.ativo });
    if (success) {
      setWebhooks(webhooks.map(w => w.id === webhook.id ? { ...w, ativo: !w.ativo } : w));
      toast({ title: webhook.ativo ? 'Webhook desativado' : 'Webhook ativado' });
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (userRole !== 'owner') return;

    const success = await deleteWebhook(webhookId);
    if (success) {
      setWebhooks(webhooks.filter(w => w.id !== webhookId));
      toast({ title: 'Webhook excluído' });
    }
  };

  const canExport = (userRole === 'owner' || userRole === 'editor') && canExportLeads;
  const canManageWebhooks = userRole === 'owner';
  const conversionRate = eventCounts.view > 0 ? ((eventCounts.lead_submit / eventCounts.view) * 100).toFixed(1) : '0';

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
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 rounded-xl hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-semibold">Analytics / Leads</h1>
              <p className="text-sm text-muted-foreground">{lp.nome}</p>
            </div>
          </div>
          {canExport && leads.length > 0 && (
            <button onClick={handleExportCSV} disabled={exporting} className="btn-primary gap-2">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Exportar CSV
            </button>
          )}
          {!canExportLeads && leads.length > 0 && (
            <button disabled className="btn-primary gap-2 opacity-50 cursor-not-allowed" title="Disponível no plano Pro">
              <Lock className="w-4 h-4" />
              Exportar CSV
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {[
              { id: 'leads', label: 'Leads', icon: Users },
              { id: 'metrics', label: 'Métricas', icon: TrendingUp },
              { id: 'abtests', label: 'Testes A/B', icon: FlaskConical },
              { id: 'webhooks', label: 'Webhooks', icon: Webhook },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'abtests' && !canUseABTest && (
                  <Lock className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Leads Tab */}
          {activeTab === 'leads' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium">
                  {leads.length} lead{leads.length !== 1 ? 's' : ''}
                </div>
              </div>

              {leads.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Nenhum lead ainda</h2>
                  <p className="text-muted-foreground">
                    Os leads capturados aparecerão aqui quando visitantes preencherem formulários.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.map((lead, index) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="glass-card p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          {lead.nome && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{lead.nome}</span>
                            </div>
                          )}
                          {lead.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                                {lead.email}
                              </a>
                            </div>
                          )}
                          {lead.telefone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <a href={`tel:${lead.telefone}`} className="text-primary hover:underline">
                                {lead.telefone}
                              </a>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(lead.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>

                        {lead.utm && Object.keys(lead.utm).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(lead.utm).map(([key, value]) => (
                              <div
                                key={key}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted text-xs"
                              >
                                {key === 'utm_source' && <Globe className="w-3 h-3" />}
                                {key === 'gclid' && <LinkIcon className="w-3 h-3" />}
                                {key === 'fbclid' && <LinkIcon className="w-3 h-3" />}
                                <span className="font-medium">{key.replace('utm_', '')}:</span>
                                <span className="text-muted-foreground">{value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Metrics Tab */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Visualizações</span>
                  </div>
                  <p className="text-3xl font-bold">{eventCounts.view.toLocaleString()}</p>
                </div>
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <MousePointerClick className="w-5 h-5 text-secondary-foreground" />
                    <span className="text-sm text-muted-foreground">Cliques CTA</span>
                  </div>
                  <p className="text-3xl font-bold">{eventCounts.cta_click.toLocaleString()}</p>
                </div>
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-success" />
                    <span className="text-sm text-muted-foreground">Leads</span>
                  </div>
                  <p className="text-3xl font-bold">{eventCounts.lead_submit.toLocaleString()}</p>
                </div>
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <span className="text-sm text-muted-foreground">Taxa de Conversão</span>
                  </div>
                  <p className="text-3xl font-bold">{conversionRate}%</p>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Sobre as métricas</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>Visualizações:</strong> Número de vezes que a página foi carregada</li>
                  <li>• <strong>Cliques CTA:</strong> Cliques em botões de ação principal</li>
                  <li>• <strong>Leads:</strong> Formulários preenchidos com sucesso</li>
                  <li>• <strong>Taxa de Conversão:</strong> Porcentagem de visitantes que se tornaram leads</li>
                </ul>
              </div>
            </div>
          )}

          {/* A/B Tests Tab */}
          {activeTab === 'abtests' && (
            <div className="space-y-6">
              {canUseABTest ? (
                id && <ABTestPanel lpId={id} />
              ) : (
                <div className="glass-card p-8 text-center">
                  <FlaskConical className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Testes A/B</h3>
                  <p className="text-muted-foreground mb-4">
                    Recurso disponível nos planos Pro e Premium
                  </p>
                  <button 
                    className="btn-primary"
                    onClick={() => toast({ title: 'Entre em contato para upgrade do plano' })}
                  >
                    Fazer Upgrade
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Webhooks Tab */}
          {activeTab === 'webhooks' && (
            <div className="space-y-6">
              {canManageWebhooks ? (
                <>
                  <div className="glass-card p-6">
                    <h3 className="font-semibold mb-4">Adicionar Webhook</h3>
                    <div className="flex flex-col md:flex-row gap-3">
                      <input
                        type="url"
                        value={newWebhookUrl}
                        onChange={(e) => setNewWebhookUrl(e.target.value)}
                        placeholder="https://seu-endpoint.com/webhook"
                        className="input-field flex-1"
                      />
                      <select
                        value={newWebhookTipo}
                        onChange={(e) => setNewWebhookTipo(e.target.value as any)}
                        className="input-field w-40"
                      >
                        <option value="generic">Genérico</option>
                        <option value="hubspot">HubSpot</option>
                        <option value="pipedrive">Pipedrive</option>
                      </select>
                      <button onClick={handleCreateWebhook} className="btn-primary gap-2">
                        <Plus className="w-4 h-4" />
                        Adicionar
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Webhooks recebem dados de leads automaticamente via POST quando um novo lead é criado.
                    </p>
                  </div>

                  {webhooks.length === 0 ? (
                    <div className="glass-card p-8 text-center">
                      <Webhook className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Nenhum webhook configurado</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {webhooks.map((webhook) => (
                        <div key={webhook.id} className="glass-card p-4 flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-sm truncate">{webhook.url}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                webhook.ativo ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                              }`}>
                                {webhook.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-muted text-xs">
                                {webhook.tipo}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleWebhook(webhook)}
                              className={`p-2 rounded-lg transition-colors ${
                                webhook.ativo ? 'hover:bg-warning/10 text-warning' : 'hover:bg-success/10 text-success'
                              }`}
                              title={webhook.ativo ? 'Desativar' : 'Ativar'}
                            >
                              {webhook.ativo ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteWebhook(webhook.id)}
                              className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="glass-card p-6">
                    <h3 className="font-semibold mb-2">Formato do Payload</h3>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "lp_id": "uuid",
  "lead_id": "uuid",
  "nome": "Nome do Lead",
  "email": "email@exemplo.com",
  "telefone": "(11) 99999-9999",
  "utm": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "campanha"
  },
  "created_at": "2024-01-01T00:00:00Z"
}`}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="glass-card p-8 text-center">
                  <Webhook className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Apenas o dono da LP pode gerenciar webhooks</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
