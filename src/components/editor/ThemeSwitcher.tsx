import { useState } from 'react';
import { Palette, Moon, Sun, Zap, Sparkles, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { StylePreset } from '@/lib/sectionModels';

interface ThemeSwitcherProps {
  currentTheme?: StylePreset;
  onThemeChange: (theme: StylePreset) => Promise<void> | void;
  disabled?: boolean;
  className?: string;
}

interface ThemeOption {
  id: StylePreset;
  name: string;
  icon: typeof Sun;
  description: string;
  preview: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'glass',
    name: 'Glass',
    icon: Sparkles,
    description: 'Transparência e blur elegante',
    preview: 'bg-gradient-to-br from-white/80 to-white/40',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    icon: Sun,
    description: 'Limpo e sem distrações',
    preview: 'bg-white border border-zinc-200',
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: Moon,
    description: 'Tema escuro sofisticado',
    preview: 'bg-zinc-900',
  },
  {
    id: 'neon',
    name: 'Neon',
    icon: Zap,
    description: 'Brilhos e efeitos vibrantes',
    preview: 'bg-zinc-950 border border-primary/30',
  },
  {
    id: 'visionos',
    name: 'VisionOS',
    icon: Sparkles,
    description: 'Estilo Apple Vision Pro',
    preview: 'bg-gradient-to-b from-white to-zinc-100',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    icon: Palette,
    description: 'Gradientes coloridos sutis',
    preview: 'bg-gradient-to-br from-primary/10 to-accent/10',
  },
];

export const ThemeSwitcher = ({
  currentTheme = 'glass',
  onThemeChange,
  disabled = false,
  className,
}: ThemeSwitcherProps) => {
  const [isChanging, setIsChanging] = useState(false);
  const [open, setOpen] = useState(false);

  const currentOption = THEME_OPTIONS.find(t => t.id === currentTheme) || THEME_OPTIONS[0];
  const CurrentIcon = currentOption.icon;

  const handleThemeChange = async (theme: StylePreset) => {
    if (theme === currentTheme || isChanging) return;
    
    setIsChanging(true);
    try {
      await onThemeChange(theme);
      toast({
        title: 'Tema alterado',
        description: `O tema "${THEME_OPTIONS.find(t => t.id === theme)?.name}" foi aplicado.`,
      });
      setOpen(false);
    } catch (error) {
      console.error('Error changing theme:', error);
      toast({
        title: 'Erro ao alterar tema',
        description: 'Não foi possível aplicar o tema. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isChanging}
          className={cn("gap-2", className)}
        >
          {isChanging ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CurrentIcon className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{currentOption.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Tema Global da LP
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = option.id === currentTheme;
          
          return (
            <DropdownMenuItem
              key={option.id}
              onClick={() => handleThemeChange(option.id)}
              className={cn(
                "flex items-center gap-3 cursor-pointer py-2.5",
                isSelected && "bg-primary/10"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                option.preview,
                option.id === 'neon' && 'shadow-[0_0_10px_hsl(var(--primary)/0.3)]'
              )}>
                <Icon className={cn(
                  "w-4 h-4",
                  option.id === 'dark' || option.id === 'neon' ? 'text-zinc-300' : 'text-zinc-700'
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  isSelected && "text-primary"
                )}>
                  {option.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {option.description}
                </p>
              </div>
              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;