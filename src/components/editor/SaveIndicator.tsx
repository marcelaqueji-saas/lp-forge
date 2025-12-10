/**
 * SaveIndicator - Indicador visual de salvamento contínuo
 * Sprint 4: Mostra status de salvamento em tempo real
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'offline' | 'error';

interface SaveIndicatorProps {
  status: SaveStatus;
  className?: string;
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<SaveStatus, {
  icon: React.ReactNode;
  label: string;
  color: string;
}> = {
  idle: {
    icon: <Cloud className="w-4 h-4" />,
    label: 'Pronto',
    color: 'text-muted-foreground',
  },
  saving: {
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
    label: 'Salvando...',
    color: 'text-primary',
  },
  saved: {
    icon: <Check className="w-4 h-4" />,
    label: 'Salvo',
    color: 'text-green-500',
  },
  offline: {
    icon: <CloudOff className="w-4 h-4" />,
    label: 'Offline',
    color: 'text-amber-500',
  },
  error: {
    icon: <CloudOff className="w-4 h-4" />,
    label: 'Erro ao salvar',
    color: 'text-destructive',
  },
};

export const SaveIndicator = ({
  status,
  className,
  showLabel = true,
}: SaveIndicatorProps) => {
  const config = STATUS_CONFIG[status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex items-center gap-1.5 text-sm transition-colors',
        config.color,
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={status}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.15 }}
        >
          {config.icon}
        </motion.span>
      </AnimatePresence>
      
      {showLabel && (
        <AnimatePresence mode="wait">
          <motion.span
            key={status}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs font-medium"
          >
            {config.label}
          </motion.span>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

// Hook para gerenciar o status de salvamento
import { useState, useCallback, useRef, useEffect } from 'react';

export function useSaveStatus(autoResetDelay = 2000) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setSaving = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus('saving');
  }, []);

  const setSaved = useCallback(() => {
    setStatus('saved');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setStatus('idle');
    }, autoResetDelay);
  }, [autoResetDelay]);

  const setError = useCallback(() => {
    setStatus('error');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setStatus('idle');
    }, autoResetDelay * 2);
  }, [autoResetDelay]);

  const setOffline = useCallback(() => {
    setStatus('offline');
  }, []);

  // Detectar conexão
  useEffect(() => {
    const handleOnline = () => {
      if (status === 'offline') setStatus('idle');
    };
    const handleOffline = () => setOffline();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar estado inicial
    if (!navigator.onLine) setOffline();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [status, setOffline]);

  return {
    status,
    setSaving,
    setSaved,
    setError,
    setOffline,
  };
}
