import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * Quando true, só permite admin_master.
   */
  requireAdmin?: boolean;
  /**
   * Quando true, só permite cliente comum.
   */
  requireClient?: boolean;
}

/**
 * Rota protegida genérica.
 * - Sem flags: qualquer usuário autenticado (admin_master ou client) entra.
 * - requireAdmin: só admin_master entra (cliente é redirecionado para /painel).
 * - requireClient: só client entra (admin_master é redirecionado para /master).
 */
export const ProtectedRoute = ({
  children,
  requireAdmin = false,
  requireClient = false,
}: ProtectedRouteProps) => {
  const { user, loading, isAdminMaster, isClient } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Não autenticado
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Rota exclusiva para admin_master
  if (requireAdmin && !isAdminMaster) {
    // Se for cliente logado, manda para o painel dele
    if (isClient) {
      return <Navigate to="/painel" replace />;
    }
    // Fallback: se por algum motivo não for client nem admin, força re-login
    return <Navigate to="/auth/login" replace />;
  }

  // Rota exclusiva para cliente
  if (requireClient && !isClient) {
    // Se for admin_master logado, manda pro painel master
    if (isAdminMaster) {
      return <Navigate to="/master" replace />;
    }
    // Fallback: força re-login
    return <Navigate to="/auth/login" replace />;
  }

  // Usuário autorizado
  return <>{children}</>;
};

// Wrapper para rotas do admin_master
export const AdminMasterRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requireAdmin>{children}</ProtectedRoute>
);

// Wrapper para rotas exclusivas de cliente
export const ClientRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requireClient>{children}</ProtectedRoute>
);
