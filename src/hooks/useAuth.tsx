import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, PlanTier, UserProfile, PlanLimits, getUserRole, getUserProfile, getUserPlanLimits, getUserSiteCount } from '@/lib/authApi';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  profile: UserProfile | null;
  planLimits: PlanLimits | null;
  siteCount: number;
  loading: boolean;
  isAdminMaster: boolean;
  isClient: boolean;
  canCreateSite: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  profile: null,
  planLimits: null,
  siteCount: 0,
  loading: true,
  isAdminMaster: false,
  isClient: true,
  canCreateSite: false,
  refresh: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [siteCount, setSiteCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    const [userRole, userProfile, limits, sites] = await Promise.all([
      getUserRole(),
      getUserProfile(),
      getUserPlanLimits(),
      getUserSiteCount()
    ]);

    setRole(userRole);
    setProfile(userProfile);
    setPlanLimits(limits);
    setSiteCount(sites);
  };

  const refresh = async () => {
    await loadUserData();
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer data loading with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            loadUserData().finally(() => setLoading(false));
          }, 0);
        } else {
          setRole(null);
          setProfile(null);
          setPlanLimits(null);
          setSiteCount(0);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserData().finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdminMaster = role === 'admin_master';
  const isClient = role === 'client' || role === null;
  const canCreateSiteFlag = planLimits ? siteCount < planLimits.max_sites : false;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      role,
      profile,
      planLimits,
      siteCount,
      loading,
      isAdminMaster,
      isClient,
      canCreateSite: canCreateSiteFlag,
      refresh
    }}>
      {children}
    </AuthContext.Provider>
  );
};
