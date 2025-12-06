import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface Perfil {
  titulo: string;
  descricao: string;
  icone?: string;
}

interface PerfisEditorProps {
  content: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const defaultPerfis: Perfil[] = [
  { titulo: 'Perfil 1', descricao: 'Descrição do perfil ideal', icone: 'User' },
  { titulo: 'Perfil 2', descricao: 'Descrição do perfil ideal', icone: 'Users' },
  { titulo: 'Perfil 3', descricao: 'Descrição do perfil ideal', icone: 'Building' },
];

export const PerfisEditor = ({ content, onChange }: PerfisEditorProps) => {
  const [perfis, setPerfis] = useState<Perfil[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(content.perfis_json || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        setPerfis(parsed);
      } else {
        setPerfis(defaultPerfis);
      }
    } catch {
      setPerfis(defaultPerfis);
    }
  }, []);

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
    updatePerfis(perfis.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Perfis "Para quem é"</Label>
      
      <div className="space-y-3">
        {perfis.map((item, index) => (
          <Card key={index} className="relative">
            <CardContent className="pt-4 space-y-3">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => handleRemove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="space-y-2">
                <Label className="text-xs">Título</Label>
                <Input
                  value={item.titulo}
                  onChange={(e) => handleChange(index, 'titulo', e.target.value)}
                  placeholder="Título do perfil"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Descrição</Label>
                <Textarea
                  value={item.descricao}
                  onChange={(e) => handleChange(index, 'descricao', e.target.value)}
                  placeholder="Descrição do perfil"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Ícone (nome Lucide)</Label>
                <Input
                  value={item.icone || ''}
                  onChange={(e) => handleChange(index, 'icone', e.target.value)}
                  placeholder="Ex: User, Users, Building"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={handleAdd} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar perfil
      </Button>
    </div>
  );
};
