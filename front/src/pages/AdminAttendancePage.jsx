import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ConfirmDialog from "@/components/ConfirmDialog.jsx";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Clock3, Pencil, ShieldCheck, UserRound } from "lucide-react";

function localInputToIso(value) {
  return value ? new Date(value).toISOString() : null;
}

function recordMillis(record, field) {
  const value = record?.[field];
  if (!value) return null;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  if (value._seconds) return value._seconds * 1000;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function latestRecordMillis(record) {
  return Math.max(
    recordMillis(record, "createdAt") || 0,
    recordMillis(record, "updatedAt") || 0,
    recordMillis(record, "punchIn") || 0,
    recordMillis(record, "punchOut") || 0,
  );
}

function isNewRecord(record) {
  const created = recordMillis(record, "createdAt");
  if (!created) return false;
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return created >= oneDayAgo;
}

function buildEditingRecord(record) {
  return {
    ...record,
    punchInInput: timestampToInput(record.punchIn),
    punchOutInput: timestampToInput(record.punchOut),
  };
}

function getPunchTimeError(punchInInput, punchOutInput) {
  const punchIn = new Date(punchInInput);
  const punchOut = new Date(punchOutInput);

  if (!punchInInput || Number.isNaN(punchIn.getTime())) {
    return "Enter a valid punch in time.";
  }

  if (!punchOutInput || Number.isNaN(punchOut.getTime())) {
    return "Enter a valid punch out time.";
  }

  if (punchOut <= punchIn) {
    return "Punch out must be later than punch in.";
  }

  return "";
}

export default function AdminAttendancePage() {
  const [date, setDate] = useState(todayIso());
  const [records, setRecords] = useState([]);
  const [editing, setEditing] = useState(null);
  const [punchTimeError, setPunchTimeError] = useState("");
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadRecords() {
    const { data } = await api.get("/admin/attendance", { params: { date } });
    const raw = Array.isArray(data.records) ? data.records : [];
    setRecords(
      raw.sort((a, b) => {
        const dateCompare = String(b.date || "").localeCompare(String(a.date || ""));
        if (dateCompare !== 0) return dateCompare;
        return latestRecordMillis(b) - latestRecordMillis(a);
      }),
    );
  }

  useEffect(() => {
    let active = true;

    async function fetchRecords() {
      setLoading(true);

      try {
        const { data } = await api.get("/admin/attendance", { params: { date } });

        if (active) {
          const raw = Array.isArray(data.records) ? data.records : [];
          setRecords(
            raw.sort((a, b) => {
              const dateCompare = String(b.date || "").localeCompare(String(a.date || ""));
              if (dateCompare !== 0) return dateCompare;
              return latestRecordMillis(b) - latestRecordMillis(a);
            }),
          );
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

  function requestSaveEdit(event) {
    event.preventDefault();

    const validationError = getPunchTimeError(editing?.punchInInput, editing?.punchOutInput);

    if (validationError) {
      setPunchTimeError(validationError);
      return;
    }

    setPunchTimeError("");
    setConfirmSaveOpen(true);
  }

  function openEditor(record) {
    setPunchTimeError("");
    setEditing(buildEditingRecord(record));
  }

  function closeEditor() {
    setPunchTimeError("");
    setEditing(null);
  }

  async function saveEdit() {
    if (!editing) {
      return;
    }

    setSaving(true);

    try {
      await api.patch(`/admin/attendance/${editing.id}`, {
        punchIn: localInputToIso(editing.punchInInput),
        punchOut: localInputToIso(editing.punchOutInput),
      });
      setConfirmSaveOpen(false);
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
    <TooltipProvider>
      <section className="min-w-0 space-y-6">
      <PageHeader
        title="Employee Records"
        description="Review attendance history by date, inspect employee punch records, and correct punch times when needed."
        meta="Administration"
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
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {isNewRecord(record) && (
                      <Badge className="shrink-0 bg-emerald-100 text-emerald-800">
                        New
                      </Badge>
                    )}
                    <p className="truncate text-sm font-semibold text-emerald-950">
                      {record.employeeName || record.email}
                    </p>
                  </div>
                  <p className="text-xs text-emerald-800/70">{record.date}</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className="shrink-0 border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
                      onClick={() => openEditor(record)}
                      aria-label={`Edit ${record.employeeName || record.email}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit record</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <AdminMetric label="Punch In" value={formatTimestamp(record.punchIn)} />
                <AdminMetric label="Punch Out" value={formatTimestamp(record.punchOut)} />
                <AdminMetric
                  label="Edited"
                  value={
                    <Badge
                      className={
                        record.editedByAdmin
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800"
                      }
                    >
                      {record.editedByAdmin ? "Yes" : "No"}
                    </Badge>
                  }
                />
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
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-emerald-50/80 text-xs uppercase text-emerald-800/70">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Punch In</th>
                  <th className="px-4 py-3">Punch Out</th>
                  <th className="px-4 py-3">Edited</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {loading && <TableSkeletonRows columns={6} rows={6} />}
                {!loading && records.map((record) => (
                  <tr className="transition hover:bg-emerald-50/60" key={record.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isNewRecord(record) && (
                          <Badge className="shrink-0 bg-emerald-100 text-emerald-800">
                            New
                          </Badge>
                        )}
                        <span className="font-medium text-emerald-950">
                          {record.employeeName || record.email}
                        </span>
                      </div>
                      {record.email && record.employeeName && (
                        <p className="truncate text-xs text-emerald-800/70">{record.email}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-emerald-800/70">{record.date}</td>
                    <td className="px-4 py-3 text-emerald-800/70">{formatTimestamp(record.punchIn)}</td>
                    <td className="px-4 py-3 text-emerald-800/70">{formatTimestamp(record.punchOut)}</td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          record.editedByAdmin
                            ? "bg-rose-100 text-rose-800"
                            : "bg-emerald-100 text-emerald-800"
                        }
                      >
                        {record.editedByAdmin ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon-xs"
                            className="border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
                            onClick={() => openEditor(record)}
                            aria-label={`Edit ${record.employeeName || record.email}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit record</p>
                        </TooltipContent>
                      </Tooltip>
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

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && !saving && closeEditor()}>
        <DialogContent className="border-emerald-100 bg-white text-emerald-950 sm:max-w-2xl">
          <form onSubmit={requestSaveEdit}>
            <DialogHeader>
              <DialogTitle className="text-xl">Edit Employee Punch Record</DialogTitle>
              <DialogDescription className="text-emerald-800/70">
                Adjust punch times for an employee attendance record. A confirmation is required before saving.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 space-y-5">
              <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
                  <UserRound className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {editing?.employeeName || editing?.email}
                  </p>
                  <p className="break-all text-xs text-slate-500">{editing?.email}</p>
                </div>
                <div className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                  {editing?.date}
                </div>
              </div>

              <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-emerald-700" />
                  <h3 className="text-sm font-semibold text-emerald-950">Punch Times</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="punchIn">Punch In</Label>
                    <Input
                      id="punchIn"
                      type="datetime-local"
                      required
                      value={editing?.punchInInput || ""}
                      onChange={(event) => {
                        setPunchTimeError("");
                        setEditing((prev) => (prev ? { ...prev, punchInInput: event.target.value } : prev));
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="punchOut">Punch Out</Label>
                    <Input
                      id="punchOut"
                      type="datetime-local"
                      required
                      value={editing?.punchOutInput || ""}
                      aria-invalid={Boolean(punchTimeError)}
                      aria-describedby={punchTimeError ? "punch-time-error" : undefined}
                      onChange={(event) => {
                        setPunchTimeError("");
                        setEditing((prev) => (prev ? { ...prev, punchOutInput: event.target.value } : prev));
                      }}
                    />
                    {punchTimeError && (
                      <p id="punch-time-error" className="text-xs font-medium text-red-600">
                        {punchTimeError}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Saving this record recalculates the matching daily summary, including regular hours, overtime, night differential, late, and undertime.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={closeEditor} disabled={saving}>
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
        open={confirmSaveOpen}
        onOpenChange={setConfirmSaveOpen}
        title="Save punch changes?"
        description={`Confirm punch edits for ${editing?.employeeName || editing?.email || "this employee"}. This will recalculate the matching daily summary.`}
        confirmLabel="Confirm Save"
        cancelLabel="Review Again"
        onConfirm={saveEdit}
        loading={saving}
      />
    </section>
    </TooltipProvider>
  );
}

function AdminMetric({ label, value }) {
  return (
    <div className="rounded-md border border-emerald-100 bg-emerald-50/40 p-3">
      <p className="text-xs font-medium text-emerald-700/80">{label}</p>
      <div className="mt-1 break-words font-semibold text-emerald-950">{value}</div>
    </div>
  );
}


