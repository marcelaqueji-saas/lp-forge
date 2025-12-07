import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Zap, MousePointer, Rocket, Star, Target, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LPContent } from '@/lib/lpContentApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Passo {
  titulo: string;
  descricao: string;
  icone?: string;
}

interface PassosEditorProps {
  content: LPContent;
  onChange: (key: string, value: string) => void;
}

const ICON_OPTIONS = [
  { value: 'Zap', label: 'Raio', icon: Zap },
  { value: 'MousePointer', label: 'Cursor', icon: MousePointer },
  { value: 'Rocket', label: 'Foguete', icon: Rocket },
  { value: 'Star', label: 'Estrela', icon: Star },
  { value: 'Target', label: 'Alvo', icon: Target },
  { value: 'CheckCircle', label: 'Check', icon: CheckCircle },
];

const defaultPassos: Passo[] = [
  { titulo: 'Passo 1', descricao: 'Descrição do primeiro passo', icone: 'MousePointer' },
  { titulo: 'Passo 2', descricao: 'Descrição do segundo passo', icone: 'Zap' },
  { titulo: 'Passo 3', descricao: 'Descrição do terceiro passo', icone: 'Rocket' },
];

export const PassosEditor = ({ content, onChange }: PassosEditorProps) => {
  const [passos, setPassos] = useState<Passo[]>(defaultPassos);

  useEffect(() => {
    try {
      const parsed = content.passos_json ? JSON.parse(content.passos_json as string) : [];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setPassos(parsed);
      }
    } catch {
      console.log('[PassosEditor] Using default passos');
    }
  }, [content.passos_json]);

  const updatePassos = (newPassos: Passo[]) => {
    setPassos(newPassos);
    onChange('passos_json', JSON.stringify(newPassos));
  };

  const handlePassoChange = (index: number, field: keyof Passo, value: string) => {
    const updated = [...passos];
    updated[index] = { ...updated[index], [field]: value };
    updatePassos(updated);
  };

  const addPasso = () => {
    updatePassos([
      ...passos,
      { titulo: `Passo ${passos.length + 1}`, descricao: 'Descrição do passo', icone: 'Zap' },
    ]);
  };

  const removePasso = (index: number) => {
    if (passos.length > 1) {
      updatePassos(passos.filter((_, i) => i !== index));
    }
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= passos.length) return;
    const updated = [...passos];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    updatePassos(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Passos do Processo</Label>
        <Button variant="outline" size="sm" onClick={addPasso} className="h-8 text-xs gap-1">
          <Plus className="w-3 h-3" />
          Adicionar passo
        </Button>
      </div>

      <div className="space-y-3">
        {passos.map((passo, index) => {
          const IconComponent = ICON_OPTIONS.find(i => i.value === passo.icone)?.icon || Zap;
          
          return (
            <div
              key={index}
              className="p-3 border rounded-lg bg-card space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => moveItem(index, index - 1)}
                    disabled={index === 0}
                  >
                    <GripVertical className="w-3 h-3 rotate-90" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => moveItem(index, index + 1)}
                    disabled={index === passos.length - 1}
                  >
                    <GripVertical className="w-3 h-3 rotate-90" />
                  </Button>
                </div>

                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <IconComponent className="w-4 h-4 text-primary" />
                </div>

                <span className="text-sm font-medium text-muted-foreground">
                  Passo {index + 1}
                </span>

                <div className="flex-1" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePasso(index)}
                  disabled={passos.length <= 1}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Título</Label>
                  <Input
                    value={passo.titulo}
                    onChange={(e) => handlePassoChange(index, 'titulo', e.target.value)}
                    placeholder="Título do passo"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Ícone</Label>
                  <Select
                    value={passo.icone || 'Zap'}
                    onValueChange={(value) => handlePassoChange(index, 'icone', value)}
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
                  value={passo.descricao}
                  onChange={(e) => handlePassoChange(index, 'descricao', e.target.value)}
                  placeholder="Descrição do passo..."
                  rows={2}
                  className="text-sm min-h-[60px]"
                />
              </div>
            </div>
          );
        })}
      </div>

      {passos.length === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          Nenhum passo adicionado. Clique em "Adicionar passo" para começar.
        </div>
      )}
    </div>
  );
};
