import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import KpiCard from "@/components/KpiCard.jsx";
import PageHeader from "@/components/PageHeader.jsx";
import ConfirmDialog from "@/components/ConfirmDialog.jsx";
import { Button } from "@/components/ui/button";
import api from "@/services/api.js";
import { getErrorMessage, notify } from "@/utils/feedback.js";

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
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

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
          notify.error("Could not load dashboard data. Check the backend server.");
        }
      }
    }

    fetchDashboard();

    return () => {
      active = false;
    };
  }, []);

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
      notify.success(path.endsWith("/in") ? "Punch in recorded." : "Punch out recorded and summary computed.");
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setLoading(false);
      setPendingAction(null);
    }
  }

  return (
    <section className="space-y-8">
      <PageHeader
        title="Employee Dashboard"
        description="Record attendance and review today's computed totals."
        meta="Workspace"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => requestPunch("/punch/in")}
              disabled={loading}
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
              disabled={loading}
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

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <motion.div variants={itemVariants}>
          <KpiCard label="Regular Hours" value={summary?.regularHours ?? "0.00"} tone="good" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard label="Overtime Hours" value={summary?.overtimeHours ?? "0.00"} tone="info" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard label="Night Differential" value={summary?.nightDiffHours ?? "0.00"} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard label="Late Minutes" value={summary?.lateMinutes ?? 0} tone="warn" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard label="Undertime Minutes" value={summary?.undertimeMinutes ?? 0} tone="warn" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard label="Total Worked" value={summary?.totalWorkedHours ?? "0.00"} />
        </motion.div>
      </motion.div>

      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-emerald-950">This Week</h3>
          <p className="text-sm text-emerald-700/80">Totals generated from completed daily summaries.</p>
        </div>
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
            <KpiCard label="Late" value={`${weekly?.lateMinutes || 0} min`} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KpiCard label="Undertime" value={`${weekly?.undertimeMinutes || 0} min`} />
          </motion.div>
        </motion.div>
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
