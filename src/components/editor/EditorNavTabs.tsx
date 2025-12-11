/**
 * EditorNavTabs - Navegação entre fases do editor
 */

import { Wand2, LayoutGrid, FileText, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export type EditorPhase = 'wizard' | 'structure' | 'content' | 'preview';

interface EditorNavTabsProps {
  phase: EditorPhase;
  onPhaseChange: (phase: EditorPhase) => void;
  className?: string;
}

const TABS: { id: EditorPhase; label: string; icon: React.ElementType }[] = [
  { id: 'wizard', label: 'Assistente', icon: Wand2 },
  { id: 'structure', label: 'Estrutura', icon: LayoutGrid },
  { id: 'content', label: 'Conteúdo', icon: FileText },
  { id: 'preview', label: 'Visualizar', icon: Eye },
];

export const EditorNavTabs = ({ phase, onPhaseChange, className }: EditorNavTabsProps) => {
  return (
    <nav className={cn("flex items-center justify-center", className)}>
      <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted/50">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onPhaseChange(id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              phase === id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// Mobile version - icon only
export const EditorNavTabsMobile = ({ phase, onPhaseChange }: Omit<EditorNavTabsProps, 'className'>) => {
  return (
    <nav className="flex items-center justify-center py-2 border-b bg-background/50">
      <div className="inline-flex items-center gap-0.5 p-1 rounded-xl bg-muted/50">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onPhaseChange(id)}
            className={cn(
              "flex items-center justify-center w-10 h-8 rounded-lg transition-all",
              phase === id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={label}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    </nav>
  );
};
