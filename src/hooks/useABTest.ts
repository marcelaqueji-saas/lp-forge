/**
 * Hook para gerenciamento de A/B Testing
 * Seleciona variante consistente por sessão
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getSessionData } from '@/lib/tracking';

interface ABTest {
  id: string;
  lp_id: string;
  section_key: string;
  name: string;
  variant_a_id: string;
  variant_b_id: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  traffic_split: number; // Porcentagem para variante A (0-100)
  winner_variant?: string | null;
  created_at: string;
}

interface UseABTestResult {
  tests: ABTest[];
  loading: boolean;
  getVariantForSection: (sectionKey: string) => string | null;
  createTest: (test: Omit<ABTest, 'id' | 'created_at'>) => Promise<ABTest | null>;
  updateTest: (id: string, updates: Partial<ABTest>) => Promise<boolean>;
  deleteTest: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

// Cache de variantes selecionadas por sessão
const sessionVariants: Record<string, string> = {};

/**
 * Determina variante com base no session_id de forma determinística
 */
const selectVariant = (
  sessionId: string,
  variantA: string,
  variantB: string,
  splitPercent: number
): string => {
  // Gerar hash simples do sessionId + teste
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    const char = sessionId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converter para 32bit integer
  }
  
  // Normalizar para 0-100
  const normalized = Math.abs(hash) % 100;
  
  // Retornar variante baseado no split
  return normalized < splitPercent ? variantA : variantB;
};

export const useABTest = (lpId: string): UseABTestResult => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTests = useCallback(async () => {
    if (!lpId) return;
    
    try {
      const { data, error } = await supabase
        .from('lp_ab_tests')
        .select('*')
        .eq('lp_id', lpId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ABTest] Error fetching tests:', error);
        return;
      }

      setTests((data as ABTest[]) || []);
    } catch (err) {
      console.error('[ABTest] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [lpId]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const getVariantForSection = useCallback((sectionKey: string): string | null => {
    // Buscar teste ativo para esta seção
    const activeTest = tests.find(
      t => t.section_key === sectionKey && t.status === 'active'
    );

    if (!activeTest) return null;

    // Verificar cache da sessão
    const cacheKey = `${lpId}:${sectionKey}`;
    if (sessionVariants[cacheKey]) {
      return sessionVariants[cacheKey];
    }

    // Selecionar variante de forma consistente
    const session = getSessionData();
    const selectedVariant = selectVariant(
      session.session_id,
      activeTest.variant_a_id,
      activeTest.variant_b_id,
      activeTest.traffic_split
    );

    // Cachear
    sessionVariants[cacheKey] = selectedVariant;

    return selectedVariant;
  }, [tests, lpId]);

  const createTest = useCallback(async (
    test: Omit<ABTest, 'id' | 'created_at'>
  ): Promise<ABTest | null> => {
    try {
      const { data, error } = await supabase
        .from('lp_ab_tests')
        .insert({
          lp_id: test.lp_id,
          section_key: test.section_key,
          name: test.name,
          variant_a_id: test.variant_a_id,
          variant_b_id: test.variant_b_id,
          status: test.status,
          traffic_split: test.traffic_split,
        })
        .select()
        .single();

      if (error) {
        console.error('[ABTest] Error creating test:', error);
        return null;
      }

      await fetchTests();
      return data as ABTest;
    } catch (err) {
      console.error('[ABTest] Error:', err);
      return null;
    }
  }, [fetchTests]);

  const updateTest = useCallback(async (
    id: string,
    updates: Partial<ABTest>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('lp_ab_tests')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('[ABTest] Error updating test:', error);
        return false;
      }

      await fetchTests();
      return true;
    } catch (err) {
      console.error('[ABTest] Error:', err);
      return false;
    }
  }, [fetchTests]);

  const deleteTest = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('lp_ab_tests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[ABTest] Error deleting test:', error);
        return false;
      }

      await fetchTests();
      return true;
    } catch (err) {
      console.error('[ABTest] Error:', err);
      return false;
    }
  }, [fetchTests]);

  return {
    tests,
    loading,
    getVariantForSection,
    createTest,
    updateTest,
    deleteTest,
    refetch: fetchTests,
  };
};

export default useABTest;
