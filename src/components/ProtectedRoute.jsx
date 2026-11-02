import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="loading">Checking admin session…</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
