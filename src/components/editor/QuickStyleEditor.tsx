import { useState } from 'react';
import { Palette, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface QuickStyleEditorProps {
  sectionKey: string;
  currentStyles: {
    style_bg?: string;
    style_text?: string;
    style_gradient?: string;
  };
  supportsGradient?: boolean;
  onStyleChange: (styles: Record<string, string | undefined>) => void;
  disabled?: boolean;
}

const PRESET_COLORS = [
  '#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0',
  '#1E293B', '#0F172A', '#020617', '#000000',
  '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF',
  '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6',
  '#EC4899', '#DB2777', '#BE185D', '#9D174D',
  '#EF4444', '#DC2626', '#B91C1C', '#991B1B',
  '#F97316', '#EA580C', '#C2410C', '#9A3412',
  '#22C55E', '#16A34A', '#15803D', '#166534',
];

const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
  'linear-gradient(180deg, #1e40af 0%, #3b82f6 100%)',
];

export const QuickStyleEditor = ({
  sectionKey,
  currentStyles,
  supportsGradient = false,
  onStyleChange,
  disabled = false,
}: QuickStyleEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'bg' | 'text' | 'gradient'>('bg');

  const hasCustomStyles = 
    !!currentStyles.style_bg || 
    !!currentStyles.style_text || 
    !!currentStyles.style_gradient;

  const handleColorChange = (type: 'bg' | 'text' | 'gradient', value: string) => {
    const key = type === 'bg' ? 'style_bg' : type === 'text' ? 'style_text' : 'style_gradient';
    onStyleChange({ [key]: value });
  };

  const handleReset = () => {
    onStyleChange({
      style_bg: undefined,
      style_text: undefined,
      style_gradient: undefined,
    });
    setIsOpen(false);
  };

  const getCurrentValue = (type: 'bg' | 'text' | 'gradient') => {
    if (type === 'bg') return currentStyles.style_bg || '';
    if (type === 'text') return currentStyles.style_text || '';
    return currentStyles.style_gradient || '';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled}
          className={cn(
            "h-7 text-xs gap-1",
            hasCustomStyles && "bg-primary/10 border-primary/30"
          )}
        >
          <Palette className="w-3 h-3" />
          Cores
          {hasCustomStyles && <span className="text-primary">•</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-0" align="end">
        <div className="p-3 border-b flex items-center justify-between">
          <span className="font-medium text-sm">Editor rápido de cores</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('bg')}
            className={cn(
              "flex-1 py-2 text-xs font-medium transition-colors",
              activeTab === 'bg' 
                ? "border-b-2 border-primary text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Fundo
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={cn(
              "flex-1 py-2 text-xs font-medium transition-colors",
              activeTab === 'text' 
                ? "border-b-2 border-primary text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Texto
          </button>
          {supportsGradient && (
            <button
              onClick={() => setActiveTab('gradient')}
              className={cn(
                "flex-1 py-2 text-xs font-medium transition-colors",
                activeTab === 'gradient' 
                  ? "border-b-2 border-primary text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Gradiente
            </button>
          )}
        </div>

        <div className="p-3 space-y-3">
          {/* Color/Gradient Input */}
          {activeTab !== 'gradient' ? (
            <>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={getCurrentValue(activeTab) || '#ffffff'}
                  onChange={(e) => handleColorChange(activeTab, e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 shrink-0"
                />
                <Input
                  type="text"
                  value={getCurrentValue(activeTab)}
                  onChange={(e) => handleColorChange(activeTab, e.target.value)}
                  placeholder={activeTab === 'bg' ? '#FFFFFF' : '#000000'}
                  className="flex-1 font-mono text-sm h-10"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Cores predefinidas
                </Label>
                <div className="grid grid-cols-8 gap-1">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(activeTab, color)}
                      className={cn(
                        "w-6 h-6 rounded border transition-all hover:scale-110",
                        getCurrentValue(activeTab) === color && "ring-2 ring-primary ring-offset-1"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <Input
                type="text"
                value={getCurrentValue('gradient')}
                onChange={(e) => handleColorChange('gradient', e.target.value)}
                placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                className="font-mono text-xs h-10"
              />

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Gradientes predefinidos
                </Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {GRADIENT_PRESETS.map((gradient, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorChange('gradient', gradient)}
                      className={cn(
                        "h-8 rounded border transition-all hover:scale-105",
                        getCurrentValue('gradient') === gradient && "ring-2 ring-primary ring-offset-1"
                      )}
                      style={{ background: gradient }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Reset button */}
          {hasCustomStyles && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="w-full h-8 text-xs gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              Limpar estilos e usar tema global
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
