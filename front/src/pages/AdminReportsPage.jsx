import { useEffect, useState } from "react";
import KpiCard from "../components/KpiCard.jsx";
import api from "../services/api.js";
import { todayIso } from "../utils/format.js";

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
  const [message, setMessage] = useState("");

  useEffect(() => {
    const endpoint = mode === "daily" ? "/admin/reports/daily" : "/admin/reports/weekly";
    const params = mode === "daily" ? { date } : { weekStart };

    api
      .get(endpoint, { params })
      .then(({ data }) => setReports(data.reports))
      .catch((err) => setMessage(err.response?.data?.message || err.message));
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
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Admin Reports</h2>
          <p className="mt-1 text-slate-600">Daily and weekly summaries generated from employee punch records.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm font-medium text-slate-700">
            Report
            <select
              className="mt-1 block rounded-md border border-slate-300 px-3 py-2"
              onChange={(event) => setMode(event.target.value)}
              value={mode}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>
          {mode === "daily" ? (
            <label className="text-sm font-medium text-slate-700">
              Date
              <input
                className="mt-1 block rounded-md border border-slate-300 px-3 py-2"
                onChange={(event) => setDate(event.target.value)}
                type="date"
                value={date}
              />
            </label>
          ) : (
            <label className="text-sm font-medium text-slate-700">
              Week Start
              <input
                className="mt-1 block rounded-md border border-slate-300 px-3 py-2"
                onChange={(event) => setWeekStart(event.target.value)}
                type="date"
                value={weekStart}
              />
            </label>
          )}
        </div>
      </div>

      {message && <p className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Records" value={totals.present} tone="good" />
        <KpiCard label="Late Employees" value={totals.late} tone="warn" />
        <KpiCard label="Overtime Hours" value={totals.overtimeHours.toFixed(2)} tone="info" />
        <KpiCard label="Undertime Minutes" value={totals.undertimeMinutes} />
        <KpiCard label="Worked Hours" value={totals.totalWorkedHours.toFixed(2)} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
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
          <tbody className="divide-y divide-slate-200">
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{report.employeeName || report.userId}</td>
                <td className="px-4 py-3 text-slate-600">
                  {mode === "daily" ? report.date : `${report.weekStart} to ${report.weekEnd}`}
                </td>
                <td className="px-4 py-3 text-slate-600">{Number(report.regularHours || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-600">{Number(report.overtimeHours || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-600">{Number(report.nightDiffHours || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-600">{report.lateMinutes} min</td>
                <td className="px-4 py-3 text-slate-600">{report.undertimeMinutes} min</td>
                <td className="px-4 py-3 text-slate-600">{Number(report.totalWorkedHours || 0).toFixed(2)}</td>
              </tr>
            ))}
            {!reports.length && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={8}>No summaries found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
