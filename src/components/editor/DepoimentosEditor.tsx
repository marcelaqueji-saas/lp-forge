import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface Depoimento {
  nome: string;
  cargo: string;
  texto: string;
}

interface DepoimentosEditorProps {
  content: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const defaultDepoimentos: Depoimento[] = [
  { nome: 'Maria Silva', cargo: 'CEO, Empresa X', texto: 'Excelente produto!' },
  { nome: 'João Santos', cargo: 'CTO, Startup Y', texto: 'Mudou nosso negócio.' },
  { nome: 'Ana Costa', cargo: 'Diretora, Empresa Z', texto: 'Recomendo a todos.' },
];

export const DepoimentosEditor = ({ content, onChange }: DepoimentosEditorProps) => {
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(content.depoimentos_json || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        setDepoimentos(parsed);
      } else {
        setDepoimentos(defaultDepoimentos);
      }
    } catch {
      setDepoimentos(defaultDepoimentos);
    }
  }, []);

  const updateDepoimentos = (updated: Depoimento[]) => {
    setDepoimentos(updated);
    onChange('depoimentos_json', JSON.stringify(updated));
  };

  const handleChange = (index: number, field: keyof Depoimento, value: string) => {
    const updated = [...depoimentos];
    updated[index] = { ...updated[index], [field]: value };
    updateDepoimentos(updated);
  };

  const handleAdd = () => {
    updateDepoimentos([...depoimentos, { nome: '', cargo: '', texto: '' }]);
  };

  const handleRemove = (index: number) => {
    updateDepoimentos(depoimentos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Depoimentos</Label>
      
      <div className="space-y-3">
        {depoimentos.map((item, index) => (
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
                  <Label className="text-xs">Nome</Label>
                  <Input
                    value={item.nome}
                    onChange={(e) => handleChange(index, 'nome', e.target.value)}
                    placeholder="Nome da pessoa"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Cargo</Label>
                  <Input
                    value={item.cargo}
                    onChange={(e) => handleChange(index, 'cargo', e.target.value)}
                    placeholder="Cargo, Empresa"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Depoimento</Label>
                <Textarea
                  value={item.texto}
                  onChange={(e) => handleChange(index, 'texto', e.target.value)}
                  placeholder="Texto do depoimento"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={handleAdd} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar depoimento
      </Button>
    </div>
  );
};
