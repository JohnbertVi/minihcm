import { useEffect, useState } from "react";
import api from "../services/api.js";
import { formatTimestamp } from "../utils/format.js";

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/attendance/me")
      .then(({ data }) => setRecords(data.records))
      .catch((err) => setError(err.response?.data?.message || err.message));
  }, []);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Attendance History</h2>
        <p className="mt-1 text-slate-600">Recent punch records with computed daily metrics.</p>
      </div>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Punch In</th>
              <th className="px-4 py-3">Punch Out</th>
              <th className="px-4 py-3">Regular</th>
              <th className="px-4 py-3">OT</th>
              <th className="px-4 py-3">ND</th>
              <th className="px-4 py-3">Late</th>
              <th className="px-4 py-3">Undertime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{record.date}</td>
                <td className="px-4 py-3 text-slate-600">{formatTimestamp(record.punchIn)}</td>
                <td className="px-4 py-3 text-slate-600">{formatTimestamp(record.punchOut)}</td>
                <td className="px-4 py-3 text-slate-600">{record.summary?.regularHours ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">{record.summary?.overtimeHours ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">{record.summary?.nightDiffHours ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">{record.summary ? `${record.summary.lateMinutes} min` : "-"}</td>
                <td className="px-4 py-3 text-slate-600">{record.summary ? `${record.summary.undertimeMinutes} min` : "-"}</td>
              </tr>
            ))}
            {!records.length && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={8}>No attendance records yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
