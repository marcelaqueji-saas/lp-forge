import { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface StyleColorPickerProps {
  label: string;
  value: string;
  defaultValue?: string;
  globalValue?: string;
  onChange: (value: string) => void;
  onReset?: () => void;
  disabled?: boolean;
}

// Preset color palettes
const PRESET_COLORS = [
  '#3B82F6', '#2563EB', '#1D4ED8', // Blues
  '#8B5CF6', '#7C3AED', '#6D28D9', // Purples
  '#EC4899', '#DB2777', '#BE185D', // Pinks
  '#EF4444', '#DC2626', '#B91C1C', // Reds
  '#F97316', '#EA580C', '#C2410C', // Oranges
  '#EAB308', '#CA8A04', '#A16207', // Yellows
  '#22C55E', '#16A34A', '#15803D', // Greens
  '#14B8A6', '#0D9488', '#0F766E', // Teals
  '#06B6D4', '#0891B2', '#0E7490', // Cyans
  '#FFFFFF', '#F5F5F7', '#E5E7EB', // Lights
  '#9CA3AF', '#6B7280', '#4B5563', // Grays
  '#374151', '#1F2937', '#111827', // Darks
];

export const StyleColorPicker = ({
  label,
  value,
  defaultValue,
  globalValue,
  onChange,
  onReset,
  disabled,
}: StyleColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const displayValue = value || globalValue || defaultValue || '#FFFFFF';
  const isCustomized = !!value && value !== globalValue;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        {isCustomized && onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={disabled}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Usar global
          </Button>
        )}
      </div>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            disabled={disabled}
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-lg border transition-all",
              "hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20",
              disabled && "opacity-50 cursor-not-allowed",
              isCustomized && "border-primary/30 bg-primary/5"
            )}
          >
            <div 
              className="w-8 h-8 rounded-md border shadow-sm shrink-0"
              style={{ backgroundColor: displayValue }}
            />
            <div className="flex-1 text-left">
              <span className="text-sm font-mono">{displayValue}</span>
              {isCustomized && (
                <span className="ml-2 text-xs text-primary">(personalizado)</span>
              )}
            </div>
          </button>
        </PopoverTrigger>
        
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            {/* Color input */}
            <div className="flex gap-2">
              <input
                type="color"
                value={displayValue}
                onChange={(e) => onChange(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <Input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={globalValue || defaultValue}
                className="flex-1 font-mono text-sm h-10"
              />
            </div>
            
            {/* Preset colors */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Cores predefinidas</p>
              <div className="grid grid-cols-6 gap-1.5">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      onChange(color);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-7 h-7 rounded-md border transition-all hover:scale-110",
                      displayValue === color && "ring-2 ring-primary ring-offset-2"
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {displayValue === color && (
                      <Check className="w-4 h-4 mx-auto text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Global value hint */}
            {globalValue && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Valor global: 
                  <span 
                    className="ml-1 inline-block w-3 h-3 rounded align-middle border"
                    style={{ backgroundColor: globalValue }}
                  />
                  <span className="ml-1 font-mono">{globalValue}</span>
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
