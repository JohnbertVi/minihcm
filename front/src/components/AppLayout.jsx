import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  History,
  ShieldCheck,
  BarChart3,
  UsersRound,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth.js";
import { logout } from "@/services/authService.js";
import { notify } from "@/utils/feedback.js";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import ConfirmDialog from "@/components/ConfirmDialog.jsx";

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function SidebarNavLink({ to, icon: Icon, children, end = false }) {
  const location = useLocation();
  const isActive = end
    ? location.pathname === to
    : location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={children}>
        <NavLink to={to}>
          <Icon className="size-4" />
          <span>{children}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function AppLayout() {
  const { profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      notify.success("Signed out successfully.");
      navigate("/login");
    } catch {
      notify.error("Could not sign out. Please try again.");
      setLoggingOut(false);
    }
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar" className="border-r border-emerald-100">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-3">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-emerald-600 p-1">
              <img
                src="/logo.png"
                alt="Mini Time Tracking"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="grid flex-1 leading-tight group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold text-emerald-950">Mini Time Tracking</span>
              <span className="text-xs text-emerald-700/80">Attendance</span>
            </div>
            <SidebarTrigger className="ml-auto size-8 text-emerald-800 hover:bg-emerald-50 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:ml-0" />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Employee</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarNavLink to="/dashboard" icon={LayoutDashboard}>
                  Dashboard
                </SidebarNavLink>
                <SidebarNavLink to="/history" icon={History}>
                  History
                </SidebarNavLink>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarNavLink to="/admin" icon={ShieldCheck} end>
                    Attendance
                  </SidebarNavLink>
                  <SidebarNavLink to="/admin/reports" icon={BarChart3}>
                    Reports
                  </SidebarNavLink>
                  <SidebarNavLink to="/admin/users" icon={UsersRound}>
                    Users
                  </SidebarNavLink>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center">
                    <Avatar className="size-8 border border-emerald-100">
                      <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-semibold">
                        {getInitials(profile?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="text-sm font-medium text-emerald-950 truncate">
                        {profile?.name || "Employee"}
                      </span>
                      <span className="text-xs text-emerald-700/80 capitalize">
                        {profile?.role || "employee"}
                      </span>
                    </div>
                  </div>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setLogoutOpen(true)}
                    tooltip="Logout"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="size-4" />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/40">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-emerald-100 bg-white/85 px-3 backdrop-blur sm:px-4 md:h-16">
          <SidebarTrigger className="size-8 text-emerald-800 hover:bg-emerald-50 md:hidden" />
          <div className="flex-1">
            <h1 className="text-base font-semibold text-emerald-950 sm:text-lg">
              {isAdmin ? "Admin Workspace" : "Employee Workspace"}
            </h1>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl p-3 sm:p-5 lg:p-8">
          <Outlet />
        </main>
      </SidebarInset>

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Logout"
        description="Are you sure you want to sign out of your account?"
        confirmLabel="Logout"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleLogout}
        loading={loggingOut}
      />
    </SidebarProvider>
  );
}
