import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock3, LogIn, LogOut, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import KpiCard from "@/components/KpiCard.jsx";
import { KpiSkeletonGrid } from "@/components/LoadingStates.jsx";
import PageHeader from "@/components/PageHeader.jsx";
import ConfirmDialog from "@/components/ConfirmDialog.jsx";
import { Button } from "@/components/ui/button";
import api from "@/services/api.js";
import { getErrorMessage, notify } from "@/utils/feedback.js";
import {
  formatDurationMinutes,
  formatElapsedTime,
  formatTime,
  timestampMillis,
} from "@/utils/format.js";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [now, setNow] = useState(Date.now());

  async function loadData() {
    const [dailyRes, weeklyRes, attendanceRes] = await Promise.all([
      api.get("/summary/me/daily"),
      api.get("/summary/me/weekly"),
      api.get("/attendance/me", { params: { limit: 10 } }),
    ]);

    const openRecord = attendanceRes.data.records.find((record) => record.punchIn && !record.punchOut);

    setSummary(dailyRes.data.summary);
    setWeekly(weeklyRes.data.totals);
    setCurrentRecord(openRecord || null);
  }

  useEffect(() => {
    let active = true;

    async function fetchDashboard() {
      try {
        const [dailyRes, weeklyRes, attendanceRes] = await Promise.all([
          api.get("/summary/me/daily"),
          api.get("/summary/me/weekly"),
          api.get("/attendance/me", { params: { limit: 10 } }),
        ]);

        if (active) {
          const openRecord = attendanceRes.data.records.find((record) => record.punchIn && !record.punchOut);

          setSummary(dailyRes.data.summary);
          setWeekly(weeklyRes.data.totals);
          setCurrentRecord(openRecord || null);
        }
      } catch {
        if (active) {
          notify.error("Could not load dashboard data. Check the backend server.");
        }
      } finally {
        if (active) {
          setInitialLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!currentRecord?.punchIn) {
      return undefined;
    }

    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [currentRecord?.punchIn]);

  function requestPunch(path) {
    setPendingAction(path);
    if (path.endsWith("/out")) {
      setConfirmOpen(true);
    } else {
      executePunch(path);
    }
  }

  async function executePunch(path) {
    setLoading(true);
    setConfirmOpen(false);

    try {
      await api.post(path);
      await loadData();
      notify.success(path.endsWith("/in") ? "Punch in recorded successfully." : "Punch out recorded. Summary updated.");
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setLoading(false);
      setPendingAction(null);
    }
  }

  const punchInMillis = timestampMillis(currentRecord?.punchIn);
  const activeMinutes = punchInMillis ? Math.floor((now - punchInMillis) / 60000) : 0;

  return (
    <section className="space-y-8">
      <PageHeader
        title="Employee Dashboard"
        description="Record attendance and keep the current shift visible."
        meta="Workspace"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => requestPunch("/punch/in")}
              disabled={initialLoading || loading || Boolean(currentRecord)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading && pendingAction === "/punch/in" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Punch In
            </Button>
            <Button
              onClick={() => requestPunch("/punch/out")}
              disabled={initialLoading || loading || !currentRecord}
              variant="outline"
              className="border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
            >
              {loading && pendingAction === "/punch/out" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Punch Out
            </Button>
          </div>
        }
      />

      <Card className="border-emerald-100 bg-white shadow-sm">
        <CardContent className="grid gap-5 p-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:items-center">
          <div className="space-y-2">
            <Badge className={currentRecord ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}>
              {initialLoading ? "Loading" : currentRecord ? "Clocked in" : "Ready"}
            </Badge>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-700/80">Running time</p>
                {initialLoading ? (
                  <Skeleton className="mt-2 h-10 w-40 bg-emerald-100" />
                ) : (
                  <p className="font-mono text-4xl font-semibold text-emerald-950">
                    {currentRecord ? formatElapsedTime(currentRecord.punchIn, now) : "0:00:00"}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-700/80">Punch in</p>
            {initialLoading ? (
              <Skeleton className="mt-2 h-8 w-28 bg-emerald-100" />
            ) : (
              <p className="mt-1 text-2xl font-semibold text-emerald-950">
                {currentRecord ? formatTime(currentRecord.punchIn) : "-"}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-700/80">Current worked time</p>
            {initialLoading ? (
              <Skeleton className="mt-2 h-8 w-24 bg-emerald-100" />
            ) : (
              <p className="mt-1 text-2xl font-semibold text-emerald-950">
                {currentRecord ? formatDurationMinutes(activeMinutes) : formatDurationMinutes(summary?.totalWorkedHours * 60)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {initialLoading ? (
        <KpiSkeletonGrid count={4} />
      ) : (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <KpiCard label="Regular Hours" value={Number(summary?.regularHours || 0).toFixed(2)} tone="good" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard label="Overtime Hours" value={Number(summary?.overtimeHours || 0).toFixed(2)} tone="info" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard label="Late" value={formatDurationMinutes(summary?.lateMinutes)} tone="warn" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard label="Undertime" value={formatDurationMinutes(summary?.undertimeMinutes)} tone="warn" />
        </motion.div>
      </motion.div>
      )}

      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-emerald-950">This Week</h3>
          <p className="text-sm text-emerald-700/80">Completed daily summaries for the current week.</p>
        </div>
        {initialLoading ? (
          <KpiSkeletonGrid count={4} />
        ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div variants={itemVariants}>
            <KpiCard label="Regular" value={(weekly?.regularHours || 0).toFixed(2)} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KpiCard label="Overtime" value={(weekly?.overtimeHours || 0).toFixed(2)} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KpiCard label="Late" value={formatDurationMinutes(weekly?.lateMinutes)} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KpiCard label="Undertime" value={formatDurationMinutes(weekly?.undertimeMinutes)} />
          </motion.div>
        </motion.div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Punch Out"
        description="Are you sure you want to record your punch out? This will compute today's attendance summary."
        confirmLabel="Punch Out"
        cancelLabel="Cancel"
        variant="default"
        onConfirm={() => executePunch("/punch/out")}
        loading={loading}
      />
    </section>
  );
}
