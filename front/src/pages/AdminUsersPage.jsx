import { useEffect, useMemo, useState } from "react";
import { Clock3, Pencil, Search, ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import KpiCard from "@/components/KpiCard.jsx";
import { KpiSkeletonGrid, TableSkeletonRows } from "@/components/LoadingStates.jsx";
import EmptyState from "@/components/EmptyState.jsx";
import PageHeader from "@/components/PageHeader.jsx";
import ConfirmDialog from "@/components/ConfirmDialog.jsx";
import api from "@/services/api.js";
import { getErrorMessage, notify } from "@/utils/feedback.js";
import { formatTimestamp } from "@/utils/format.js";

function userToForm(user) {
  return {
    id: user.id,
    name: user.name || "",
    email: user.email || "",
    role: user.role || "employee",
    timezone: user.timezone || "Asia/Manila",
    scheduleStart: user.schedule?.start || "09:00",
    scheduleEnd: user.schedule?.end || "18:00",
  };
}

function setEditingValue(setEditing, key, value) {
  setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadUsers() {
    const { data } = await api.get("/admin/users");
    setUsers(Array.isArray(data.users) ? data.users : []);
  }

  useEffect(() => {
    let active = true;

    async function fetchUsers() {
      setLoading(true);

      try {
        if (active) {
          await loadUsers();
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

  function requestSave(event) {
    event.preventDefault();
    setConfirmOpen(true);
  }

  async function saveUser() {
    if (!editing) {
      return;
    }

    setSaving(true);

    try {
      await api.patch(`/admin/users/${editing.id}`, {
        name: editing.name.trim(),
        role: editing.role,
        timezone: editing.timezone.trim() || "Asia/Manila",
        schedule: {
          start: editing.scheduleStart,
          end: editing.scheduleEnd,
        },
      });
      await loadUsers();
      setConfirmOpen(false);
      setEditing(null);
      notify.success("Employee user updated.");
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

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
        description="Manage employee profile data, role access, timezone, and work schedule."
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
              <Button
                variant="outline"
                className="w-full border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
                onClick={() => setEditing(userToForm(user))}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Employee User
              </Button>
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
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-emerald-50/80 text-xs uppercase text-emerald-800/70">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Timezone</th>
                  <th className="px-4 py-3">Schedule</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {loading && <TableSkeletonRows columns={7} rows={6} />}
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
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
                        onClick={() => setEditing(userToForm(user))}
                      >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
                {!loading && !filteredUsers.length && (
                  <EmptyState
                    colSpan={7}
                    title={query ? "No users match your search" : "No users found"}
                    description={query ? "Try a different name, email, role, or timezone." : "Registered users will appear here."}
                  />
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && !saving && setEditing(null)}>
        <DialogContent className="border-emerald-100 bg-white text-emerald-950 sm:max-w-2xl">
          <form onSubmit={requestSave}>
            <DialogHeader>
              <DialogTitle className="text-xl">Edit Employee User</DialogTitle>
              <DialogDescription className="text-emerald-800/70">
                Update the user profile data used for access control and attendance calculations.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 space-y-5">
              <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
                  <UserRound className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {editing?.name || "Employee user"}
                  </p>
                  <p className="break-all text-xs text-slate-500">{editing?.email}</p>
                </div>
                <Badge
                  className={
                    editing?.role === "admin"
                      ? "shrink-0 bg-sky-100 text-sky-800"
                      : "shrink-0 bg-emerald-100 text-emerald-800"
                  }
                >
                  {editing?.role || "employee"}
                </Badge>
              </div>

              <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-emerald-700" />
                  <h3 className="text-sm font-semibold text-emerald-950">Profile</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="employee-name">Name</Label>
                    <Input
                      id="employee-name"
                      required
                      value={editing?.name || ""}
                      onChange={(event) => setEditingValue(setEditing, "name", event.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="employee-role">Role</Label>
                    <Select
                      value={editing?.role || "employee"}
                      onValueChange={(value) => setEditingValue(setEditing, "role", value)}
                    >
                      <SelectTrigger id="employee-role" className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-emerald-700" />
                  <h3 className="text-sm font-semibold text-emerald-950">Attendance Settings</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="employee-timezone">Timezone</Label>
                    <Input
                      id="employee-timezone"
                      required
                      value={editing?.timezone || ""}
                      onChange={(event) => setEditingValue(setEditing, "timezone", event.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="schedule-start">Schedule Start</Label>
                    <Input
                      id="schedule-start"
                      type="time"
                      required
                      value={editing?.scheduleStart || ""}
                      onChange={(event) => setEditingValue(setEditing, "scheduleStart", event.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="schedule-end">Schedule End</Label>
                    <Input
                      id="schedule-end"
                      type="time"
                      required
                      value={editing?.scheduleEnd || ""}
                      onChange={(event) => setEditingValue(setEditing, "scheduleEnd", event.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Review carefully before saving. Role changes affect admin access, and schedule changes affect attendance calculations.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Save employee changes?"
        description={`Please confirm updates for ${editing?.email || "this employee user"}. This prevents accidental changes to role, timezone, or schedule data.`}
        confirmLabel="Confirm Save"
        cancelLabel="Review Again"
        onConfirm={saveUser}
        loading={saving}
      />
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
