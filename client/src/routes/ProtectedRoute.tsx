import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import FullPageLoader from '../components/common/FullPageLoader';
import type { Role } from '../types';

interface ProtectedRouteProps {
  /** Roles allowed to see the route. Any signed-in user is allowed when omitted. */
  roles?: Role[];
}

/**
 * Guards nested routes using the auth context:
 * - guests are sent to the sign in page (and returned afterwards),
 * - signed-in users without the required role are sent to the forbidden page.
 */
export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, initializing, hasRole } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !hasRole(...roles)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}
