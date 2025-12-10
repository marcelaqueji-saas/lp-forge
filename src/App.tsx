import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import {
  AdminMasterRoute,
  ClientRoute,
  ProtectedRoute,
} from "@/components/auth/ProtectedRoute";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

// Public pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Health from "./pages/Health";
import LandingPageBySlug from "./pages/LandingPageBySlug";
import SitePublic from "./pages/SitePublic";
import Sitenobron from "./pages/Sitenobron";

// Auth pages
import AuthRegister from "./pages/auth/AuthRegister";
import AuthLogin from "./pages/auth/AuthLogin";
import ResetPasswordRequest from "./pages/auth/ResetPasswordRequest";
import ResetPassword from "./pages/auth/ResetPassword";

// Client pages
import Onboarding from "./pages/Onboarding";
import OnboardingWizard from "./pages/OnboardingWizard";
import Dashboard from "./pages/Dashboard";
import MeuSite from "./pages/MeuSite";
import LPBuilder from "./pages/LPBuilder";
import CreateWizard from "./pages/CreateWizard";
import Upgrade from "./pages/Upgrade";
import LeadsExport from "./pages/client/LeadsExport";
import AnalyticsDashboard from "./pages/client/AnalyticsDashboard";
import Profile from "./pages/client/Profile";

// Admin LP pages (legacy - accessible to both)
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSectionsList from "./pages/admin/AdminSectionsList";
import AdminSectionEditor from "./pages/admin/AdminSectionEditor";
import AdminStyles from "./pages/admin/AdminStyles";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminLPPreview from "./pages/admin/AdminLPPreview";
import AdminUserRoles from "./pages/admin/AdminUserRoles";
import AdminDomainSettings from "./pages/admin/AdminDomainSettings";
import AdminSystemStatus from "./pages/admin/AdminSystemStatus";

// Sites admin pages
import AdminSitesDashboard from "./pages/admin/sites/AdminSitesDashboard";
import AdminSitesNew from "./pages/admin/sites/AdminSitesNew";
import AdminSitePages from "./pages/admin/sites/AdminSitePages";
import AdminSitePageEditor from "./pages/admin/sites/AdminSitePageEditor";
import AdminSiteSettings from "./pages/admin/sites/AdminSiteSettings";

// Master admin pages
import MasterDashboard from "./pages/master/MasterDashboard";
import MasterUsers from "./pages/master/MasterUsers";
import MasterPlans from "./pages/master/MasterPlans";
import MasterTemplates from "./pages/master/MasterTemplates";
import MasterSeparators from "./pages/master/MasterSeparators";
import MasterLPs from "./pages/master/MasterLPs";
import MasterAudit from "./pages/master/MasterAudit";
import MasterHomepage from "./pages/master/MasterHomepage";
import MasterSectionModels from "./pages/master/MasterSectionModels";

import InteresseNoBron from "./pages/marketing/InteresseNoBron";

const queryClient = new QueryClient();

// Componente para decidir quando mostrar o banner de cookies
const ConditionalCookieBanner = () => {
  const location = useLocation();
  
  // Não mostrar em rotas administrativas/auth
  const adminRoutes = ['/admin', '/master', '/painel', '/meu-site', '/auth', '/onboarding', '/reset-password'];
  const isAdminRoute = adminRoutes.some(route => location.pathname.startsWith(route));
  
  if (isAdminRoute) return null;
  
  return <CookieConsentBanner />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/health" element={<Health />} />
            <Route path="/healthz" element={<Health />} />
            <Route path="/nobron" element={<Sitenobron />} />
            <Route path="/interesse-nobron" element={<InteresseNoBron />}/>
            <Route path="/lp/:slug" element={<LandingPageBySlug />} />
            <Route path="/site/:siteSlug" element={<SitePublic />} />
            <Route path="/site/:siteSlug/:pageSlug" element={<SitePublic />} />

            {/* Auth routes */}
            <Route path="/auth/register" element={<AuthRegister />} />
            <Route path="/auth/login" element={<AuthLogin />} />
            <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Client onboarding routes */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/wizard"
              element={
                <ProtectedRoute>
                  <OnboardingWizard />
                </ProtectedRoute>
              }
            />

            {/* Client dashboard (admin_master também pode acessar) */}
            <Route
              path="/painel"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* LP Editor - acessível para qualquer usuário autenticado com acesso à LP */}
            <Route
              path="/meu-site/:lpId"
              element={
                <ProtectedRoute>
                  <MeuSite />
                </ProtectedRoute>
              }
            />

            {/* LP Builder - modo quebra-cabeça */}
            <Route
              path="/meu-site/:lpId/construtor"
              element={
                <ProtectedRoute>
                  <LPBuilder />
                </ProtectedRoute>
              }
            />

            {/* Upgrade page */}
            <Route
              path="/upgrade"
              element={
                <ProtectedRoute>
                  <Upgrade />
                </ProtectedRoute>
              }
            />

            {/* Profile page */}
            <Route
              path="/painel/perfil"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Create Wizard - Assistente guiado */}
            <Route
              path="/painel/create-wizard/:lpId"
              element={
                <ProtectedRoute>
                  <CreateWizard />
                </ProtectedRoute>
              }
            />

            {/* Leads Export - Sprint 4.3 */}
            <Route
              path="/painel/leads/:lpId"
              element={
                <ProtectedRoute>
                  <LeadsExport />
                </ProtectedRoute>
              }
            />

            {/* Analytics Dashboard - Sprint 4.3 */}
            <Route
              path="/painel/analytics/:lpId"
              element={
                <ProtectedRoute>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              }
            />

            {/* ============================================ */}
            {/* MASTER ADMIN ROUTES - admin_master only     */}
            {/* ============================================ */}
            <Route
              path="/master"
              element={
                <AdminMasterRoute>
                  <MasterDashboard />
                </AdminMasterRoute>
              }
            />
            <Route
              path="/master/users"
              element={
                <AdminMasterRoute>
                  <MasterUsers />
                </AdminMasterRoute>
              }
            />
            <Route
              path="/master/plans"
              element={
                <AdminMasterRoute>
                  <MasterPlans />
                </AdminMasterRoute>
              }
            />
            <Route
              path="/master/templates"
              element={
                <AdminMasterRoute>
                  <MasterTemplates />
                </AdminMasterRoute>
              }
            />
            <Route
              path="/master/separators"
              element={
                <AdminMasterRoute>
                  <MasterSeparators />
                </AdminMasterRoute>
              }
            />
            <Route
              path="/master/lps"
              element={
                <AdminMasterRoute>
                  <MasterLPs />
                </AdminMasterRoute>
              }
            />
            <Route
              path="/master/audit"
              element={
                <AdminMasterRoute>
                  <MasterAudit />
                </AdminMasterRoute>
              }
            />
            <Route
              path="/master/homepage"
              element={
                <AdminMasterRoute>
                  <MasterHomepage />
                </AdminMasterRoute>
              }
            />
            <Route
              path="/master/section-models"
              element={
                <AdminMasterRoute>
                  <MasterSectionModels />
                </AdminMasterRoute>
              }
            />

            {/* Legacy Admin routes - LP-specific management */}
            <Route
              path="/admin"
              element={
                <AdminMasterRoute>
                  <AdminDashboard />
                </AdminMasterRoute>
              }
            />
            <Route
              path="/admin/status"
              element={
                <AdminMasterRoute>
                  <AdminSystemStatus />
                </AdminMasterRoute>
              }
            />
            <Route
              path="/admin/lp/:id/sections"
              element={
                <ProtectedRoute>
                  <AdminSectionsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/lp/:id/sections/:section"
              element={
                <ProtectedRoute>
                  <AdminSectionEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/lp/:id/estilos"
              element={
                <ProtectedRoute>
                  <AdminStyles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/lp/:id/analytics"
              element={
                <ProtectedRoute>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/lp/:id/preview"
              element={
                <ProtectedRoute>
                  <AdminLPPreview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/lp/:id/usuarios"
              element={
                <ProtectedRoute>
                  <AdminUserRoles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/lp/:id/dominio"
              element={
                <ProtectedRoute>
                  <AdminDomainSettings />
                </ProtectedRoute>
              }
            />

            {/* Admin Sites routes - admin_master only */}
            <Route
              path="/admin/sites"
              element={
                <AdminMasterRoute>
                  <AdminSitesDashboard />
                </AdminMasterRoute>
              }
            />
            <Route
              path="/admin/sites/new"
              element={
                <AdminMasterRoute>
                  <AdminSitesNew />
                </AdminMasterRoute>
              }
            />
            <Route
              path="/admin/sites/:lpId/pages"
              element={
                <AdminMasterRoute>
                  <AdminSitePages />
                </AdminMasterRoute>
              }
            />
            <Route
              path="/admin/sites/:lpId/pages/:pageId"
              element={
                <AdminMasterRoute>
                  <AdminSitePageEditor />
                </AdminMasterRoute>
              }
            />
            <Route
              path="/admin/sites/:lpId/settings"
              element={
                <AdminMasterRoute>
                  <AdminSiteSettings />
                </AdminMasterRoute>
              }
            />
            <Route
              path="/admin/sites/:lpId/analytics"
              element={
                <AdminMasterRoute>
                  <AdminAnalytics />
                </AdminMasterRoute>
              }
            />
            <Route
              path="/admin/sites/:lpId/domain"
              element={
                <AdminMasterRoute>
                  <AdminDomainSettings />
                </AdminMasterRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Cookie Consent Banner - apenas em rotas públicas */}
          <ConditionalCookieBanner />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
