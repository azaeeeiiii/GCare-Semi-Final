import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../lib/auth';

/* Wrap a page in <RequireAuth> to make it members-only. Add the `admin` prop for admin-only pages.
   Logged-out visitors are sent to the home page with the Log In pop-up open,
   and returned here after they sign in. */
export default function RequireAuth({ children, admin = false }) {
  const user = useUser();
  const location = useLocation();
  if (!user) return <Navigate to="/#login" state={{ from: location.pathname }} replace />;
  if (admin && !user.isAdmin) return <Navigate to="/feed" replace />;
  return children;
}
