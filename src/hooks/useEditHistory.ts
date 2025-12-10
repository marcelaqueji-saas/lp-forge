/**
 * useEditHistory - Hook para Undo/Redo de alterações
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LPContent, saveSectionContent } from '@/lib/lpContentApi';
import { SectionKey } from '@/lib/sectionModels';
import { toast } from '@/hooks/use-toast';

interface HistoryEntry {
  id: string;
  sectionKey: SectionKey;
  content: LPContent;
  timestamp: number;
}

interface UseEditHistoryOptions {
  lpId: string;
  maxHistorySize?: number;
  backupInterval?: number; // A cada N alterações, faz backup
}

export function useEditHistory({
  lpId,
  maxHistorySize = 50,
  backupInterval = 5,
}: UseEditHistoryOptions) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);
  const changeCountRef = useRef(0);

  // Adicionar entrada ao histórico
  const pushHistory = useCallback((sectionKey: SectionKey, content: LPContent) => {
    const entry: HistoryEntry = {
      id: `${sectionKey}-${Date.now()}`,
      sectionKey,
      content: JSON.parse(JSON.stringify(content)), // Deep clone
      timestamp: Date.now(),
    };

    setHistory(prev => {
      // Remove entradas futuras se estivermos no meio do histórico
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(entry);
      
      // Limita tamanho
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }
      
      return newHistory;
    });
    
    setHistoryIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
    
    // Incrementa contador para backup
    changeCountRef.current += 1;
    if (changeCountRef.current >= backupInterval) {
      changeCountRef.current = 0;
      // Backup automático pode ser implementado aqui
    }
  }, [historyIndex, maxHistorySize, backupInterval]);

  // Undo
  const undo = useCallback(async (): Promise<HistoryEntry | null> => {
    if (historyIndex <= 0) {
      toast({ title: 'Nada para desfazer', variant: 'default' });
      return null;
    }

    const prevIndex = historyIndex - 1;
    const entry = history[prevIndex];
    
    if (!entry) return null;

    setIsSaving(true);
    try {
      await saveSectionContent(lpId, entry.sectionKey, entry.content);
      setHistoryIndex(prevIndex);
      toast({ title: 'Desfeito!' });
      return entry;
    } catch (error) {
      console.error('[useEditHistory] Undo error:', error);
      toast({ title: 'Erro ao desfazer', variant: 'destructive' });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [history, historyIndex, lpId]);

  // Redo
  const redo = useCallback(async (): Promise<HistoryEntry | null> => {
    if (historyIndex >= history.length - 1) {
      toast({ title: 'Nada para refazer', variant: 'default' });
      return null;
    }

    const nextIndex = historyIndex + 1;
    const entry = history[nextIndex];
    
    if (!entry) return null;

    setIsSaving(true);
    try {
      await saveSectionContent(lpId, entry.sectionKey, entry.content);
      setHistoryIndex(nextIndex);
      toast({ title: 'Refeito!' });
      return entry;
    } catch (error) {
      console.error('[useEditHistory] Redo error:', error);
      toast({ title: 'Erro ao refazer', variant: 'destructive' });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [history, historyIndex, lpId]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    isSaving,
    historyLength: history.length,
    currentIndex: historyIndex,
  };
}
