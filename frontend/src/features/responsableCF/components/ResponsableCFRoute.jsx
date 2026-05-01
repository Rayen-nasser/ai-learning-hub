import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

export default function ResponsableCFRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0c0e]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user || !['responsableCF', 'admin'].includes(user.role)) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
