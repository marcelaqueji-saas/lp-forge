/**
 * EditorHeader - Header limpo e minimalista para o editor
 */

import { ArrowLeft, Eye, ExternalLink, Loader2, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SaveIndicator, SaveStatus } from './SaveIndicator';

interface EditorHeaderProps {
  lpName: string;
  isPublished: boolean;
  isMaster: boolean;
  saveStatus: SaveStatus;
  onBack: () => void;
  onViewPublic: () => void;
  onPublish: () => void;
  onOpenSettings: () => void;
  saving?: boolean;
}

export const EditorHeader = ({
  lpName,
  isPublished,
  isMaster,
  saveStatus,
  onBack,
  onViewPublic,
  onPublish,
  onOpenSettings,
  saving = false,
}: EditorHeaderProps) => {
  return (
    <header className="h-14 bg-background/80 backdrop-blur-xl border-b flex items-center justify-between px-4 sticky top-0 z-50">
      {/* Left: Back + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="h-8 w-8 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <div className="min-w-0">
          <h1 className="font-medium text-sm truncate max-w-[200px]">{lpName}</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px] px-1.5 py-0",
                isPublished 
                  ? "border-green-500/50 text-green-600 bg-green-500/10" 
                  : "border-muted-foreground/30"
              )}
            >
              {isPublished ? 'Publicado' : 'Rascunho'}
            </Badge>
            {isMaster && (
              <Badge className="text-[10px] px-1.5 py-0 bg-amber-500/20 text-amber-600 border-amber-500/30">
                Master
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <SaveIndicator status={saveStatus} className="hidden sm:flex mr-2" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          className="h-8 w-8"
        >
          <Settings2 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onViewPublic}
          className="h-8 gap-1.5 text-xs hidden sm:flex"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ver página
        </Button>
        
        <Button 
          size="sm"
          onClick={onPublish}
          disabled={saving}
          className="h-8 text-xs"
          variant={isPublished ? 'outline' : 'default'}
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            isPublished ? 'Atualizar' : 'Publicar'
          )}
        </Button>
      </div>
    </header>
  );
};
