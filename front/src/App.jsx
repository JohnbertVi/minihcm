import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import RequireAdmin from "./routes/RequireAdmin.jsx";
import RequireAuth from "./routes/RequireAuth.jsx";
import AdminAttendancePage from "./pages/AdminAttendancePage.jsx";
import AdminReportsPage from "./pages/AdminReportsPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import FirebaseSetupNotice from "./components/FirebaseSetupNotice.jsx";
import { useAuth } from "./hooks/useAuth.js";

export default function App() {
  const { isFirebaseConfigured, missingFirebaseConfig } = useAuth();

  if (!isFirebaseConfigured) {
    return <FirebaseSetupNotice missingKeys={missingFirebaseConfig} />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminAttendancePage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RequireAdmin>
              <AdminReportsPage />
            </RequireAdmin>
          }
        />
      </Route>
    </Routes>
  );
}
