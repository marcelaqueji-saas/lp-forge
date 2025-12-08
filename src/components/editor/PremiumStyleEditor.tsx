import { useState } from 'react';
import { Sparkles, X, Loader2, Lock } from 'lucide-react';
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
  const [saving, setSaving] = useState(false);

  const hasCustomConfig = Object.values(currentConfig).some(
    (v) => v && v !== 'default' && v !== 'none'
  );

  const canUsePremium = userPlan === 'pro' || userPlan === 'premium';

  const handleChange = async <
    K extends keyof PremiumVisualConfig
  >(key: K, value: PremiumVisualConfig[K]) => {
    setSaving(true);
    await onChange({ [key]: value });
    setTimeout(() => setSaving(false), 300);
  };

  const renderSelect = <T extends string>(
    label: string,
    value: T | undefined,
    options: { value: T; label: string; premium?: boolean }[],
    onValueChange: (value: T) => void
  ) => (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Select
        value={value || options[0].value}
        disabled={disabled}
        onValueChange={onValueChange}
      >
        <SelectTrigger
          className={cn(
            "h-8 text-xs",
            "bg-white/60 backdrop-blur-xl border-white/40 shadow-sm",
            "hover:bg-white/70 transition-all"
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white/90 backdrop-blur-xl border-white/40 shadow-lg">
          {options.map((opt) => {
            const isLocked = opt.premium && !canUsePremium;
            return (
              <SelectItem
                key={opt.value}
                value={opt.value}
                disabled={isLocked}
                className={cn(isLocked && "opacity-40")}
              >
                <div className="flex items-center gap-2">
                  {opt.label}
                  {opt.premium && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1 rounded">
                      PRO
                    </span>
                  )}
                  {isLocked && <Lock className="w-3 h-3" />}
                </div>
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
          disabled={disabled}
          size="sm"
          className={cn(
            "h-7 text-xs gap-1 px-2",
            "bg-white/80 backdrop-blur-lg border border-white/40",
            "text-slate-900 shadow-sm hover:bg-white transition-all",
            hasCustomConfig && "border-primary/70 shadow-md",
            disabled && "opacity-50 pointer-events-none"
          )}
        >
          {saving ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3 text-primary" />
          )}
          Efeitos
          {hasCustomConfig && (
            <span className="text-primary ml-0.5">•</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-0 bg-card/80 backdrop-blur-2xl border-white/40 shadow-2xl"
      >
        <div className="p-3 border-b bg-white/60">
          <span className="font-medium text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Efeitos Premium
          </span>
          {!canUsePremium && (
            <p className="mt-1 text-[10px] text-warning">
              Alguns efeitos são PRO • Upgrade para desbloquear ✨
            </p>
          )}
        </div>

        {/* Opções */}
        <div className="max-h-[380px] overflow-y-auto">
          <Accordion
            type="multiple"
            defaultValue={["appearance", "animation"]}
          >
            <AccordionItem value="appearance">
              <AccordionTrigger className="px-3 py-2 text-xs font-medium">
                Aparência da seção
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                {renderSelect("Fundo", currentConfig.background_style, BACKGROUND_OPTIONS, (v) =>
                  handleChange("background_style", v as BackgroundStyle)
                )}
                {renderSelect("Ornamentos", currentConfig.ornament_style, ORNAMENT_OPTIONS, (v) =>
                  handleChange("ornament_style", v as OrnamentStyle)
                )}
                {renderSelect("Estilo dos Cards", currentConfig.card_style, CARD_OPTIONS, (v) =>
                  handleChange("card_style", v as CardStyle)
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="animation">
              <AccordionTrigger className="px-3 py-2 text-xs font-medium">
                Animação de entrada
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                {renderSelect("Animação", currentConfig.animation_preset, ANIMATION_OPTIONS, (v) =>
                  handleChange("animation_preset", v as AnimationPreset)
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cursor">
              <AccordionTrigger className="px-3 py-2 text-xs font-medium">
                Interatividade com o cursor
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                {renderSelect("Efeito", currentConfig.cursor_effect, CURSOR_OPTIONS, (v) =>
                  handleChange("cursor_effect", v as CursorEffect)
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {hasCustomConfig && (
          <div className="p-3 border-t bg-white/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onChange({
                  background_style: "default",
                  ornament_style: "none",
                  animation_preset: "none",
                  cursor_effect: "none",
                  separator_before: "none",
                  separator_after: "none",
                  card_style: "default",
                  button_style: "default",
                })
              }
              className="w-full h-8 text-xs"
            >
              Resetar efeitos
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
