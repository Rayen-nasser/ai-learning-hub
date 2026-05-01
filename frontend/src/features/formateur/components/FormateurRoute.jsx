import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';

export default function FormateurRoute({ children }) {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'formateur') return <Navigate to="/" replace />;
  
  return children;
}
