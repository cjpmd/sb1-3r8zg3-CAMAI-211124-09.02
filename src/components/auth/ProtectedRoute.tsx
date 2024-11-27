import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session } = useAuthStore();

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
