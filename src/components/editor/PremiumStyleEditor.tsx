import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import {
  PremiumVisualConfig,
  BACKGROUND_OPTIONS,
  ORNAMENT_OPTIONS,
  ANIMATION_OPTIONS,
  BUTTON_OPTIONS,
  CURSOR_OPTIONS,
  SEPARATOR_OPTIONS,
  CARD_OPTIONS,
  BackgroundStyle,
  OrnamentStyle,
  AnimationPreset,
  ButtonStyle,
  CursorEffect,
  SeparatorStyle,
  CardStyle,
} from '@/lib/premiumPresets';

interface PremiumStyleEditorProps {
  sectionKey: string;
  currentConfig: PremiumVisualConfig;
  onChange: (config: Partial<PremiumVisualConfig>) => void;
  userPlan?: 'free' | 'pro' | 'premium';
  disabled?: boolean;
}

export const PremiumStyleEditor: React.FC<PremiumStyleEditorProps> = ({
  sectionKey,
  currentConfig,
  onChange,
  userPlan = 'free',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasCustomConfig = Object.values(currentConfig).some(
    (v) => v && v !== 'default' && v !== 'none'
  );

  const canUsePremium = userPlan === 'pro' || userPlan === 'premium';

  const handleChange = <K extends keyof PremiumVisualConfig>(
    key: K,
    value: PremiumVisualConfig[K]
  ) => {
    onChange({ [key]: value });
  };

  const renderSelect = <T extends string>(
    label: string,
    value: T | undefined,
    options: { value: T; label: string; premium?: boolean }[],
    onValueChange: (value: T) => void
  ) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value || options[0].value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => {
            const isPremiumLocked = option.premium && !canUsePremium;
            return (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={isPremiumLocked}
                className={cn(isPremiumLocked && 'opacity-50')}
              >
                <span className="flex items-center gap-2">
                  {option.label}
                  {option.premium && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      PRO
                    </span>
                  )}
                  {isPremiumLocked && <Lock className="w-3 h-3" />}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled}
          className={cn(
            'h-7 text-xs gap-1',
            hasCustomConfig && 'bg-primary/10 border-primary/30'
          )}
        >
          <Sparkles className="w-3 h-3" />
          Efeitos
          {hasCustomConfig && <span className="text-primary">•</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b flex items-center justify-between">
          <span className="font-medium text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Efeitos Premium
          </span>
          {!canUsePremium && (
            <span className="text-[10px] bg-warning/10 text-warning px-2 py-0.5 rounded-full">
              Alguns efeitos requerem PRO
            </span>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          <Accordion type="multiple" defaultValue={['appearance', 'animation']} className="w-full">
            {/* Aparência */}
            <AccordionItem value="appearance" className="border-b">
              <AccordionTrigger className="px-3 py-2 text-xs font-medium hover:no-underline">
                <span className="flex items-center gap-2">
                  📁 Aparência da seção
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                {renderSelect(
                  'Fundo e atmosfera',
                  currentConfig.background_style,
                  BACKGROUND_OPTIONS,
                  (v) => handleChange('background_style', v as BackgroundStyle)
                )}
                {renderSelect(
                  'Ornamentação',
                  currentConfig.ornament_style,
                  ORNAMENT_OPTIONS,
                  (v) => handleChange('ornament_style', v as OrnamentStyle)
                )}
                {renderSelect(
                  'Estilo dos cards',
                  currentConfig.card_style,
                  CARD_OPTIONS,
                  (v) => handleChange('card_style', v as CardStyle)
                )}
                {renderSelect(
                  'Separador (antes)',
                  currentConfig.separator_before,
                  SEPARATOR_OPTIONS,
                  (v) => handleChange('separator_before', v as SeparatorStyle)
                )}
                {renderSelect(
                  'Separador (depois)',
                  currentConfig.separator_after,
                  SEPARATOR_OPTIONS,
                  (v) => handleChange('separator_after', v as SeparatorStyle)
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Animação */}
            <AccordionItem value="animation" className="border-b">
              <AccordionTrigger className="px-3 py-2 text-xs font-medium hover:no-underline">
                <span className="flex items-center gap-2">
                  🎬 Animação de entrada
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                {renderSelect(
                  'Preset de animação',
                  currentConfig.animation_preset,
                  ANIMATION_OPTIONS,
                  (v) => handleChange('animation_preset', v as AnimationPreset)
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Estilos de ação */}
            <AccordionItem value="actions" className="border-b">
              <AccordionTrigger className="px-3 py-2 text-xs font-medium hover:no-underline">
                <span className="flex items-center gap-2">
                  🎯 Estilos de ação
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                {renderSelect(
                  'Estilo dos botões',
                  currentConfig.button_style,
                  BUTTON_OPTIONS,
                  (v) => handleChange('button_style', v as ButtonStyle)
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Interatividade */}
            <AccordionItem value="interactivity">
              <AccordionTrigger className="px-3 py-2 text-xs font-medium hover:no-underline">
                <span className="flex items-center gap-2">
                  🖱 Interatividade
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                {renderSelect(
                  'Efeito de cursor',
                  currentConfig.cursor_effect,
                  CURSOR_OPTIONS,
                  (v) => handleChange('cursor_effect', v as CursorEffect)
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Reset */}
        {hasCustomConfig && (
          <div className="p-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs"
              onClick={() =>
                onChange({
                  background_style: 'default',
                  ornament_style: 'none',
                  animation_preset: 'none',
                  button_style: 'default',
                  cursor_effect: 'none',
                  separator_before: 'none',
                  separator_after: 'none',
                  card_style: 'default',
                })
              }
            >
              Resetar todos os efeitos
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
