import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import FullPageLoader from '../components/common/FullPageLoader';

/** Only for signed-out users (sign in / sign up). Signed-in users go to their dashboard. */
export default function GuestRoute() {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) return <FullPageLoader />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}
