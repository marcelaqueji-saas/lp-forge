import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, ExternalLink, Edit, Globe, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LandingPage } from '@/lib/lpContentApi';
import { UserWithDetails, getAllUsers } from '@/lib/authApi';

const MasterLPs = () => {
  const navigate = useNavigate();
  const [lps, setLPs] = useState<LandingPage[]>([]);
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [newLP, setNewLP] = useState({ nome: '', slug: '', owner_id: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [lpsRes, usersData] = await Promise.all([
      supabase.from('landing_pages').select('*').order('created_at', { ascending: false }),
      getAllUsers()
    ]);

    if (lpsRes.data) {
      setLPs(lpsRes.data as LandingPage[]);
    }
    setUsers(usersData);
    setLoading(false);
  };

  const handleCreateLP = async () => {
    if (!newLP.nome || !newLP.slug || !newLP.owner_id) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('landing_pages')
      .select('id')
      .eq('slug', newLP.slug)
      .maybeSingle();

    if (existing) {
      toast({ title: 'Slug já existe', variant: 'destructive' });
      return;
    }

    const { data, error } = await supabase
      .from('landing_pages')
      .insert({
        nome: newLP.nome,
        slug: newLP.slug,
        owner_id: newLP.owner_id,
        publicado: false
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Erro ao criar LP', description: error.message, variant: 'destructive' });
      return;
    }

    // Create initial content
    const sections = ['menu', 'hero', 'como_funciona', 'para_quem_e', 'beneficios', 'provas_sociais', 'planos', 'faq', 'chamada_final', 'rodape'];
    for (let i = 0; i < sections.length; i++) {
      await supabase.from('lp_content').insert({
        lp_id: data.id,
        section: sections[i],
        key: 'placeholder',
        value: '',
        section_order: i + 1
      });
    }

    toast({ title: 'LP criada com sucesso!' });
    setCreateDialog(false);
    setNewLP({ nome: '', slug: '', owner_id: '' });
    loadData();
  };

  const filteredLPs = lps.filter(lp => 
    lp.nome.toLowerCase().includes(search.toLowerCase()) ||
    lp.slug.toLowerCase().includes(search.toLowerCase())
  );

  const getOwnerName = (ownerId: string | undefined) => {
    if (!ownerId) return 'Sem dono';
    const user = users.find(u => u.id === ownerId);
    return user?.display_name || user?.email || 'Desconhecido';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/master')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-lg">Todas as Landing Pages</h1>
            <p className="text-xs text-muted-foreground">{lps.length} LPs cadastradas</p>
          </div>
          <Button onClick={() => setCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova LP
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando...</div>
          ) : filteredLPs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhuma LP encontrada</div>
          ) : (
            filteredLPs.map((lp) => (
              <div key={lp.id} className="glass-card p-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-medium truncate">{lp.nome}</h3>
                    <Badge variant={lp.publicado ? "default" : "secondary"}>
                      {lp.publicado ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">/{lp.slug}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>Dono: {getOwnerName(lp.owner_id)}</span>
                    {lp.dominio && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {lp.dominio}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`/lp/${lp.slug}`, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => navigate(`/meu-site/${lp.id}`)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Landing Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={newLP.nome}
                onChange={(e) => setNewLP(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Minha LP"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Slug (URL) *</Label>
              <Input
                value={newLP.slug}
                onChange={(e) => setNewLP(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                placeholder="minha-lp"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">URL: /lp/{newLP.slug || 'slug'}</p>
            </div>
            <div>
              <Label>Proprietário *</Label>
              <Select 
                value={newLP.owner_id} 
                onValueChange={(v) => setNewLP(prev => ({ ...prev, owner_id: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o proprietário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.display_name || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreateLP}>Criar LP</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MasterLPs;
