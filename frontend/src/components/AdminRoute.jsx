import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <ProtectedRoute>
      {user?.role === 'admin' ? (
        children
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <span className="text-6xl">🚫</span>
          <h2 className="font-heading text-2xl font-bold text-navy">403 — Forbidden</h2>
          <p className="text-gray-500">You don't have permission to view this page.</p>
        </div>
      )}
    </ProtectedRoute>
  );
}
