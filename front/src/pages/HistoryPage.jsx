import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState.jsx";
import { TableSkeletonRows } from "@/components/LoadingStates.jsx";
import PageHeader from "@/components/PageHeader.jsx";
import { ATTENDANCE_CHANGED_EVENT } from "@/components/TimeClockWidget.jsx";
import api from "@/services/api.js";
import { getErrorMessage, notify } from "@/utils/feedback.js";
import { formatDurationMinutes, formatTimestamp } from "@/utils/format.js";

function getWorkedTime(record) {
  if (record.summary?.totalWorkedHours !== undefined) {
    return formatDurationMinutes(record.summary.totalWorkedHours * 60);
  }

  return "-";
}

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    function loadRecords() {
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
    }

    function refreshRecords() {
      api.get("/attendance/me").then(({ data }) => {
        if (active) {
          setRecords(data.records);
        }
      });
    }

    loadRecords();
    window.addEventListener(ATTENDANCE_CHANGED_EVENT, refreshRecords);

    return () => {
      active = false;
      window.removeEventListener(ATTENDANCE_CHANGED_EVENT, refreshRecords);
    };
  }, []);

  return (
    <section className="space-y-4">
      <PageHeader
        title="Attendance History"
        description="Recent punch records with completed summaries and exception time."
        meta="Employee records"
      />

      <div className="space-y-3 md:hidden">
        {loading && Array.from({ length: 4 }).map((_, index) => (
          <Card className="border-emerald-100 bg-white shadow-sm" key={index}>
            <CardContent className="space-y-4 p-4">
              <Skeleton className="h-5 w-32 bg-emerald-100" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((__, itemIndex) => (
                  <Skeleton className="h-10 bg-emerald-100" key={itemIndex} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && records.map((record) => (
          <Card className="border-emerald-100 bg-white shadow-sm" key={record.id}>
            <CardContent className="space-y-4 p-4">
              <div>
                <p className="text-sm font-semibold text-emerald-950">{record.date}</p>
                <p className="text-xs text-emerald-800/70">
                  {formatTimestamp(record.punchIn)} to {formatTimestamp(record.punchOut)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Metric label="Worked Time" value={getWorkedTime(record)} />
                <Metric label="Regular" value={record.summary?.regularHours ?? "-"} />
                <Metric label="Overtime" value={record.summary?.overtimeHours ?? "-"} />
                <Metric label="Night Differential" value={record.summary?.nightDiffHours ?? "-"} />
                <Metric label="Late" value={record.summary ? formatDurationMinutes(record.summary.lateMinutes) : "-"} />
                <Metric label="Undertime" value={record.summary ? formatDurationMinutes(record.summary.undertimeMinutes) : "-"} />
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && !records.length && (
          <Card className="border-emerald-100 bg-white shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-sm font-semibold text-emerald-950">No attendance records yet</p>
              <p className="mt-1 text-sm text-emerald-800/70">Punch in to start building your history.</p>
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
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Punch In</th>
                  <th className="px-4 py-3">Punch Out</th>
                  <th className="px-4 py-3">Worked Time</th>
                  <th className="px-4 py-3">Regular</th>
                  <th className="px-4 py-3">Overtime</th>
                  <th className="px-4 py-3">Night Differential</th>
                  <th className="px-4 py-3">Late</th>
                  <th className="px-4 py-3">Undertime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {loading && <TableSkeletonRows columns={9} rows={6} />}
                {!loading && records.map((record) => (
                  <tr className="transition hover:bg-emerald-50/40" key={record.id}>
                    <td className="px-4 py-3 font-medium text-emerald-950">{record.date}</td>
                    <td className="px-4 py-3 text-emerald-800/70">{formatTimestamp(record.punchIn)}</td>
                    <td className="px-4 py-3 text-emerald-800/70">{formatTimestamp(record.punchOut)}</td>
                    <td className="px-4 py-3 font-medium text-emerald-950">{getWorkedTime(record)}</td>
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
                  <EmptyState colSpan={9} title="No attendance records yet" description="Punch in to start building your history." />
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md border border-emerald-100 bg-emerald-50/40 p-3">
      <p className="text-xs font-medium text-emerald-700/80">{label}</p>
      <p className="mt-1 break-words font-semibold text-emerald-950">{value}</p>
    </div>
  );
}
