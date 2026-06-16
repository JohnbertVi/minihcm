import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { logout } from "../services/authService.js";

function navClass({ isActive }) {
  return [
    "rounded-md px-3 py-2 text-sm font-medium transition",
    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
  ].join(" ");
}

export default function AppLayout() {
  const { profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-slate-500">Mini Time Tracking</p>
            <h1 className="text-xl font-semibold text-slate-950">Attendance</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <NavLink className={navClass} to="/dashboard">
              Dashboard
            </NavLink>
            <NavLink className={navClass} to="/history">
              History
            </NavLink>
            {isAdmin && (
              <NavLink className={navClass} to="/admin">
                Admin
              </NavLink>
            )}
            {isAdmin && (
              <NavLink className={navClass} to="/admin/reports">
                Reports
              </NavLink>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <p className="font-medium text-slate-900">{profile?.name || "Employee"}</p>
              <p className="text-slate-500">{profile?.role || "employee"}</p>
            </div>
            <button
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
