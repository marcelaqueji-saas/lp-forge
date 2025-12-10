import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { SectionModel, StylePreset } from '@/lib/sectionModels';

interface TemplatePreviewProps {
  model: SectionModel;
  className?: string;
}

// Mini preview components for each section type
const HeroMiniPreview = ({ stylePreset }: { stylePreset: StylePreset }) => {
  const isDark = stylePreset === 'dark' || stylePreset === 'neon';
  const isNeon = stylePreset === 'neon';
  const isMinimal = stylePreset === 'minimal';
  
  return (
    <div className={cn(
      "w-full h-full p-2 flex flex-col items-center justify-center gap-1",
      isDark ? 'bg-zinc-900' : isMinimal ? 'bg-white' : 'bg-gradient-to-br from-primary/10 to-accent/10'
    )}>
      <div className={cn(
        "w-8 h-1.5 rounded-full",
        isNeon ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]' : isDark ? 'bg-zinc-600' : isMinimal ? 'bg-zinc-200' : 'bg-primary/30'
      )} />
      <div className={cn(
        "w-12 h-2 rounded-sm",
        isDark ? 'bg-zinc-400' : isMinimal ? 'bg-zinc-800' : 'bg-foreground/70'
      )} />
      <div className={cn(
        "w-10 h-1 rounded-full",
        isDark ? 'bg-zinc-600' : isMinimal ? 'bg-zinc-300' : 'bg-muted-foreground/30'
      )} />
      <div className={cn(
        "w-6 h-2 rounded-sm mt-1",
        isNeon ? 'bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.4)]' : isDark ? 'bg-zinc-500' : isMinimal ? 'bg-zinc-900' : 'bg-primary'
      )} />
    </div>
  );
};

const BeneficiosMiniPreview = ({ stylePreset }: { stylePreset: StylePreset }) => {
  const isDark = stylePreset === 'dark' || stylePreset === 'neon';
  const isNeon = stylePreset === 'neon';
  const isMinimal = stylePreset === 'minimal';
  
  return (
    <div className={cn(
      "w-full h-full p-2",
      isDark ? 'bg-zinc-900' : isMinimal ? 'bg-white' : 'bg-card/50'
    )}>
      <div className={cn(
        "w-8 h-1 rounded-full mx-auto mb-2",
        isDark ? 'bg-zinc-500' : isMinimal ? 'bg-zinc-800' : 'bg-foreground/70'
      )} />
      <div className="grid grid-cols-3 gap-1">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className={cn(
              "h-6 rounded-sm flex flex-col items-center justify-center gap-0.5",
              isNeon ? 'bg-zinc-800 border border-primary/30 shadow-[0_0_5px_hsl(var(--primary)/0.2)]' 
                : isDark ? 'bg-zinc-800' 
                : isMinimal ? 'bg-zinc-50 border border-zinc-200' 
                : 'bg-card border border-border/50'
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              isNeon ? 'bg-primary/50' : isDark ? 'bg-zinc-600' : isMinimal ? 'bg-zinc-300' : 'bg-primary/20'
            )} />
            <div className={cn(
              "w-4 h-0.5 rounded-full",
              isDark ? 'bg-zinc-600' : isMinimal ? 'bg-zinc-400' : 'bg-muted-foreground/30'
            )} />
          </div>
        ))}
      </div>
    </div>
  );
};

const PlanosMiniPreview = ({ stylePreset }: { stylePreset: StylePreset }) => {
  const isDark = stylePreset === 'dark' || stylePreset === 'neon';
  const isNeon = stylePreset === 'neon';
  const isMinimal = stylePreset === 'minimal';
  
  return (
    <div className={cn(
      "w-full h-full p-2",
      isDark ? 'bg-zinc-900' : isMinimal ? 'bg-white' : 'bg-card/50'
    )}>
      <div className="flex gap-1 justify-center">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className={cn(
              "w-5 rounded-sm flex flex-col items-center p-1",
              i === 1 
                ? isNeon 
                  ? 'h-9 bg-zinc-800 border border-primary shadow-[0_0_8px_hsl(var(--primary)/0.3)]'
                  : isDark 
                    ? 'h-9 bg-zinc-700 border border-zinc-600'
                    : isMinimal
                      ? 'h-9 bg-zinc-100 border-2 border-zinc-900'
                      : 'h-9 bg-primary/10 border border-primary/30'
                : isNeon
                  ? 'h-8 bg-zinc-800 border border-zinc-700'
                  : isDark 
                    ? 'h-8 bg-zinc-800' 
                    : isMinimal
                      ? 'h-8 bg-zinc-50 border border-zinc-200'
                      : 'h-8 bg-card border border-border/50'
            )}
          >
            <div className={cn(
              "w-3 h-1 rounded-full mb-1",
              isDark ? 'bg-zinc-500' : isMinimal ? 'bg-zinc-700' : 'bg-foreground/50'
            )} />
            <div className={cn(
              "w-2 h-0.5 rounded-full",
              isDark ? 'bg-zinc-600' : isMinimal ? 'bg-zinc-400' : 'bg-muted-foreground/30'
            )} />
          </div>
        ))}
      </div>
    </div>
  );
};

const CTAMiniPreview = ({ stylePreset }: { stylePreset: StylePreset }) => {
  const isDark = stylePreset === 'dark' || stylePreset === 'neon';
  const isNeon = stylePreset === 'neon';
  const isMinimal = stylePreset === 'minimal';
  
  return (
    <div className={cn(
      "w-full h-full flex flex-col items-center justify-center gap-1",
      isNeon ? 'bg-zinc-950' : isDark ? 'bg-zinc-900' : isMinimal ? 'bg-zinc-100' : 'bg-gradient-to-r from-primary to-primary/80'
    )}>
      {isNeon && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
      )}
      <div className={cn(
        "w-10 h-1.5 rounded-sm relative z-10",
        isDark ? 'bg-zinc-300' : isMinimal ? 'bg-zinc-800' : 'bg-white/90'
      )} />
      <div className={cn(
        "w-8 h-1 rounded-full relative z-10",
        isDark ? 'bg-zinc-500' : isMinimal ? 'bg-zinc-500' : 'bg-white/60'
      )} />
      <div className={cn(
        "w-6 h-2 rounded-sm mt-1 relative z-10",
        isNeon ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]' 
          : isDark ? 'bg-zinc-200' 
          : isMinimal ? 'bg-zinc-900'
          : 'bg-white'
      )} />
    </div>
  );
};

const GenericMiniPreview = ({ stylePreset }: { stylePreset: StylePreset }) => {
  const isDark = stylePreset === 'dark' || stylePreset === 'neon';
  const isNeon = stylePreset === 'neon';
  const isMinimal = stylePreset === 'minimal';
  
  return (
    <div className={cn(
      "w-full h-full p-2 flex flex-col items-center justify-center gap-1",
      isDark ? 'bg-zinc-900' : isMinimal ? 'bg-white' : 'bg-card/50'
    )}>
      <div className={cn(
        "w-8 h-1.5 rounded-sm",
        isDark ? 'bg-zinc-500' : isMinimal ? 'bg-zinc-800' : 'bg-foreground/60'
      )} />
      <div className={cn(
        "w-10 h-1 rounded-full",
        isDark ? 'bg-zinc-700' : isMinimal ? 'bg-zinc-300' : 'bg-muted-foreground/30'
      )} />
      <div className={cn(
        "w-full max-w-[80%] h-4 rounded-sm",
        isNeon ? 'bg-zinc-800 border border-primary/20' : isDark ? 'bg-zinc-800' : isMinimal ? 'bg-zinc-100 border border-zinc-200' : 'bg-card border border-border/50'
      )} />
    </div>
  );
};

export const TemplatePreview = ({ model, className }: TemplatePreviewProps) => {
  const PreviewComponent = useMemo(() => {
    const section = model.section;
    const preset = model.stylePreset || 'glass';
    
    switch (section) {
      case 'hero':
        return <HeroMiniPreview stylePreset={preset} />;
      case 'beneficios':
        return <BeneficiosMiniPreview stylePreset={preset} />;
      case 'planos':
        return <PlanosMiniPreview stylePreset={preset} />;
      case 'chamada_final':
        return <CTAMiniPreview stylePreset={preset} />;
      default:
        return <GenericMiniPreview stylePreset={preset} />;
    }
  }, [model.section, model.stylePreset]);

  return (
    <div className={cn(
      "aspect-video rounded-md overflow-hidden border border-border/50",
      className
    )}>
      {PreviewComponent}
    </div>
  );
};

export default TemplatePreview;