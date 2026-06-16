import { useEffect, useState } from "react";
import KpiCard from "../components/KpiCard.jsx";
import api from "../services/api.js";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadData() {
    const [dailyRes, weeklyRes] = await Promise.all([
      api.get("/summary/me/daily"),
      api.get("/summary/me/weekly"),
    ]);
    setSummary(dailyRes.data.summary);
    setWeekly(weeklyRes.data.totals);
  }

  useEffect(() => {
    let active = true;

    async function fetchDashboard() {
      try {
        const [dailyRes, weeklyRes] = await Promise.all([
          api.get("/summary/me/daily"),
          api.get("/summary/me/weekly"),
        ]);

        if (active) {
          setSummary(dailyRes.data.summary);
          setWeekly(weeklyRes.data.totals);
        }
      } catch {
        if (active) {
          setMessage("Connect Firebase credentials to load attendance data.");
        }
      }
    }

    fetchDashboard();

    return () => {
      active = false;
    };
  }, []);

  async function handlePunch(path) {
    setLoading(true);
    setMessage("");

    try {
      await api.post(path);
      await loadData();
      setMessage(path.endsWith("/in") ? "Punch in recorded." : "Punch out recorded and daily summary computed.");
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Employee Dashboard</h2>
          <p className="mt-1 text-slate-600">Record attendance and review today's computed totals.</p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
            disabled={loading}
            onClick={() => handlePunch("/punch/in")}
            type="button"
          >
            Punch In
          </button>
          <button
            className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800"
            disabled={loading}
            onClick={() => handlePunch("/punch/out")}
            type="button"
          >
            Punch Out
          </button>
        </div>
      </div>

      {message && <p className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Regular Hours" value={summary?.regularHours ?? "0.00"} tone="good" />
        <KpiCard label="Overtime Hours" value={summary?.overtimeHours ?? "0.00"} tone="info" />
        <KpiCard label="Night Differential" value={summary?.nightDiffHours ?? "0.00"} />
        <KpiCard label="Late Minutes" value={summary?.lateMinutes ?? 0} tone="warn" />
        <KpiCard label="Undertime Minutes" value={summary?.undertimeMinutes ?? 0} tone="warn" />
        <KpiCard label="Total Worked" value={summary?.totalWorkedHours ?? "0.00"} />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold text-slate-950">This Week</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Regular" value={(weekly?.regularHours || 0).toFixed(2)} />
          <KpiCard label="Overtime" value={(weekly?.overtimeHours || 0).toFixed(2)} />
          <KpiCard label="Late" value={`${weekly?.lateMinutes || 0} min`} />
          <KpiCard label="Undertime" value={`${weekly?.undertimeMinutes || 0} min`} />
        </div>
      </div>
    </section>
  );
}
