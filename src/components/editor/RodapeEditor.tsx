import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { LPContent } from '@/lib/lpContentApi';

interface RodapeEditorProps {
  content: LPContent;
  onChange: (key: string, value: string) => void;
}

interface LinkItem {
  label: string;
  url: string;
}

const defaultLinks: LinkItem[] = [
  { label: 'Termos de uso', url: '#' },
  { label: 'Privacidade', url: '#' },
  { label: 'Contato', url: '#' },
];

export const RodapeEditor = ({ content, onChange }: RodapeEditorProps) => {
  const [links, setLinks] = useState<LinkItem[]>([]);

  useEffect(() => {
    try {
      const parsed = content.links_json ? JSON.parse(content.links_json) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        setLinks(parsed);
      } else {
        setLinks(defaultLinks);
      }
    } catch {
      setLinks(defaultLinks);
    }
  }, [content.links_json]);

  const updateLinks = (newLinks: LinkItem[]) => {
    setLinks(newLinks);
    onChange('links_json', JSON.stringify(newLinks));
  };

  const handleLinkChange = (index: number, field: keyof LinkItem, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    updateLinks(newLinks);
  };

  const addLink = () => {
    updateLinks([...links, { label: 'Novo link', url: '#' }]);
  };

  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    updateLinks(newLinks);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Links do Rodapé</Label>
        <Button variant="outline" size="sm" onClick={addLink}>
          <Plus className="w-4 h-4 mr-1" />
          Adicionar link
        </Button>
      </div>

      <div className="space-y-3">
        {links.map((link, index) => (
          <Card key={index} className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-2 text-muted-foreground">
                  <GripVertical className="w-4 h-4" />
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Texto do link</Label>
                    <Input
                      value={link.label}
                      onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                      placeholder="Ex: Termos de uso"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">URL</Label>
                    <Input
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                      placeholder="Ex: /termos ou https://..."
                    />
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-1"
                  onClick={() => removeLink(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {links.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum link adicionado. Clique em "Adicionar link" para começar.
        </p>
      )}
    </div>
  );
};
