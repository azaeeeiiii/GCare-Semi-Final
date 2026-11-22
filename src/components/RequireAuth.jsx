// Protects routes by requiring users to log in and restricting admin-only pages.

import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../lib/auth';
export default function RequireAuth({ children, admin = false }) {
  const user = useUser();
  const location = useLocation();
  if (!user) return <Navigate to="/#login" state={{ from: location.pathname }} replace />;
  if (admin && !user.isAdmin) return <Navigate to="/feed" replace />;
  return children;
}
