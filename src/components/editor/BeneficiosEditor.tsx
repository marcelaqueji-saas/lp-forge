import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface Beneficio {
  titulo: string;
  descricao: string;
  icone?: string;
}

interface BeneficiosEditorProps {
  content: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const defaultBeneficios: Beneficio[] = [
  { titulo: 'Benefício 1', descricao: 'Descrição do benefício', icone: 'Star' },
  { titulo: 'Benefício 2', descricao: 'Descrição do benefício', icone: 'Zap' },
  { titulo: 'Benefício 3', descricao: 'Descrição do benefício', icone: 'Shield' },
];

export const BeneficiosEditor = ({ content, onChange }: BeneficiosEditorProps) => {
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(content.beneficios_json || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        setBeneficios(parsed);
      } else {
        setBeneficios(defaultBeneficios);
      }
    } catch {
      setBeneficios(defaultBeneficios);
    }
  }, []);

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
    updateBeneficios(beneficios.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Lista de Benefícios</Label>
      
      <div className="space-y-3">
        {beneficios.map((item, index) => (
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
                  placeholder="Título do benefício"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Descrição</Label>
                <Textarea
                  value={item.descricao}
                  onChange={(e) => handleChange(index, 'descricao', e.target.value)}
                  placeholder="Descrição do benefício"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Ícone (nome Lucide)</Label>
                <Input
                  value={item.icone || ''}
                  onChange={(e) => handleChange(index, 'icone', e.target.value)}
                  placeholder="Ex: Star, Heart, Zap"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={handleAdd} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar benefício
      </Button>
    </div>
  );
};
