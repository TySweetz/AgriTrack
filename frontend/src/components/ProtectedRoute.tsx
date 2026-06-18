import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  requiredRole?: 'agriculteur' | 'acheteur';
}

export const ProtectedRoute = ({ children, requiredRole }: Props) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) {
<<<<<<< Updated upstream
<<<<<<< HEAD
    return <Navigate to={user.role === 'acheteur' ? '/marketplace' : '/'} replace />;
=======
    return <Navigate to="/" replace />;
>>>>>>> 4eab4992ae8921ea84ed85e277dcd5509c9789be
=======
    return <Navigate to={user.role === 'acheteur' ? '/marketplace' : '/'} replace />;
>>>>>>> Stashed changes
  }

  return <>{children}</>;
};
