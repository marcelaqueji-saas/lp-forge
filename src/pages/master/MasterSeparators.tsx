import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SectionSeparator {
  id: string;
  name: string;
  category: string;
  min_plan_tier: string;
  svg_content: string | null;
  png_url: string | null;
  preview_thumbnail: string | null;
  is_active: boolean;
}

const CATEGORIES = ['básico', 'avançado', 'animado', 'robusto'];
const PLANS = ['free', 'pro', 'premium'];

const MasterSeparators = () => {
  const navigate = useNavigate();
  const [separators, setSeparators] = useState<SectionSeparator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editDialog, setEditDialog] = useState(false);
  const [editingSeparator, setEditingSeparator] = useState<Partial<SectionSeparator> | null>(null);

  useEffect(() => {
    loadSeparators();
  }, []);

  const loadSeparators = async () => {
    const { data, error } = await supabase
      .from('section_separators')
      .select('*')
      .order('name', { ascending: true });

    if (!error && data) {
      setSeparators(data as SectionSeparator[]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingSeparator?.name) {
      toast({ title: 'Preencha o nome', variant: 'destructive' });
      return;
    }

    if (editingSeparator.id) {
      const { error } = await supabase
        .from('section_separators')
        .update({
          name: editingSeparator.name,
          category: editingSeparator.category,
          min_plan_tier: editingSeparator.min_plan_tier,
          svg_content: editingSeparator.svg_content,
          png_url: editingSeparator.png_url,
          preview_thumbnail: editingSeparator.preview_thumbnail,
          is_active: editingSeparator.is_active,
        })
        .eq('id', editingSeparator.id);

      if (error) {
        toast({ title: 'Erro ao salvar', variant: 'destructive' });
        return;
      }
    } else {
      const { error } = await supabase
        .from('section_separators')
        .insert({
          name: editingSeparator.name,
          category: editingSeparator.category || 'básico',
          min_plan_tier: editingSeparator.min_plan_tier || 'free',
          svg_content: editingSeparator.svg_content,
          png_url: editingSeparator.png_url,
          preview_thumbnail: editingSeparator.preview_thumbnail,
          is_active: editingSeparator.is_active ?? true,
        });

      if (error) {
        toast({ title: 'Erro ao criar', description: error.message, variant: 'destructive' });
        return;
      }
    }

    toast({ title: 'Separador salvo com sucesso' });
    setEditDialog(false);
    setEditingSeparator(null);
    loadSeparators();
  };

  const handleToggleActive = async (separator: SectionSeparator) => {
    const { error } = await supabase
      .from('section_separators')
      .update({ is_active: !separator.is_active })
      .eq('id', separator.id);

    if (!error) {
      loadSeparators();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este separador?')) return;

    const { error } = await supabase
      .from('section_separators')
      .delete()
      .eq('id', id);

    if (!error) {
      toast({ title: 'Separador excluído' });
      loadSeparators();
    }
  };

  const filteredSeparators = separators.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || s.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'básico': 'bg-muted text-muted-foreground',
      'avançado': 'bg-primary/20 text-primary',
      'animado': 'bg-accent/20 text-accent',
      'robusto': 'bg-warning/20 text-warning',
    };
    return colors[category] || colors['básico'];
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/master')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-lg">Separadores de Seções</h1>
            <p className="text-xs text-muted-foreground">{separators.length} separadores</p>
          </div>
          <Button onClick={() => { setEditingSeparator({}); setEditDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Novo
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar separador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSeparators.map((separator) => (
            <div 
              key={separator.id} 
              className={`glass-card p-4 ${!separator.is_active ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium">{separator.name}</h3>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleToggleActive(separator)}
                  >
                    {separator.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => { setEditingSeparator(separator); setEditDialog(true); }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(separator.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {separator.preview_thumbnail && (
                <div className="h-16 bg-muted rounded mb-3 flex items-center justify-center overflow-hidden">
                  <img src={separator.preview_thumbnail} alt={separator.name} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="flex gap-2">
                <Badge className={`${getCategoryColor(separator.category)} border-0`}>
                  {separator.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {separator.min_plan_tier}+
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {filteredSeparators.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum separador encontrado
          </div>
        )}
      </main>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSeparator?.id ? 'Editar' : 'Novo'} Separador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={editingSeparator?.name || ''}
                onChange={(e) => setEditingSeparator(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categoria</Label>
                <Select 
                  value={editingSeparator?.category || 'básico'} 
                  onValueChange={(v) => setEditingSeparator(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Plano Mínimo</Label>
                <Select 
                  value={editingSeparator?.min_plan_tier || 'free'} 
                  onValueChange={(v) => setEditingSeparator(prev => ({ ...prev, min_plan_tier: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANS.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>URL da Imagem PNG</Label>
              <Input
                value={editingSeparator?.png_url || ''}
                onChange={(e) => setEditingSeparator(prev => ({ ...prev, png_url: e.target.value }))}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>URL do Preview</Label>
              <Input
                value={editingSeparator?.preview_thumbnail || ''}
                onChange={(e) => setEditingSeparator(prev => ({ ...prev, preview_thumbnail: e.target.value }))}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MasterSeparators;
