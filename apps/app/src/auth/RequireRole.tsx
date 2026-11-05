import type { Role } from 'shared';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.js';

export function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: ReactNode;
}): JSX.Element {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-6 text-slate-500">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <div className="p-6 text-red-600">Acces refuse pour ce role.</div>;
  }

  return <>{children}</>;
}
