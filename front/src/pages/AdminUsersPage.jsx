import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import KpiCard from "@/components/KpiCard.jsx";
import { KpiSkeletonGrid, TableSkeletonRows } from "@/components/LoadingStates.jsx";
import EmptyState from "@/components/EmptyState.jsx";
import PageHeader from "@/components/PageHeader.jsx";
import api from "@/services/api.js";
import { getErrorMessage, notify } from "@/utils/feedback.js";
import { formatTimestamp } from "@/utils/format.js";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchUsers() {
      setLoading(true);

      try {
        const { data } = await api.get("/admin/users");

        if (active) {
          setUsers(data.users || []);
        }
      } catch (err) {
        if (active) {
          notify.error(getErrorMessage(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) {
      return users;
    }

    return users.filter((user) =>
      [user.name, user.email, user.role, user.timezone].some((value) =>
        String(value || "").toLowerCase().includes(needle),
      ),
    );
  }, [query, users]);

  const totals = users.reduce(
    (acc, user) => ({
      users: acc.users + 1,
      admins: acc.admins + (user.role === "admin" ? 1 : 0),
      employees: acc.employees + (user.role !== "admin" ? 1 : 0),
    }),
    { users: 0, admins: 0, employees: 0 },
  );

  return (
    <section className="space-y-6">
      <PageHeader
        title="User Management"
        description="Review employee profiles, roles, schedules, and timezone setup."
        meta="Administration"
        actions={
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700/60" />
            <Input
              aria-label="Search users"
              className="pl-9"
              placeholder="Search users"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        }
      />

      {loading ? (
        <KpiSkeletonGrid count={3} className="lg:grid-cols-3" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard label="Total Users" value={totals.users} tone="good" />
          <KpiCard label="Admins" value={totals.admins} tone="info" />
          <KpiCard label="Employees" value={totals.employees} />
        </div>
      )}

      <div className="space-y-3 md:hidden">
        {loading && Array.from({ length: 4 }).map((_, index) => (
          <Card className="border-emerald-100 bg-white shadow-sm" key={index}>
            <CardContent className="space-y-4 p-4">
              <Skeleton className="h-5 w-36 bg-emerald-100" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((__, itemIndex) => (
                  <Skeleton className="h-10 bg-emerald-100" key={itemIndex} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && filteredUsers.map((user) => (
          <Card className="border-emerald-100 bg-white shadow-sm" key={user.id || user.email}>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-emerald-950">{user.name || user.email}</p>
                  <p className="break-all text-xs text-emerald-800/70">{user.email}</p>
                </div>
                <Badge
                  className={
                    user.role === "admin"
                      ? "shrink-0 bg-sky-100 text-sky-800"
                      : "shrink-0 bg-emerald-100 text-emerald-800"
                  }
                >
                  {user.role || "employee"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <UserMetric label="Timezone" value={user.timezone || "Asia/Manila"} />
                <UserMetric label="Schedule" value={`${user.schedule?.start || "09:00"} to ${user.schedule?.end || "18:00"}`} />
                <UserMetric label="Created" value={formatTimestamp(user.createdAt)} />
                <UserMetric label="Updated" value={formatTimestamp(user.updatedAt)} />
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && !filteredUsers.length && (
          <Card className="border-emerald-100 bg-white shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-sm font-semibold text-emerald-950">
                {query ? "No users match your search" : "No users found"}
              </p>
              <p className="mt-1 text-sm text-emerald-800/70">
                {query ? "Try a different name, email, role, or timezone." : "Registered users will appear here."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="hidden overflow-hidden border-emerald-100 bg-white shadow-sm md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-emerald-50/80 text-xs uppercase text-emerald-800/70">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Timezone</th>
                  <th className="px-4 py-3">Schedule</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {loading && <TableSkeletonRows columns={6} rows={6} />}
                {!loading && filteredUsers.map((user) => (
                  <tr className="transition hover:bg-emerald-50/40" key={user.id || user.email}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-emerald-950">{user.name || user.email}</p>
                      <p className="text-xs text-emerald-800/70">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          user.role === "admin"
                            ? "bg-sky-100 text-sky-800"
                            : "bg-emerald-100 text-emerald-800"
                        }
                      >
                        {user.role || "employee"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-emerald-800/70">{user.timezone || "Asia/Manila"}</td>
                    <td className="px-4 py-3 text-emerald-800/70">
                      {user.schedule?.start || "09:00"} to {user.schedule?.end || "18:00"}
                    </td>
                    <td className="px-4 py-3 text-emerald-800/70">{formatTimestamp(user.createdAt)}</td>
                    <td className="px-4 py-3 text-emerald-800/70">{formatTimestamp(user.updatedAt)}</td>
                  </tr>
                ))}
                {!loading && !filteredUsers.length && (
                  <EmptyState
                    colSpan={6}
                    title={query ? "No users match your search" : "No users found"}
                    description={query ? "Try a different name, email, role, or timezone." : "Registered users will appear here."}
                  />
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function UserMetric({ label, value }) {
  return (
    <div className="rounded-md border border-emerald-100 bg-emerald-50/40 p-3">
      <p className="text-xs font-medium text-emerald-700/80">{label}</p>
      <p className="mt-1 break-words font-semibold text-emerald-950">{value}</p>
    </div>
  );
}
