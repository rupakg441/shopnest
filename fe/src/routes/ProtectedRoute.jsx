import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    const loginPath = roles?.includes('admin') ? '/admin/login' : '/login';
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/account" replace />;
  }

  return children;
}
