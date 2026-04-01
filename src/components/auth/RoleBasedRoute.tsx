import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  allowedRoles: ('DOSEN' | 'MAHASISWA')[];
}

export const RoleBasedRoute = ({ allowedRoles }: Props) => {
  const { user } = useAuth();

  if (!user) return <Navigate replace to="/login" />;

  if (!user.role || !allowedRoles.includes(user.role)) {
    return <Navigate replace to="/dashboard" />;
  }

  return <Outlet />;
};