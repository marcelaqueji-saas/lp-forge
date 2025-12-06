import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface FAQItem {
  pergunta: string;
  resposta: string;
}

interface FAQEditorProps {
  content: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const defaultFAQ: FAQItem[] = [
  { pergunta: 'Pergunta frequente 1?', resposta: 'Resposta para a pergunta 1.' },
  { pergunta: 'Pergunta frequente 2?', resposta: 'Resposta para a pergunta 2.' },
  { pergunta: 'Pergunta frequente 3?', resposta: 'Resposta para a pergunta 3.' },
];

export const FAQEditor = ({ content, onChange }: FAQEditorProps) => {
  const [perguntas, setPerguntas] = useState<FAQItem[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(content.perguntas_json || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        setPerguntas(parsed);
      } else {
        setPerguntas(defaultFAQ);
      }
    } catch {
      setPerguntas(defaultFAQ);
    }
  }, []);

  const updatePerguntas = (updated: FAQItem[]) => {
    setPerguntas(updated);
    onChange('perguntas_json', JSON.stringify(updated));
  };

  const handleChange = (index: number, field: keyof FAQItem, value: string) => {
    const updated = [...perguntas];
    updated[index] = { ...updated[index], [field]: value };
    updatePerguntas(updated);
  };

  const handleAdd = () => {
    updatePerguntas([...perguntas, { pergunta: '', resposta: '' }]);
  };

  const handleRemove = (index: number) => {
    updatePerguntas(perguntas.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Perguntas Frequentes (FAQ)</Label>
      
      <div className="space-y-3">
        {perguntas.map((item, index) => (
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
                <Label className="text-xs">Pergunta</Label>
                <Input
                  value={item.pergunta}
                  onChange={(e) => handleChange(index, 'pergunta', e.target.value)}
                  placeholder="Digite a pergunta"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Resposta</Label>
                <Textarea
                  value={item.resposta}
                  onChange={(e) => handleChange(index, 'resposta', e.target.value)}
                  placeholder="Digite a resposta"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={handleAdd} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar pergunta
      </Button>
    </div>
  );
};
