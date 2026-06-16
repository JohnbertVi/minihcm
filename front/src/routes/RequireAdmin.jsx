import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function RequireAdmin({ children }) {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
