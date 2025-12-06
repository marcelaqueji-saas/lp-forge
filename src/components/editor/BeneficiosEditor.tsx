import { useState, useEffect } from 'react';
import { Plus, Trash2, Star, Zap, Shield, Globe, BarChart3, Clock, Sparkles, Check, Heart, Award, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LPContent } from '@/lib/lpContentApi';

interface Beneficio {
  titulo: string;
  descricao: string;
  icone?: string;
}

interface BeneficiosEditorProps {
  content: LPContent;
  onChange: (key: string, value: string) => void;
}

const ICON_OPTIONS = [
  { value: 'Sparkles', label: 'Brilho', icon: Sparkles },
  { value: 'Shield', label: 'Escudo', icon: Shield },
  { value: 'Zap', label: 'Raio', icon: Zap },
  { value: 'Globe', label: 'Globo', icon: Globe },
  { value: 'BarChart3', label: 'Gráfico', icon: BarChart3 },
  { value: 'Clock', label: 'Relógio', icon: Clock },
  { value: 'Star', label: 'Estrela', icon: Star },
  { value: 'Check', label: 'Check', icon: Check },
  { value: 'Heart', label: 'Coração', icon: Heart },
  { value: 'Award', label: 'Prêmio', icon: Award },
  { value: 'TrendingUp', label: 'Crescimento', icon: TrendingUp },
  { value: 'Users', label: 'Usuários', icon: Users },
];

const defaultBeneficios: Beneficio[] = [
  { titulo: 'Alta conversão', descricao: 'Templates otimizados para maximizar suas conversões.', icone: 'Sparkles' },
  { titulo: 'Seguro e confiável', descricao: 'Seus dados protegidos com criptografia de ponta.', icone: 'Shield' },
  { titulo: 'Super rápido', descricao: 'Páginas carregam em menos de 2 segundos.', icone: 'Zap' },
];

export const BeneficiosEditor = ({ content, onChange }: BeneficiosEditorProps) => {
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(content.beneficios_json as string || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        setBeneficios(parsed);
      } else {
        setBeneficios(defaultBeneficios);
      }
    } catch {
      setBeneficios(defaultBeneficios);
    }
  }, [content.beneficios_json]);

  const updateBeneficios = (updated: Beneficio[]) => {
    setBeneficios(updated);
    onChange('beneficios_json', JSON.stringify(updated));
  };

  const handleChange = (index: number, field: keyof Beneficio, value: string) => {
    const updated = [...beneficios];
    updated[index] = { ...updated[index], [field]: value };
    updateBeneficios(updated);
  };

  const handleAdd = () => {
    updateBeneficios([...beneficios, { titulo: '', descricao: '', icone: 'Star' }]);
  };

  const handleRemove = (index: number) => {
    if (beneficios.length > 1) {
      updateBeneficios(beneficios.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Lista de Benefícios</Label>
        <Button variant="outline" size="sm" onClick={handleAdd} className="h-8 text-xs gap-1">
          <Plus className="w-3 h-3" />
          Adicionar
        </Button>
      </div>
      
      <div className="space-y-3">
        {beneficios.map((item, index) => {
          const IconComponent = ICON_OPTIONS.find(i => i.value === item.icone)?.icon || Star;
          
          return (
            <Card key={index} className="relative">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      Benefício {index + 1}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemove(index)}
                    disabled={beneficios.length <= 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Título</Label>
                    <Input
                      value={item.titulo}
                      onChange={(e) => handleChange(index, 'titulo', e.target.value)}
                      placeholder="Título do benefício"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Ícone</Label>
                    <Select
                      value={item.icone || 'Star'}
                      onValueChange={(value) => handleChange(index, 'icone', value)}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map((opt) => {
                          const Icon = opt.icon;
                          return (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {opt.label}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Descrição</Label>
                  <Textarea
                    value={item.descricao}
                    onChange={(e) => handleChange(index, 'descricao', e.target.value)}
                    placeholder="Descrição do benefício"
                    rows={2}
                    className="text-sm min-h-[60px]"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {beneficios.length === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          Nenhum benefício adicionado. Clique em "Adicionar" para começar.
        </div>
      )}
    </div>
  );
};
