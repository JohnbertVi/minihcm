import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "@/components/EmptyState.jsx";
import { TableSkeletonRows } from "@/components/LoadingStates.jsx";
import PageHeader from "@/components/PageHeader.jsx";
import api from "@/services/api.js";
import { getErrorMessage, notify } from "@/utils/feedback.js";
import { formatDurationMinutes, formatTimestamp } from "@/utils/format.js";

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api
      .get("/attendance/me")
      .then(({ data }) => {
        if (active) {
          setRecords(data.records);
        }
      })
      .catch((err) => {
        if (active) {
          notify.error(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="space-y-4">
      <PageHeader
        title="Attendance History"
        description="Recent punch records with completed summaries and exception time."
        meta="Employee records"
      />
      <Card className="overflow-hidden border-emerald-100 bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-emerald-50/80 text-xs uppercase text-emerald-800/70">
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
              <tbody className="divide-y divide-emerald-100">
                {loading && <TableSkeletonRows columns={8} rows={6} />}
                {!loading && records.map((record) => (
                  <tr className="transition hover:bg-emerald-50/40" key={record.id}>
                    <td className="px-4 py-3 font-medium text-emerald-950">{record.date}</td>
                    <td className="px-4 py-3 text-emerald-800/70">{formatTimestamp(record.punchIn)}</td>
                    <td className="px-4 py-3 text-emerald-800/70">{formatTimestamp(record.punchOut)}</td>
                    <td className="px-4 py-3 text-emerald-800/70">{record.summary?.regularHours ?? "-"}</td>
                    <td className="px-4 py-3 text-emerald-800/70">{record.summary?.overtimeHours ?? "-"}</td>
                    <td className="px-4 py-3 text-emerald-800/70">{record.summary?.nightDiffHours ?? "-"}</td>
                    <td className="px-4 py-3 text-emerald-800/70">
                      {record.summary ? formatDurationMinutes(record.summary.lateMinutes) : "-"}
                    </td>
                    <td className="px-4 py-3 text-emerald-800/70">
                      {record.summary ? formatDurationMinutes(record.summary.undertimeMinutes) : "-"}
                    </td>
                  </tr>
                ))}
                {!loading && !records.length && (
                  <EmptyState colSpan={8} title="No attendance records yet" description="Punch in to start building your history." />
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
