import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import KpiCard from "@/components/KpiCard.jsx";
import { KpiSkeletonGrid } from "@/components/LoadingStates.jsx";
import PageHeader from "@/components/PageHeader.jsx";
import { ATTENDANCE_CHANGED_EVENT } from "@/components/TimeClockWidget.jsx";
import { useAuth } from "@/hooks/useAuth.js";
import api from "@/services/api.js";
import { notify } from "@/utils/feedback.js";
import { formatDurationMinutes } from "@/utils/format.js";

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
  const { isAdmin } = useAuth();
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [initialLoading, setInitialLoading] = useState(!isAdmin);

  async function loadData() {
    const [dailyRes, weeklyRes] = await Promise.all([
      api.get("/summary/me/daily"),
      api.get("/summary/me/weekly"),
    ]);

    setSummary(dailyRes.data.summary);
    setWeekly(weeklyRes.data.totals);
  }

  useEffect(() => {
    if (isAdmin) {
      return undefined;
    }

    let active = true;

    async function fetchDashboard() {
      try {
        if (active) {
          await loadData();
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
    window.addEventListener(ATTENDANCE_CHANGED_EVENT, fetchDashboard);

    return () => {
      active = false;
      window.removeEventListener(ATTENDANCE_CHANGED_EVENT, fetchDashboard);
    };
  }, [isAdmin]);

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <section className="space-y-8">
      <PageHeader
        title="Employee Dashboard"
        description="Review today's attendance summary and weekly totals."
        meta="Workspace"
      />

      {initialLoading ? (
        <KpiSkeletonGrid count={5} className="lg:grid-cols-5" />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <motion.div variants={itemVariants}>
            <KpiCard label="Regular Hours" value={Number(summary?.regularHours || 0).toFixed(2)} tone="good" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KpiCard label="Overtime Hours" value={Number(summary?.overtimeHours || 0).toFixed(2)} tone="info" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KpiCard label="Night Differential" value={Number(summary?.nightDiffHours || 0).toFixed(2)} />
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
          <KpiSkeletonGrid count={5} className="lg:grid-cols-5" />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            <motion.div variants={itemVariants}>
              <KpiCard label="Regular" value={(weekly?.regularHours || 0).toFixed(2)} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard label="Overtime" value={(weekly?.overtimeHours || 0).toFixed(2)} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard label="Night Differential" value={(weekly?.nightDiffHours || 0).toFixed(2)} />
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
    </section>
  );
}
