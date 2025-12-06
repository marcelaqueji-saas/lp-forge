// src/pages/master/MasterTemplates.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface SectionTemplate {
  id: string;
  section: string;
  name: string;
  variant_id: string;
  category: string;
  min_plan_tier: string;
  preview_thumbnail: string | null;
  description: string | null;
  is_active: boolean;
  componente_front: string | null;
  preview_dynamic_enabled: boolean;
}

const SECTIONS = [
  { value: 'hero', label: 'Hero' },
  { value: 'como_funciona', label: 'Como Funciona' },
  { value: 'para_quem_e', label: 'Para Quem É' },
  { value: 'beneficios', label: 'Benefícios' },
  { value: 'provas_sociais', label: 'Provas Sociais' },
  { value: 'planos', label: 'Planos' },
  { value: 'faq', label: 'FAQ' },
  { value: 'chamada_final', label: 'Chamada Final' },
  { value: 'rodape', label: 'Rodapé' },
  { value: 'menu', label: 'Menu' },
  { value: 'separador', label: 'Separador' },
];

const CATEGORIES = [
  { value: 'básico', label: 'Básico', color: 'bg-muted text-muted-foreground' },
  { value: 'avançado', label: 'Avançado', color: 'bg-blue-500/20 text-blue-600' },
  { value: 'animado', label: 'Animado', color: 'bg-purple-500/20 text-purple-600' },
  { value: 'robusto', label: 'Robusto', color: 'bg-amber-500/20 text-amber-600' },
];

const PLANS = [
  { value: 'free', label: 'Free', color: 'bg-muted text-muted-foreground' },
  { value: 'pro', label: 'Pro', color: 'bg-primary/20 text-primary' },
  { value: 'premium', label: 'Premium', color: 'bg-amber-500/20 text-amber-600' },
];

const PREMIUM_COMPONENTS = [
  { value: 'HeroParallax', label: 'Hero Parallax Mount' },
  { value: 'HeroSplit', label: 'Hero Split Navigation' },
  { value: 'Cards3DShowcase', label: '3D Cards Showcase' },
  { value: 'FeaturesFloat', label: 'Features Float Minimal' },
  { value: 'TestimonialCinematic', label: 'Testimonial Cinematic' },
  { value: 'CTAFinal', label: 'CTA Final Animado' },
];

const MasterTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<SectionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editDialog, setEditDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<SectionTemplate> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('section_templates')
      .select('*')
      .order('section', { ascending: true });

    if (error) {
      toast({ title: 'Erro ao carregar modelos', variant: 'destructive' });
    } else if (data) {
      setTemplates(data as SectionTemplate[]);
    }
    setLoading(false);
  };

  const handleUploadPreview = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingTemplate) return;

    setUploading(true);
    const fileName = `template-previews/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from('lp-media')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) {
      toast({ title: 'Erro no upload', variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('lp-media').getPublicUrl(fileName);

    setEditingTemplate(prev => ({
      ...prev,
      preview_thumbnail: urlData.publicUrl,
    }));

    setUploading(false);
    toast({ title: 'Imagem enviada!' });
  };

  const handleOpenNew = () => {
    setEditingTemplate({
      section: '',
      name: '',
      variant_id: '',
      category: 'básico',
      min_plan_tier: 'free',
      is_active: true,
      preview_dynamic_enabled: false,
      preview_thumbnail: null,
      componente_front: null, // 👈 nada de string vazia
      description: '',
    });
    setEditDialog(true);
  };

  const handleSave = async () => {
    if (!editingTemplate) return;

    if (!editingTemplate.section || !editingTemplate.name || !editingTemplate.variant_id) {
      toast({ title: 'Preencha seção, nome e ID da variante', variant: 'destructive' });
      return;
    }

    setSaving(true);

    // Garantir que variant_id é único por seção
    const { data: existing, error: checkError } = await supabase
      .from('section_templates')
      .select('id')
      .eq('section', editingTemplate.section)
      .eq('variant_id', editingTemplate.variant_id)
      .neq('id', editingTemplate.id || '');

    if (checkError) {
      toast({ title: 'Erro ao validar ID da variante', variant: 'destructive' });
      setSaving(false);
      return;
    }

    if (existing && existing.length > 0) {
      toast({
        title: 'ID da variante já em uso',
        description: 'Cada seção deve ter IDs únicos. Use outro "variant_id".',
        variant: 'destructive',
      });
      setSaving(false);
      return;
    }

    const payload = {
      section: editingTemplate.section,
      name: editingTemplate.name,
      variant_id: editingTemplate.variant_id,
      category: editingTemplate.category || 'básico',
      min_plan_tier: editingTemplate.min_plan_tier || 'free',
      description: editingTemplate.description || null,
      preview_thumbnail: editingTemplate.preview_thumbnail || null,
      is_active: editingTemplate.is_active ?? true,
      componente_front: editingTemplate.componente_front || null,
      preview_dynamic_enabled: editingTemplate.preview_dynamic_enabled ?? false,
    };

    if (editingTemplate.id) {
      const { error } = await supabase
        .from('section_templates')
        .update(payload)
        .eq('id', editingTemplate.id);

      if (error) {
        toast({ title: 'Erro ao salvar', variant: 'destructive' });
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from('section_templates')
        .insert(payload);

      if (error) {
        toast({
          title: 'Erro ao criar',
          description: error.message,
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }
    }

    toast({ title: 'Modelo salvo com sucesso' });
    setSaving(false);
    setEditDialog(false);
    setEditingTemplate(null);
    loadTemplates();
  };

  const handleToggleActive = async (template: SectionTemplate) => {
    const { error } = await supabase
      .from('section_templates')
      .update({ is_active: !template.is_active })
      .eq('id', template.id);

    if (error) {
      toast({ title: 'Erro ao atualizar modelo', variant: 'destructive' });
      return;
    }

    loadTemplates();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este modelo? Isso pode impactar LPs que o utilizam.')) {
      return;
    }

    const { error } = await supabase
      .from('section_templates')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro ao excluir modelo', variant: 'destructive' });
      return;
    }

    toast({ title: 'Modelo excluído' });
    loadTemplates();
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesSection = filterSection === 'all' || t.section === filterSection;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesSection && matchesCategory;
  });

  const getCategoryStyle = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.color || CATEGORIES[0].color;
  };

  const getPlanStyle = (plan: string) => {
    return PLANS.find(p => p.value === plan)?.color || PLANS[0].color;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header em estilo mais "app-shell" */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/master')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-lg tracking-tight truncate">
              Catálogo de Modelos de Seção
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              Controle total dos templates usados no construtor (por seção e plano)
            </p>
          </div>
          <Button onClick={handleOpenNew}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterSection} onValueChange={setFilterSection}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Seção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas seções</SelectItem>
              {SECTIONS.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={cn(
                'group bg-card rounded-xl border overflow-hidden transition-all hover:shadow-lg',
                !template.is_active && 'opacity-60'
              )}
            >
              {/* Preview */}
              <div className="aspect-video bg-muted relative overflow-hidden">
                {template.preview_thumbnail ? (
                  <img
                    src={template.preview_thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                )}

                {/* Premium indicator */}
                {template.min_plan_tier !== 'free' && (
                  <div className="absolute top-2 right-2">
                    <Badge className={cn(getPlanStyle(template.min_plan_tier), 'border-0')}>
                      <Lock className="w-3 h-3 mr-1" />
                      {template.min_plan_tier.toUpperCase()}
                    </Badge>
                  </div>
                )}

                {/* Dynamic preview indicator */}
                {template.preview_dynamic_enabled && (
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Animado
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {SECTIONS.find(s => s.value === template.section)?.label} • {template.variant_id}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={cn(getCategoryStyle(template.category), 'border-0 text-xs')}>
                    {template.category}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    Componente: {template.componente_front || 'padrão'}
                  </Badge>
                </div>

                {template.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {template.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleActive(template)}
                    >
                      {template.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingTemplate(template);
                        setEditDialog(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Nenhum modelo encontrado</p>
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate?.id ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
          </DialogHeader>

          {editingTemplate && (
            <div className="space-y-4">
              {/* Preview upload */}
              <div>
                <Label>Preview</Label>
                <div className="mt-2 aspect-video bg-muted rounded-lg overflow-hidden relative">
                  {editingTemplate.preview_thumbnail ? (
                    <img
                      src={editingTemplate.preview_thumbnail}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <div className="text-white text-center">
                      <Upload className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-sm">
                        {uploading ? 'Enviando...' : 'Trocar imagem'}
                      </span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleUploadPreview}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Seção *</Label>
                  <Select
                    value={editingTemplate.section || ''}
                    onValueChange={(v) =>
                      setEditingTemplate(prev => ({ ...prev, section: v }))
                    }
                    disabled={!!editingTemplate.id}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTIONS.map(s => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select
                    value={editingTemplate.category || 'básico'}
                    onValueChange={(v) =>
                      setEditingTemplate(prev => ({ ...prev, category: v }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Nome *</Label>
                <Input
                  value={editingTemplate.name || ''}
                  onChange={(e) =>
                    setEditingTemplate(prev => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1"
                  placeholder="Hero Parallax Mount"
                />
              </div>

              <div>
                <Label>ID da Variante *</Label>
                <Input
                  value={editingTemplate.variant_id || ''}
                  onChange={(e) =>
                    setEditingTemplate(prev => ({ ...prev, variant_id: e.target.value }))
                  }
                  placeholder="hero_parallax"
                  className="mt-1"
                  disabled={!!editingTemplate.id}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Esse ID é o valor salvo em <code>{'{section}_variante'}</code> em
                  <code> lp_settings</code> e usado para escolher o componente no front.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Plano Mínimo</Label>
                  <Select
                    value={editingTemplate.min_plan_tier || 'free'}
                    onValueChange={(v) =>
                      setEditingTemplate(prev => ({ ...prev, min_plan_tier: v }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANS.map(p => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Componente React</Label>
                  <Select
                    value={editingTemplate.componente_front || 'none'}
                    onValueChange={(v) =>
                      setEditingTemplate(prev => ({
                        ...prev,
                        componente_front: v === 'none' ? null : v,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum (padrão)</SelectItem>
                      {PREMIUM_COMPONENTS.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={editingTemplate.description || ''}
                  onChange={(e) =>
                    setEditingTemplate(prev => ({ ...prev, description: e.target.value }))
                  }
                  className="mt-1"
                  rows={2}
                  placeholder="Descrição curta do template..."
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-sm">Preview Dinâmico</p>
                  <p className="text-xs text-muted-foreground">
                    Ativa efeitos / animações na pré-visualização do construtor.
                  </p>
                </div>
                <Switch
                  checked={editingTemplate.preview_dynamic_enabled || false}
                  onCheckedChange={(v) =>
                    setEditingTemplate(prev => ({ ...prev, preview_dynamic_enabled: v }))
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MasterTemplates;
