/**
 * EditorSettingsPanel - Painel de configurações do editor
 */

import { X, Palette, MessageCircle, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { WhatsAppConfigPanel } from './WhatsAppConfigPanel';
import { SeparatorConfigPanel } from './SeparatorConfigPanel';
import { ThemeSwitcher } from './ThemeSwitcher';
import { WhatsAppConfig } from '@/components/WhatsAppFloatingButton';
import { StylePreset, PlanLevelWithMaster } from '@/lib/sectionModels';

interface EditorSettingsPanelProps {
  open: boolean;
  onClose: () => void;
  // Theme
  currentTheme: StylePreset;
  onThemeChange: (theme: StylePreset) => void;
  canEditTheme: boolean;
  // WhatsApp
  whatsAppConfig: WhatsAppConfig;
  onWhatsAppChange: (key: keyof WhatsAppConfig, value: string) => void;
  // Separators
  separatorConfig: {
    separators_enabled?: string;
    separator_type?: string;
    separator_color?: string;
  };
  onSeparatorChange: (key: string, value: string) => void;
  // Plan
  userPlan: PlanLevelWithMaster;
  onUpgradeClick: () => void;
}

export const EditorSettingsPanel = ({
  open,
  onClose,
  currentTheme,
  onThemeChange,
  canEditTheme,
  whatsAppConfig,
  onWhatsAppChange,
  separatorConfig,
  onSeparatorChange,
  userPlan,
  onUpgradeClick,
}: EditorSettingsPanelProps) => {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Panel */}
      <aside className={cn(
        "fixed right-0 top-0 h-full w-80 bg-background border-l shadow-xl z-50",
        "transform transition-transform duration-300",
        open ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b">
          <h2 className="font-semibold text-sm">Configurações</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(100%-56px)]">
          <div className="p-4 space-y-6">
            
            {/* Theme Section */}
            {canEditTheme && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Tema visual</h3>
                </div>
                <ThemeSwitcher
                  currentTheme={currentTheme}
                  onThemeChange={onThemeChange}
                />
              </section>
            )}

            {canEditTheme && <Separator />}

            {/* WhatsApp Section */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Botão WhatsApp</h3>
              </div>
              <WhatsAppConfigPanel
                config={whatsAppConfig}
                onChange={onWhatsAppChange}
              />
            </section>

            <Separator />

            {/* Separators Section */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Separadores</h3>
              </div>
              <SeparatorConfigPanel
                config={separatorConfig}
                userPlan={userPlan}
                onChange={onSeparatorChange}
                onUpgradeClick={onUpgradeClick}
              />
            </section>
          </div>
        </ScrollArea>
      </aside>
    </>
  );
};
