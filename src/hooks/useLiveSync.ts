/**
 * useLiveSync - Sincronização em tempo real via Supabase Realtime
 */

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { LPContent } from '@/lib/lpContentApi';
import { SectionKey } from '@/lib/sectionModels';

interface UseLiveSyncOptions {
  lpId: string;
  enabled?: boolean;
  onContentUpdate?: (sectionKey: SectionKey, content: LPContent) => void;
  onSettingsUpdate?: (key: string, value: string) => void;
}

export function useLiveSync({
  lpId,
  enabled = true,
  onContentUpdate,
  onSettingsUpdate,
}: UseLiveSyncOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !lpId) return;

    // Configura canal de realtime
    const channel = supabase
      .channel(`lp-${lpId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lp_content',
          filter: `lp_id=eq.${lpId}`,
        },
        (payload) => {
          // Ignora updates muito recentes (provavelmente do próprio usuário)
          const now = Date.now();
          if (now - lastUpdateRef.current < 500) return;

          const { new: newRecord, eventType } = payload;
          if (eventType === 'UPDATE' || eventType === 'INSERT') {
            const record = newRecord as any;
            if (record && onContentUpdate) {
              try {
                const content = record.value ? JSON.parse(record.value) : {};
                onContentUpdate(record.section as SectionKey, content);
              } catch (e) {
                // Value não é JSON válido, usa como está
                onContentUpdate(record.section as SectionKey, { value: record.value } as LPContent);
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lp_settings',
          filter: `lp_id=eq.${lpId}`,
        },
        (payload) => {
          const now = Date.now();
          if (now - lastUpdateRef.current < 500) return;

          const { new: newRecord, eventType } = payload;
          if (eventType === 'UPDATE' || eventType === 'INSERT') {
            const record = newRecord as any;
            if (record && onSettingsUpdate) {
              onSettingsUpdate(record.key, record.value);
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [lpId, enabled, onContentUpdate, onSettingsUpdate]);

  // Marca timestamp para ignorar updates próprios
  const markLocalUpdate = useCallback(() => {
    lastUpdateRef.current = Date.now();
  }, []);

  return { markLocalUpdate };
}
