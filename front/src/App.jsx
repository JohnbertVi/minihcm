import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppLayout from "./components/AppLayout.jsx";
import AuthLayout from "./components/AuthLayout.jsx";
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
    return (
      <>
        <AppToaster />
        <FirebaseSetupNotice missingKeys={missingFirebaseConfig} />
      </>
    );
  }

  return (
    <>
      <AppToaster />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
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
    </>
  );
}

function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3200,
        style: {
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.12)",
          color: "#0f172a",
          fontSize: "14px",
          padding: "12px 14px",
        },
        success: {
          iconTheme: {
            primary: "#059669",
            secondary: "#ffffff",
          },
        },
        error: {
          duration: 4600,
          iconTheme: {
            primary: "#dc2626",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}
