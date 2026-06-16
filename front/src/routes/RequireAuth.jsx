import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function RequireAuth({ children }) {
  const { firebaseUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-8 text-slate-600">
        Loading...
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
