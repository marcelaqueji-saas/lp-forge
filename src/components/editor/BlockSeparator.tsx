/**
 * BlockSeparator - Separador entre blocos com botão de adicionar
 */

import { Plus, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BlockSeparatorProps {
  position: number;
  canAddBlock: boolean;
  isLimitReached: boolean;
  onAddBlock: (position: number) => void;
  onUpgradeClick: () => void;
}

export const BlockSeparator = ({
  position,
  canAddBlock,
  isLimitReached,
  onAddBlock,
  onUpgradeClick,
}: BlockSeparatorProps) => {
  const handleClick = () => {
    if (isLimitReached) {
      onUpgradeClick();
    } else if (canAddBlock) {
      onAddBlock(position);
    }
  };

  return (
    <motion.div 
      className="relative py-4 group"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      {/* Linha separadora */}
      <div className="absolute inset-x-4 top-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Botão de adicionar */}
      <div className="relative flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          className={cn(
            "h-9 px-4 gap-2 rounded-full transition-all duration-300",
            "bg-card/80 backdrop-blur-sm border-border/50",
            "opacity-0 group-hover:opacity-100 focus:opacity-100",
            "hover:bg-primary hover:text-primary-foreground hover:border-primary",
            "shadow-sm hover:shadow-md",
            isLimitReached && "border-warning/50 hover:bg-warning hover:border-warning"
          )}
        >
          {isLimitReached ? (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Limite atingido</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Adicionar bloco</span>
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};
