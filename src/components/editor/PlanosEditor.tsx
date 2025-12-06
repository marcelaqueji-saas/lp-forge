import { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface Plano {
  nome: string;
  preco: string;
  descricao: string;
  destaque: boolean;
  itens: string[];
}

interface PlanosEditorProps {
  content: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const defaultPlanos: Plano[] = [
  { nome: 'Básico', preco: 'R$ 49', descricao: 'Para começar', destaque: false, itens: ['Item 1', 'Item 2'] },
  { nome: 'Pro', preco: 'R$ 99', descricao: 'Mais recursos', destaque: true, itens: ['Item 1', 'Item 2', 'Item 3'] },
  { nome: 'Enterprise', preco: 'R$ 199', descricao: 'Completo', destaque: false, itens: ['Item 1', 'Item 2', 'Item 3', 'Item 4'] },
];

export const PlanosEditor = ({ content, onChange }: PlanosEditorProps) => {
  const [planos, setPlanos] = useState<Plano[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(content.planos_json || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        setPlanos(parsed);
      } else {
        setPlanos(defaultPlanos);
      }
    } catch {
      setPlanos(defaultPlanos);
    }
  }, []);

  const updatePlanos = (updated: Plano[]) => {
    setPlanos(updated);
    onChange('planos_json', JSON.stringify(updated));
  };

  const handleChange = (index: number, field: keyof Plano, value: any) => {
    const updated = [...planos];
    updated[index] = { ...updated[index], [field]: value };
    updatePlanos(updated);
  };

  const handleItemChange = (planoIndex: number, itemIndex: number, value: string) => {
    const updated = [...planos];
    updated[planoIndex].itens[itemIndex] = value;
    updatePlanos(updated);
  };

  const handleAddItem = (planoIndex: number) => {
    const updated = [...planos];
    updated[planoIndex].itens.push('');
    updatePlanos(updated);
  };

  const handleRemoveItem = (planoIndex: number, itemIndex: number) => {
    const updated = [...planos];
    updated[planoIndex].itens = updated[planoIndex].itens.filter((_, i) => i !== itemIndex);
    updatePlanos(updated);
  };

  const handleAdd = () => {
    updatePlanos([...planos, { nome: '', preco: '', descricao: '', destaque: false, itens: [''] }]);
  };

  const handleRemove = (index: number) => {
    updatePlanos(planos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Lista de Planos</Label>
      
      <div className="space-y-4">
        {planos.map((plano, index) => (
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Nome do plano</Label>
                  <Input
                    value={plano.nome}
                    onChange={(e) => handleChange(index, 'nome', e.target.value)}
                    placeholder="Nome"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Preço</Label>
                  <Input
                    value={plano.preco}
                    onChange={(e) => handleChange(index, 'preco', e.target.value)}
                    placeholder="R$ 99"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Descrição</Label>
                <Textarea
                  value={plano.descricao}
                  onChange={(e) => handleChange(index, 'descricao', e.target.value)}
                  placeholder="Descrição do plano"
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`destaque-${index}`}
                  checked={plano.destaque}
                  onCheckedChange={(checked) => handleChange(index, 'destaque', checked)}
                />
                <Label htmlFor={`destaque-${index}`} className="text-xs">Plano em destaque</Label>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Itens incluídos</Label>
                <div className="space-y-2">
                  {plano.itens.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleItemChange(index, itemIndex, e.target.value)}
                        placeholder="Item do plano"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveItem(index, itemIndex)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleAddItem(index)} className="text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar item
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={handleAdd} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar plano
      </Button>
    </div>
  );
};
