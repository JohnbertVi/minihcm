import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmptyState from "@/components/EmptyState.jsx";
import { TableSkeletonRows } from "@/components/LoadingStates.jsx";
import PageHeader from "@/components/PageHeader.jsx";
import api from "@/services/api.js";
import { getErrorMessage, notify } from "@/utils/feedback.js";
import { formatTimestamp, timestampToInput, todayIso } from "@/utils/format.js";
import { Loader2, Pencil } from "lucide-react";

function localInputToIso(value) {
  return value ? new Date(value).toISOString() : null;
}

export default function AdminAttendancePage() {
  const [date, setDate] = useState(todayIso());
  const [records, setRecords] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadRecords() {
    const { data } = await api.get("/admin/attendance", { params: { date } });
    setRecords(data.records);
  }

  useEffect(() => {
    let active = true;

    async function fetchRecords() {
      setLoading(true);

      try {
        const { data } = await api.get("/admin/attendance", { params: { date } });

        if (active) {
          setRecords(data.records);
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

    fetchRecords();

    return () => {
      active = false;
    };
  }, [date]);



  async function saveEdit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      await api.patch(`/admin/attendance/${editing.id}`, {
        punchIn: localInputToIso(editing.punchInInput),
        punchOut: localInputToIso(editing.punchOutInput),
      });
      setEditing(null);
      await loadRecords();
      notify.success("Attendance updated and summary recomputed.");
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Admin Attendance"
        description="View employee punches and correct records when needed."
        meta="Admin tools"
        actions={
          <div className="w-full space-y-1.5 sm:w-auto">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full sm:w-auto"
            />
          </div>
        }
      />

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
        {!loading && records.map((record) => (
          <Card className="border-emerald-100 bg-white shadow-sm" key={record.id}>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-950">
                    {record.employeeName || record.email}
                  </p>
                  <p className="text-xs text-emerald-800/70">{record.date}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
                  onClick={() =>
                    setEditing({
                      ...record,
                      punchInInput: timestampToInput(record.punchIn),
                      punchOutInput: timestampToInput(record.punchOut),
                    })
                  }
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <AdminMetric label="Punch In" value={formatTimestamp(record.punchIn)} />
                <AdminMetric label="Punch Out" value={formatTimestamp(record.punchOut)} />
                <AdminMetric label="Edited by Admin" value={record.editedByAdmin ? "Yes" : "No"} />
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && !records.length && (
          <Card className="border-emerald-100 bg-white shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-sm font-semibold text-emerald-950">No records for this date</p>
              <p className="mt-1 text-sm text-emerald-800/70">Completed punch records will appear here.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="hidden overflow-hidden border-emerald-100 bg-white shadow-sm md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-emerald-50/80 text-xs uppercase text-emerald-800/70">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Punch In</th>
                  <th className="px-4 py-3">Punch Out</th>
                  <th className="px-4 py-3">Edited</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {loading && <TableSkeletonRows columns={6} rows={6} />}
                {!loading && records.map((record) => (
                  <tr className="transition hover:bg-emerald-50/40" key={record.id}>
                    <td className="px-4 py-3 font-medium text-emerald-950">
                      {record.employeeName || record.email}
                    </td>
                    <td className="px-4 py-3 text-emerald-800/70">{record.date}</td>
                    <td className="px-4 py-3 text-emerald-800/70">{formatTimestamp(record.punchIn)}</td>
                    <td className="px-4 py-3 text-emerald-800/70">{formatTimestamp(record.punchOut)}</td>
                    <td className="px-4 py-3 text-emerald-800/70">{record.editedByAdmin ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
                        onClick={() =>
                          setEditing({
                            ...record,
                            punchInInput: timestampToInput(record.punchIn),
                            punchOutInput: timestampToInput(record.punchOut),
                          })
                        }
                      >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
                {!loading && !records.length && (
                  <EmptyState colSpan={6} title="No records for this date" description="Completed punch records will appear here." />
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={saveEdit}>
            <DialogHeader>
              <DialogTitle>Edit {editing?.employeeName || editing?.email}</DialogTitle>
              <DialogDescription>Saving recalculates the matching daily summary.</DialogDescription>
            </DialogHeader>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="punchIn">Punch In</Label>
                <Input
                  id="punchIn"
                  type="datetime-local"
                  required
                  value={editing?.punchInInput || ""}
                  onChange={(event) =>
                    setEditing((prev) => (prev ? { ...prev, punchInInput: event.target.value } : prev))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="punchOut">Punch Out</Label>
                <Input
                  id="punchOut"
                  type="datetime-local"
                  required
                  value={editing?.punchOutInput || ""}
                  onChange={(event) =>
                    setEditing((prev) => (prev ? { ...prev, punchOutInput: event.target.value } : prev))
                  }
                />
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function AdminMetric({ label, value }) {
  return (
    <div className="rounded-md border border-emerald-100 bg-emerald-50/40 p-3">
      <p className="text-xs font-medium text-emerald-700/80">{label}</p>
      <p className="mt-1 break-words font-semibold text-emerald-950">{value}</p>
    </div>
  );
}
