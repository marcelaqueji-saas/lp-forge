/**
 * LP API - Funções centralizadas para gerenciamento de Landing Pages
 */

import { supabase } from '@/integrations/supabase/client';
import { LandingPage } from './lpContentApi';

/**
 * Delete a landing page completely with all related data
 * Used by both Master panel and Client panel
 */
export async function deleteLandingPageCompletely(lpId: string): Promise<boolean> {
  try {
    // Delete in correct order to respect foreign keys
    
    // 1. Delete site pages first (if it's a site)
    await supabase.from('site_pages').delete().eq('lp_id', lpId);
    
    // 2. Delete webhook logs (depends on webhooks)
    const { data: webhooks } = await supabase
      .from('lp_webhooks')
      .select('id')
      .eq('lp_id', lpId);
    
    if (webhooks && webhooks.length > 0) {
      const webhookIds = webhooks.map(w => w.id);
      await supabase.from('lp_webhook_logs').delete().in('webhook_id', webhookIds);
    }
    
    // 3. Delete webhooks
    await supabase.from('lp_webhooks').delete().eq('lp_id', lpId);
    
    // 4. Delete AB tests
    await supabase.from('lp_ab_tests').delete().eq('lp_id', lpId);
    
    // 5. Delete section separators
    await supabase.from('lp_section_separators').delete().eq('lp_id', lpId);
    
    // 6. Delete cookie consents
    await supabase.from('cookie_consents').delete().eq('lp_id', lpId);
    
    // 7. Delete events
    await supabase.from('lp_events').delete().eq('lp_id', lpId);
    
    // 8. Delete leads
    await supabase.from('lp_leads').delete().eq('lp_id', lpId);
    
    // 9. Delete user roles for this LP
    await supabase.from('lp_user_roles').delete().eq('lp_id', lpId);
    
    // 10. Delete settings
    await supabase.from('lp_settings').delete().eq('lp_id', lpId);
    
    // 11. Delete content
    await supabase.from('lp_content').delete().eq('lp_id', lpId);
    
    // 12. Finally delete the LP itself
    const { error } = await supabase
      .from('landing_pages')
      .delete()
      .eq('id', lpId);

    if (error) {
      console.error('Error deleting LP:', error);
      return false;
    }

    // 13. Optional: Clean up media files from storage
    try {
      const { data: files } = await supabase.storage
        .from('lp-media')
        .list(lpId);
      
      if (files && files.length > 0) {
        const filePaths = files.map(f => `${lpId}/${f.name}`);
        await supabase.storage.from('lp-media').remove(filePaths);
      }
    } catch (storageError) {
      // Storage cleanup is optional, don't fail the whole operation
      console.warn('Could not clean storage:', storageError);
    }

    return true;
  } catch (error) {
    console.error('Error in deleteLandingPageCompletely:', error);
    return false;
  }
}

/**
 * Get all LPs for admin master
 */
export async function getAllLandingPages(): Promise<LandingPage[]> {
  const { data, error } = await supabase
    .from('landing_pages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all LPs:', error);
    return [];
  }

  return data as LandingPage[];
}

/**
 * Get user's LPs
 */
export async function getUserLandingPages(): Promise<LandingPage[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return [];

  const { data, error } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('owner_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user LPs:', error);
    return [];
  }

  return data as LandingPage[];
}

/**
 * Check if user can create more LPs based on their plan limits
 */
export async function canCreateMoreLPs(currentCount: number, maxAllowed: number): Promise<boolean> {
  return currentCount < maxAllowed;
}
