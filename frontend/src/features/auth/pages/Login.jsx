import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import LoginForm from '../components/LoginForm';

const Login = () => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <LoginForm />
    </div>
  );
};

export default Login;
