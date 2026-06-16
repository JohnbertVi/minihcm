import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EmptyState from "@/components/EmptyState.jsx";
import KpiCard from "@/components/KpiCard.jsx";
import { KpiSkeletonGrid, TableSkeletonRows } from "@/components/LoadingStates.jsx";
import PageHeader from "@/components/PageHeader.jsx";
import api from "@/services/api.js";
import { getErrorMessage, notify } from "@/utils/feedback.js";
import { formatDurationMinutes, todayIso } from "@/utils/format.js";

function weekStartIso() {
  const date = new Date();
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

export default function AdminReportsPage() {
  const [mode, setMode] = useState("daily");
  const [date, setDate] = useState(todayIso());
  const [weekStart, setWeekStart] = useState(weekStartIso());
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = mode === "daily" ? "/admin/reports/daily" : "/admin/reports/weekly";
    const params = mode === "daily" ? { date } : { weekStart };

    let active = true;

    async function fetchReports() {
      setLoading(true);

      try {
        const { data } = await api.get(endpoint, { params });

        if (active) {
          setReports(data.reports);
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

    fetchReports();

    return () => {
      active = false;
    };
  }, [date, mode, weekStart]);

  const totals = reports.reduce(
    (acc, report) => ({
      present: acc.present + 1,
      late: acc.late + (report.lateMinutes > 0 ? 1 : 0),
      overtimeHours: acc.overtimeHours + (report.overtimeHours || 0),
      undertimeMinutes: acc.undertimeMinutes + (report.undertimeMinutes || 0),
      totalWorkedHours: acc.totalWorkedHours + (report.totalWorkedHours || 0),
    }),
    { present: 0, late: 0, overtimeHours: 0, undertimeMinutes: 0, totalWorkedHours: 0 },
  );

  return (
    <section className="space-y-6">
      <PageHeader
        title="Admin Reports"
        description="Daily and weekly summaries generated from employee punch records."
        meta="Reporting"
        actions={
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="report-mode">Report</Label>
              <Select value={mode} onValueChange={(value) => setMode(value)}>
                <SelectTrigger id="report-mode" className="w-[160px]">
                  <SelectValue placeholder="Select report" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === "daily" ? (
              <div className="space-y-1.5">
                <Label htmlFor="report-date">Date</Label>
                <Input
                  id="report-date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-auto"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="week-start">Week Start</Label>
                <Input
                  id="week-start"
                  type="date"
                  value={weekStart}
                  onChange={(event) => setWeekStart(event.target.value)}
                  className="w-auto"
                />
              </div>
            )}
          </div>
        }
      />

      {loading ? (
        <KpiSkeletonGrid count={5} className="lg:grid-cols-5" />
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Records" value={totals.present} tone="good" />
        <KpiCard label="Late Employees" value={totals.late} tone="warn" />
        <KpiCard label="Overtime Hours" value={totals.overtimeHours.toFixed(2)} tone="info" />
        <KpiCard label="Undertime" value={formatDurationMinutes(totals.undertimeMinutes)} />
        <KpiCard label="Worked Hours" value={totals.totalWorkedHours.toFixed(2)} />
      </div>
      )}

      <Card className="overflow-hidden border-emerald-100 bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-emerald-50/80 text-xs uppercase text-emerald-800/70">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">{mode === "daily" ? "Date" : "Week"}</th>
                  <th className="px-4 py-3">Regular</th>
                  <th className="px-4 py-3">OT</th>
                  <th className="px-4 py-3">ND</th>
                  <th className="px-4 py-3">Late</th>
                  <th className="px-4 py-3">Undertime</th>
                  <th className="px-4 py-3">Worked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {loading && <TableSkeletonRows columns={8} rows={6} />}
                {!loading && reports.map((report) => (
                  <tr className="transition hover:bg-emerald-50/40" key={report.id}>
                    <td className="px-4 py-3 font-medium text-emerald-950">
                      {report.employeeName || report.userId}
                    </td>
                    <td className="px-4 py-3 text-emerald-800/70">
                      {mode === "daily" ? report.date : `${report.weekStart} to ${report.weekEnd}`}
                    </td>
                    <td className="px-4 py-3 text-emerald-800/70">
                      {Number(report.regularHours || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-emerald-800/70">
                      {Number(report.overtimeHours || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-emerald-800/70">
                      {Number(report.nightDiffHours || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-emerald-800/70">{formatDurationMinutes(report.lateMinutes)}</td>
                    <td className="px-4 py-3 text-emerald-800/70">{formatDurationMinutes(report.undertimeMinutes)}</td>
                    <td className="px-4 py-3 text-emerald-800/70">
                      {Number(report.totalWorkedHours || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {!loading && !reports.length && (
                  <EmptyState
                    colSpan={8}
                    title="No summaries found"
                    description="Reports appear after employees punch out and summaries are computed."
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
