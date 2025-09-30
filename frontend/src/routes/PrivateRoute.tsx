// React import removed (new JSX runtime)
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function PrivateRoute() {
  const location = useLocation();
  const { authed, user, loading } = useAuth();

  // enquanto o estado de autenticação/usuário estiver carregando, não renderize nada
  if (loading) return null;

  if (!authed) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (!user) return null;

  const isGuardian = user.role === 'responsavel';

  const isAdminRoute = location.pathname.startsWith('/dashboard') || 
                       location.pathname.startsWith('/attendance') || 
                       location.pathname.startsWith('/students') || 
                       location.pathname.startsWith('/users') || 
                       location.pathname.startsWith('/files');

  const isGuardianRoute = location.pathname.startsWith('/guardian-dashboard');

  if (isGuardian && isAdminRoute) {
    // responsável tentando acessar rota de admin
    return <Navigate to="/guardian-dashboard" replace />;
  }

  if (!isGuardian && isGuardianRoute) {
    // admin tentando acessar rota do responsável
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}