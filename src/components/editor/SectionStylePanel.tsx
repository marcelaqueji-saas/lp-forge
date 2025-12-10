/**
 * SectionStylePanel - Painel de edição de estilo da seção
 * Permite configurar background, cores e botões por seção
 */

import { useState, useCallback } from 'react';
import { Paintbrush, Image, Palette, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  BackgroundType,
  BackgroundMode,
  GRADIENT_PRESETS,
  COLOR_PRESETS,
} from '@/lib/sectionStyleTypes';
import {
  AVAILABLE_BUTTON_VARIANTS,
  AVAILABLE_BUTTON_RADIUS,
  BUTTON_VARIANT_CONFIG,
  ButtonVariant,
  ButtonRadius,
  getButtonClasses,
} from '@/lib/buttonVariants';

interface SectionStylePanelProps {
  sectionKey: string;
  backgroundMode: BackgroundMode;
  currentBackground?: {
    type?: BackgroundType;
    color?: string;
    gradient?: string;
    imageUrl?: string;
  };
  currentColors?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
  currentButton?: {
    variant?: string;
    colorOverride?: string;
    radius?: string;
  };
  onBackgroundChange: (config: { type: BackgroundType; value: string }) => void;
  onColorChange: (key: string, value: string) => void;
  onButtonChange: (key: string, value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const SectionStylePanel = ({
  sectionKey,
  backgroundMode,
  currentBackground,
  currentColors,
  currentButton,
  onBackgroundChange,
  onColorChange,
  onButtonChange,
  disabled = false,
  className,
}: SectionStylePanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bgTab, setBgTab] = useState<BackgroundType>(currentBackground?.type || 'solid');

  const handleColorSelect = useCallback((color: string) => {
    onBackgroundChange({ type: 'solid', value: color });
  }, [onBackgroundChange]);

  const handleGradientSelect = useCallback((gradient: string) => {
    onBackgroundChange({ type: 'gradient', value: gradient });
  }, [onBackgroundChange]);

  const isGlobalMode = backgroundMode === 'global';

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'w-full justify-between gap-2',
            isOpen && 'bg-muted'
          )}
          disabled={disabled}
        >
          <span className="flex items-center gap-2">
            <Paintbrush className="w-4 h-4" />
            <span>Estilo da Seção</span>
          </span>
          <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-4 p-3 sm:p-4 bg-muted/50 rounded-lg border"
            >
              {/* Aviso de modo global */}
              {isGlobalMode && (
                <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Fundo controlado pelas configurações gerais da página
                </div>
              )}

              {/* Background - só mostra se não for global */}
              {!isGlobalMode && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Fundo</Label>
                  
                  <Tabs value={bgTab} onValueChange={(v) => setBgTab(v as BackgroundType)}>
                    <TabsList className="grid grid-cols-3 h-9">
                      <TabsTrigger value="solid" className="text-xs">Cor</TabsTrigger>
                      <TabsTrigger value="gradient" className="text-xs">Gradiente</TabsTrigger>
                      <TabsTrigger value="image" className="text-xs">Imagem</TabsTrigger>
                    </TabsList>

                    <TabsContent value="solid" className="mt-3">
                      <div className="grid grid-cols-8 gap-1.5">
                        {COLOR_PRESETS.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleColorSelect(color)}
                            className={cn(
                              'w-full aspect-square rounded-md border transition-all hover:scale-110',
                              currentBackground?.color === color && 'ring-2 ring-primary ring-offset-1'
                            )}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                      <Input
                        type="text"
                        placeholder="#ffffff ou rgb(255,255,255)"
                        value={currentBackground?.color || ''}
                        onChange={(e) => handleColorSelect(e.target.value)}
                        className="mt-2 h-9 text-sm"
                      />
                    </TabsContent>

                    <TabsContent value="gradient" className="mt-3">
                      <div className="grid grid-cols-3 gap-2">
                        {GRADIENT_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => handleGradientSelect(preset.value)}
                            className={cn(
                              'h-12 rounded-md border transition-all hover:scale-105',
                              currentBackground?.gradient === preset.value && 'ring-2 ring-primary ring-offset-1'
                            )}
                            style={{ background: preset.value }}
                            title={preset.name}
                          />
                        ))}
                      </div>
                      <Input
                        type="text"
                        placeholder="linear-gradient(...)"
                        value={currentBackground?.gradient || ''}
                        onChange={(e) => handleGradientSelect(e.target.value)}
                        className="mt-2 h-9 text-sm"
                      />
                    </TabsContent>

                    <TabsContent value="image" className="mt-3">
                      <div className="space-y-2">
                        <Input
                          type="url"
                          placeholder="URL da imagem de fundo"
                          value={currentBackground?.imageUrl || ''}
                          onChange={(e) => onBackgroundChange({ type: 'image', value: e.target.value })}
                          className="h-9 text-sm"
                        />
                        {currentBackground?.imageUrl && (
                          <div 
                            className="h-20 rounded-md border bg-cover bg-center"
                            style={{ backgroundImage: `url(${currentBackground.imageUrl})` }}
                          />
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Cores da seção */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Cores da Seção</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Primária</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={currentColors?.primaryColor || '#3b82f6'}
                        onChange={(e) => onColorChange('primary_color', e.target.value)}
                        className="w-10 h-9 rounded border cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={currentColors?.primaryColor || ''}
                        onChange={(e) => onColorChange('primary_color', e.target.value)}
                        placeholder="#3b82f6"
                        className="h-9 text-xs flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Secundária</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={currentColors?.secondaryColor || '#64748b'}
                        onChange={(e) => onColorChange('secondary_color', e.target.value)}
                        className="w-10 h-9 rounded border cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={currentColors?.secondaryColor || ''}
                        onChange={(e) => onColorChange('secondary_color', e.target.value)}
                        placeholder="#64748b"
                        className="h-9 text-xs flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Destaque</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={currentColors?.accentColor || '#f59e0b'}
                        onChange={(e) => onColorChange('accent_color', e.target.value)}
                        className="w-10 h-9 rounded border cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={currentColors?.accentColor || ''}
                        onChange={(e) => onColorChange('accent_color', e.target.value)}
                        placeholder="#f59e0b"
                        className="h-9 text-xs flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modelo de botão */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Estilo do Botão</Label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_BUTTON_VARIANTS.map((variant) => {
                    const config = BUTTON_VARIANT_CONFIG[variant];
                    const isSelected = currentButton?.variant === variant;
                    return (
                      <button
                        key={variant}
                        onClick={() => onButtonChange('button_variant', variant)}
                        className={cn(
                          'p-2 rounded-lg border transition-all text-center',
                          isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted'
                        )}
                      >
                        {/* Preview do botão */}
                        <div 
                          className={cn(
                            'px-3 py-1.5 text-xs mb-1 mx-auto w-fit',
                            getButtonClasses({ variant, radius: 'medium' })
                          )}
                        >
                          Botão
                        </div>
                        <span className="text-xs text-muted-foreground">{config.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Radius do botão */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground whitespace-nowrap">Bordas:</label>
                  <div className="flex gap-1 flex-1">
                    {AVAILABLE_BUTTON_RADIUS.map((radius) => (
                      <button
                        key={radius}
                        onClick={() => onButtonChange('button_radius', radius)}
                        className={cn(
                          'flex-1 px-2 py-1 text-xs rounded transition-all border',
                          currentButton?.radius === radius 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-muted'
                        )}
                      >
                        {radius === 'small' && 'Reto'}
                        {radius === 'medium' && 'Médio'}
                        {radius === 'large' && 'Grande'}
                        {radius === 'full' && 'Pill'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Override de cor do botão */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground whitespace-nowrap">Cor:</label>
                  <input
                    type="color"
                    value={currentButton?.colorOverride || '#3b82f6'}
                    onChange={(e) => onButtonChange('button_color_override', e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={currentButton?.colorOverride || ''}
                    onChange={(e) => onButtonChange('button_color_override', e.target.value)}
                    placeholder="Usar cor primária"
                    className="h-8 text-xs flex-1"
                  />
                  {currentButton?.colorOverride && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onButtonChange('button_color_override', '')}
                      className="h-8 px-2 text-xs"
                    >
                      Limpar
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SectionStylePanel;
