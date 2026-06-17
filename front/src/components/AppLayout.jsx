import { useEffect, useState } from "react";
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
import TimeClockWidget from "@/components/TimeClockWidget.jsx";

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
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={children}
        className="h-10 rounded-lg px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-950 data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-800 data-[active=true]:shadow-[inset_3px_0_0_#059669]"
      >
        <NavLink to={to}>
          <Icon className="size-4" />
          <span>{children}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function DigitalClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const time = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);

  const date = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(now);

  return (
    <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 text-center sm:block">
      <p className="font-mono text-lg font-semibold leading-none tracking-normal text-slate-950">
        {time}
      </p>
      <p className="mt-1 text-xs font-medium text-slate-500">{date}</p>
    </div>
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
      <Sidebar collapsible="icon" variant="sidebar" className="border-r border-slate-200/80 bg-white">
        <SidebarHeader className="border-b border-slate-100">
          <div className="flex items-center gap-2 px-2 py-3 group-data-[collapsible=icon]:justify-center">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md group-data-[collapsible=icon]:hidden">
              <img
                src="/logo.png"
                alt="Mini Time Tracking"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="grid flex-1 leading-tight group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold text-slate-950">Mini Time Tracking</span>
              <span className="text-xs text-slate-500">Attendance</span>
            </div>
            <SidebarTrigger className="ml-auto size-8 text-slate-700 hover:bg-slate-100 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:ml-0" />
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
          {isAdmin && (
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="px-3 text-[0.68rem] font-semibold uppercase tracking-wide text-slate-400">
                Administration
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  <SidebarNavLink to="/admin" icon={ShieldCheck} end>
                    Employee Records
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

          {!isAdmin && (
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="px-3 text-[0.68rem] font-semibold uppercase tracking-wide text-slate-400">
                Employee
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  <SidebarNavLink to="/dashboard" icon={LayoutDashboard}>
                    Dashboard
                  </SidebarNavLink>
                  <SidebarNavLink to="/history" icon={History}>
                    Attendance History
                  </SidebarNavLink>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="border-t border-slate-100 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 group-data-[collapsible=icon]:hidden">
                    <Avatar className="size-8 border border-slate-200">
                      <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-semibold">
                        {getInitials(profile?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="text-sm font-medium text-slate-950 truncate">
                        {profile?.name || "Employee"}
                      </span>
                      <span className="text-xs text-slate-500 capitalize">
                        {profile?.role || "employee"}
                      </span>
                    </div>
                  </div>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setLogoutOpen(true)}
                    tooltip="Logout"
                    className="h-10 rounded-lg px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
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

      <SidebarInset className="bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-3 backdrop-blur sm:px-4 md:h-16">
          <SidebarTrigger className="size-8 text-slate-700 hover:bg-slate-100 md:hidden" />
          <div className="flex-1">
            <h1 className="text-base font-semibold text-slate-950 sm:text-lg">
              {isAdmin ? "Admin Workspace" : "Employee Workspace"}
            </h1>
          </div>
          <DigitalClock />
        </header>

        <main className="mx-auto w-full max-w-7xl p-3 pb-28 sm:p-5 sm:pb-28 lg:p-8 lg:pb-28">
          <Outlet />
        </main>
      </SidebarInset>

      {!isAdmin && <TimeClockWidget />}

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
