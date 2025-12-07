import { useState, useEffect } from 'react';
import { Plus, Trash2, User, Users, Building2, Briefcase, GraduationCap, Store, Heart, Target } from 'lucide-react';
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

interface Perfil {
  titulo: string;
  descricao: string;
  icone?: string;
}

interface PerfisEditorProps {
  content: LPContent;
  onChange: (key: string, value: string) => void;
}

const ICON_OPTIONS = [
  { value: 'User', label: 'Pessoa', icon: User },
  { value: 'Users', label: 'Equipe', icon: Users },
  { value: 'Building2', label: 'Empresa', icon: Building2 },
  { value: 'Briefcase', label: 'Negócios', icon: Briefcase },
  { value: 'GraduationCap', label: 'Educação', icon: GraduationCap },
  { value: 'Store', label: 'Loja', icon: Store },
  { value: 'Heart', label: 'Coração', icon: Heart },
  { value: 'Target', label: 'Alvo', icon: Target },
];

const defaultPerfis: Perfil[] = [
  { titulo: 'Empreendedores', descricao: 'Lance seu produto ou serviço rapidamente com páginas profissionais.', icone: 'User' },
  { titulo: 'Agências', descricao: 'Crie landing pages para múltiplos clientes de forma escalável.', icone: 'Building2' },
  { titulo: 'Freelancers', descricao: 'Destaque seu portfólio e atraia mais clientes qualificados.', icone: 'Briefcase' },
];

export const PerfisEditor = ({ content, onChange }: PerfisEditorProps) => {
  const [perfis, setPerfis] = useState<Perfil[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(content.perfis_json as string || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        setPerfis(parsed);
      } else {
        setPerfis(defaultPerfis);
      }
    } catch {
      setPerfis(defaultPerfis);
    }
  }, [content.perfis_json]);

  const updatePerfis = (updated: Perfil[]) => {
    setPerfis(updated);
    onChange('perfis_json', JSON.stringify(updated));
  };

  const handleChange = (index: number, field: keyof Perfil, value: string) => {
    const updated = [...perfis];
    updated[index] = { ...updated[index], [field]: value };
    updatePerfis(updated);
  };

  const handleAdd = () => {
    updatePerfis([...perfis, { titulo: '', descricao: '', icone: 'User' }]);
  };

  const handleRemove = (index: number) => {
    if (perfis.length > 1) {
      updatePerfis(perfis.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Perfis "Para quem é"</Label>
        <Button variant="outline" size="sm" onClick={handleAdd} className="h-8 text-xs gap-1">
          <Plus className="w-3 h-3" />
          Adicionar
        </Button>
      </div>
      
      <div className="space-y-3">
        {perfis.map((item, index) => {
          const IconComponent = ICON_OPTIONS.find(i => i.value === item.icone)?.icon || User;
          
          return (
            <Card key={index} className="relative">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      Perfil {index + 1}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemove(index)}
                    disabled={perfis.length <= 1}
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
                      placeholder="Ex: Empreendedores"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Ícone</Label>
                    <Select
                      value={item.icone || 'User'}
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
                    placeholder="Descrição do perfil ideal..."
                    rows={2}
                    className="text-sm min-h-[60px]"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {perfis.length === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          Nenhum perfil adicionado. Clique em "Adicionar" para começar.
        </div>
      )}
    </div>
  );
};
