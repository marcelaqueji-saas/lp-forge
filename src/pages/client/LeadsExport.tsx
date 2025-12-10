/**
 * LeadsExport - Página de exportação de leads
 * Sprint 4.3: Tabela + botão exportar CSV
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Mail, Calendar, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Lead {
  id: string;
  email: string | null;
  nome: string | null;
  telefone: string | null;
  created_at: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  utm: any;
}

export default function LeadsExport() {
  const { lpId } = useParams<{ lpId: string }>();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [lpName, setLpName] = useState('');

  // QA Log
  useEffect(() => {
    console.log('[S4.3 QA] Leads Export: mounted', { lpId });
  }, [lpId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!lpId) return;

      setLoading(true);
      try {
        // Get LP name
        const { data: lp } = await supabase
          .from('landing_pages')
          .select('nome')
          .eq('id', lpId)
          .single();
        
        if (lp) setLpName(lp.nome);

        // Get leads
        const { data, error } = await supabase
          .from('lp_leads')
          .select('*')
          .eq('lp_id', lpId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setLeads(data || []);
        console.log('[S4.3 QA] Leads Export: OK -', data?.length, 'leads');
      } catch (err) {
        console.error('Error fetching leads:', err);
        toast({ title: 'Erro ao carregar leads', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lpId]);

  const exportToCSV = async () => {
    setExporting(true);
    try {
      const headers = ['Nome', 'Email', 'Telefone', 'Data', 'UTM Source', 'UTM Medium', 'UTM Campaign'];
      const rows = leads.map(lead => [
        lead.nome || '',
        lead.email || '',
        lead.telefone || '',
        lead.created_at ? format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '',
        (lead.utm as any)?.source || '',
        (lead.utm as any)?.medium || '',
        (lead.utm as any)?.campaign || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `leads-${lpName || 'export'}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();

      toast({ title: 'CSV exportado com sucesso!' });
      console.log('[S4.3 QA] Leads Export: OK - CSV downloaded');
    } catch (err) {
      console.error('Export error:', err);
      toast({ title: 'Erro ao exportar', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/painel')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold">Leads</h1>
              <p className="text-sm text-muted-foreground">{lpName || 'Carregando...'}</p>
            </div>
          </div>

          <Button onClick={exportToCSV} disabled={exporting || leads.length === 0}>
            {exporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Exportar CSV
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container px-4 py-8">
        <Card className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Nenhum lead ainda</h3>
              <p className="text-muted-foreground text-sm">
                Os leads capturados na sua LP aparecerão aqui.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {leads.length} lead{leads.length !== 1 ? 's' : ''} encontrado{leads.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Origem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.nome || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            {lead.email || '-'}
                          </div>
                        </TableCell>
                        <TableCell>{lead.telefone || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {lead.created_at 
                              ? format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                              : '-'
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          {(lead.utm as any)?.source ? (
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                {(lead.utm as any).source}
                                {(lead.utm as any).medium && ` / ${(lead.utm as any).medium}`}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Direto</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
