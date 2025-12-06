import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, ArrowLeft, Activity, Server, Database, AlertTriangle, 
  CheckCircle2, Clock, RefreshCw, Download, Filter
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UptimeCheck {
  id: string;
  checked_at: string;
  status: string;
  message: string | null;
}

interface SystemLog {
  id: string;
  lp_id: string | null;
  level: string;
  source: string;
  message: string;
  metadata: any;
  created_at: string;
}

const AdminSystemStatus = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [uptimeChecks, setUptimeChecks] = useState<UptimeCheck[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [healthStatus, setHealthStatus] = useState<'ok' | 'error' | 'checking'>('checking');
  
  // Filters
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      await Promise.all([
        loadUptimeChecks(),
        loadLogs(),
        checkHealth(),
      ]);
      
      setLoading(false);
    };

    loadData();
  }, [navigate]);

  const loadUptimeChecks = async () => {
    const { data } = await supabase
      .from('uptime_checks')
      .select('*')
      .order('checked_at', { ascending: false })
      .limit(50);
    
    setUptimeChecks(data || []);
  };

  const loadLogs = async () => {
    const { data } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    setLogs(data || []);
  };

  const checkHealth = async () => {
    setHealthStatus('checking');
    try {
      const { data, error } = await supabase.functions.invoke('health');
      
      if (error) {
        setHealthStatus('error');
      } else {
        setHealthStatus(data?.status === 'ok' ? 'ok' : 'error');
      }
    } catch {
      setHealthStatus('error');
    }
  };

  const calculateUptime = () => {
    if (uptimeChecks.length === 0) return 100;
    const okChecks = uptimeChecks.filter(c => c.status === 'ok').length;
    return Math.round((okChecks / uptimeChecks.length) * 100);
  };

  const filteredLogs = logs.filter(log => {
    if (levelFilter !== 'all' && log.level !== levelFilter) return false;
    if (sourceFilter !== 'all' && log.source !== sourceFilter) return false;
    return true;
  });

  const uniqueSources = [...new Set(logs.map(l => l.source))];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const uptime = calculateUptime();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="p-2 hover:bg-muted rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="font-semibold">Status do Sistema</h1>
                  <p className="text-sm text-muted-foreground">Monitoramento e logs</p>
                </div>
              </div>
            </div>
            
            <button onClick={checkHealth} className="btn-secondary gap-2">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Status Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  healthStatus === 'ok' ? 'bg-success/10 text-success' : 
                  healthStatus === 'error' ? 'bg-destructive/10 text-destructive' : 
                  'bg-muted text-muted-foreground'
                }`}>
                  {healthStatus === 'checking' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : healthStatus === 'ok' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sistema</p>
                  <p className="font-medium">
                    {healthStatus === 'checking' ? 'Verificando...' : 
                     healthStatus === 'ok' ? 'Operacional' : 'Erro'}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Server className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="font-medium">{uptime}%</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Banco</p>
                  <p className="font-medium">Conectado</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verificações</p>
                  <p className="font-medium">{uptimeChecks.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Health Check Endpoint */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Endpoint de Health Check</h2>
            <div className="p-3 rounded-lg bg-muted/50 font-mono text-sm break-all">
              GET {import.meta.env.VITE_SUPABASE_URL}/functions/v1/health
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Use este endpoint em serviços como UptimeRobot ou BetterStack para monitoramento externo.
            </p>
          </div>

          {/* System Logs */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Logs do Sistema
              </h2>
              
              <div className="flex gap-2">
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {uniqueSources.map(source => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum log encontrado</p>
              ) : (
                filteredLogs.map(log => (
                  <div 
                    key={log.id} 
                    className={`p-3 rounded-lg text-sm ${
                      log.level === 'error' ? 'bg-destructive/10 border border-destructive/20' :
                      log.level === 'warn' ? 'bg-warning/10 border border-warning/20' :
                      'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        log.level === 'error' ? 'bg-destructive/20 text-destructive' :
                        log.level === 'warn' ? 'bg-warning/20 text-warning' :
                        'bg-primary/20 text-primary'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">{log.source}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-foreground">{log.message}</p>
                    {log.metadata && (
                      <pre className="text-xs text-muted-foreground mt-1 overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminSystemStatus;