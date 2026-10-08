import { Navigate, Outlet, useLocation, type Location } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import FullPageLoader from '../components/common/FullPageLoader';

/**
 * Only for signed-out users (sign in / sign up).
 * This is the single place that redirects after authentication: back to the page the user
 * originally asked for, otherwise to the admin or user dashboard depending on their role.
 */
export default function GuestRoute() {
  const { isAuthenticated, isAdmin, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageLoader />;

  if (isAuthenticated) {
    const from = (location.state as { from?: Location } | null)?.from?.pathname;
    return <Navigate to={from ?? (isAdmin ? '/admin' : '/')} replace />;
  }

  return <Outlet />;
}
