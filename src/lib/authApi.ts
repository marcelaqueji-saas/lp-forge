import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin_master' | 'client';
export type PlanTier = 'free' | 'pro' | 'premium';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  plan: PlanTier;
  storage_used_mb: number;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface PlanLimits {
  id: string;
  plan: PlanTier;
  max_sites: number;
  max_storage_mb: number;
  custom_domain_limit: number;
  allowed_model_categories: string[];
  allowed_separator_categories: string[];
}

export interface UserWithDetails {
  id: string;
  email: string;
  display_name: string | null;
  plan: PlanTier;
  role: AppRole;
  lp_count: number;
  storage_used_mb: number;
  last_login_at: string | null;
  created_at: string;
}

// Get current user's role
export const getUserRole = async (): Promise<AppRole | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error || !data) return 'client';
  return data.role as AppRole;
};

// Check if current user is admin_master
export const isAdminMaster = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === 'admin_master';
};

// Get current user's profile
export const getUserProfile = async (): Promise<UserProfile | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data as UserProfile | null;
};

// Get plan limits for current user
export const getUserPlanLimits = async (): Promise<PlanLimits | null> => {
  const profile = await getUserProfile();
  if (!profile) return null;

  const { data, error } = await supabase
    .from('plan_limits')
    .select('*')
    .eq('plan', profile.plan)
    .single();

  if (error) {
    console.error('Error fetching plan limits:', error);
    return null;
  }

  return data as PlanLimits;
};

// Get user's site count
export const getUserSiteCount = async (): Promise<number> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return 0;

  const { count, error } = await supabase
    .from('landing_pages')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', session.user.id);

  if (error) return 0;
  return count || 0;
};

// Check if user can create more sites
export const canCreateSite = async (): Promise<boolean> => {
  const [siteCount, limits] = await Promise.all([
    getUserSiteCount(),
    getUserPlanLimits()
  ]);

  if (!limits) return false;
  return siteCount < limits.max_sites;
};

// Check if user can access a feature category
export const canAccessCategory = async (category: string): Promise<boolean> => {
  const limits = await getUserPlanLimits();
  if (!limits) return false;
  return limits.allowed_model_categories.includes(category);
};

// ============================================
// ADMIN MASTER FUNCTIONS
// ============================================

// Get all users with details (admin_master only)
export const getAllUsers = async (): Promise<UserWithDetails[]> => {
  const isAdmin = await isAdminMaster();
  if (!isAdmin) return [];

  // Get all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profilesError || !profiles) return [];

  // Get all roles
  const { data: roles } = await supabase
    .from('user_roles')
    .select('*');

  // Get LP counts per user
  const { data: lpCounts } = await supabase
    .from('landing_pages')
    .select('owner_id');

  // Get auth users for emails
  // Note: We can't access auth.users directly, so we'll use what we have

  const userCountMap: Record<string, number> = {};
  lpCounts?.forEach(lp => {
    if (lp.owner_id) {
      userCountMap[lp.owner_id] = (userCountMap[lp.owner_id] || 0) + 1;
    }
  });

  const roleMap: Record<string, AppRole> = {};
  roles?.forEach(r => {
    roleMap[r.user_id] = r.role as AppRole;
  });

  return profiles.map(p => ({
    id: p.user_id,
    email: p.display_name || 'Usuário',
    display_name: p.display_name,
    plan: p.plan as PlanTier,
    role: roleMap[p.user_id] || 'client',
    lp_count: userCountMap[p.user_id] || 0,
    storage_used_mb: p.storage_used_mb || 0,
    last_login_at: p.last_login_at,
    created_at: p.created_at,
  }));
};

// Update user's role (admin_master only)
export const updateUserRole = async (userId: string, newRole: AppRole): Promise<boolean> => {
  const isAdmin = await isAdminMaster();
  if (!isAdmin) return false;

  const { data: { session } } = await supabase.auth.getSession();
  
  // Prevent admin from removing their own admin_master role
  if (session?.user.id === userId && newRole !== 'admin_master') {
    const { count } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin_master');
    
    if (count === 1) {
      throw new Error('Não é possível remover o último admin_master');
    }
  }

  // Upsert the role
  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id,role' });

  if (error) {
    console.error('Error updating user role:', error);
    return false;
  }

  // Log the action
  await supabase.rpc('log_audit_event', {
    _action: 'update_role',
    _target_type: 'user',
    _target_id: userId,
    _details: { new_role: newRole }
  });

  return true;
};

// Update user's plan (admin_master only)
export const updateUserPlan = async (userId: string, newPlan: PlanTier): Promise<boolean> => {
  const isAdmin = await isAdminMaster();
  if (!isAdmin) return false;

  const { error } = await supabase
    .from('user_profiles')
    .update({ plan: newPlan, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating user plan:', error);
    return false;
  }

  // Log the action
  await supabase.rpc('log_audit_event', {
    _action: 'update_plan',
    _target_type: 'user',
    _target_id: userId,
    _details: { new_plan: newPlan }
  });

  return true;
};

// Get all plan limits (for admin editing)
export const getAllPlanLimits = async (): Promise<PlanLimits[]> => {
  const { data, error } = await supabase
    .from('plan_limits')
    .select('*')
    .order('max_sites', { ascending: true });

  if (error) return [];
  return data as PlanLimits[];
};

// Update plan limits (admin_master only)
export const updatePlanLimits = async (plan: PlanTier, updates: Partial<PlanLimits>): Promise<boolean> => {
  const isAdmin = await isAdminMaster();
  if (!isAdmin) return false;

  const { error } = await supabase
    .from('plan_limits')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('plan', plan);

  if (error) {
    console.error('Error updating plan limits:', error);
    return false;
  }

  return true;
};

// Get audit logs (admin_master only)
export const getAuditLogs = async (limit: number = 100) => {
  const isAdmin = await isAdminMaster();
  if (!isAdmin) return [];

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data;
};
