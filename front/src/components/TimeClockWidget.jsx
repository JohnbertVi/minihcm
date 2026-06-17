import { useEffect, useState } from "react";
import { Clock3, LogIn, LogOut, Loader2, Minus, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmDialog from "@/components/ConfirmDialog.jsx";
import api from "@/services/api.js";
import { getErrorMessage, notify } from "@/utils/feedback.js";
import {
  formatDurationMinutes,
  formatElapsedTime,
  formatTime,
  timestampMillis,
} from "@/utils/format.js";

export const ATTENDANCE_CHANGED_EVENT = "attendance:changed";

export default function TimeClockWidget() {
  const [summary, setSummary] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [minimized, setMinimized] = useState(false);

  async function loadData() {
    const [dailyRes, attendanceRes] = await Promise.all([
      api.get("/summary/me/daily"),
      api.get("/attendance/me", { params: { limit: 10 } }),
    ]);

    const openRecord = attendanceRes.data.records.find((record) => record.punchIn && !record.punchOut);

    setSummary(dailyRes.data.summary);
    setCurrentRecord(openRecord || null);
  }

  useEffect(() => {
    let active = true;

    async function fetchWidgetData() {
      try {
        await loadData();
      } catch {
        if (active) {
          notify.error("Could not load time clock data. Check the backend server.");
        }
      } finally {
        if (active) {
          setInitialLoading(false);
        }
      }
    }

    fetchWidgetData();

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
      window.dispatchEvent(new Event(ATTENDANCE_CHANGED_EVENT));
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
    <>
      {minimized ? (
        <Card className="fixed bottom-3 right-3 z-30 w-auto border-emerald-100 bg-white/95 shadow-xl shadow-emerald-950/15 backdrop-blur sm:right-5">
          <CardContent className="flex items-center gap-3 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Clock3 className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-emerald-950">Time Clock</p>
              <p className="text-xs text-emerald-800/70">
                {initialLoading ? "Loading" : currentRecord ? "Clocked in" : "Ready"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto size-7 text-emerald-700 hover:bg-emerald-50"
              onClick={() => setMinimized(false)}
            >
              <Maximize2 className="h-4 w-4" />
              <span className="sr-only">Expand time clock</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="fixed bottom-3 left-3 right-3 z-30 border-emerald-100 bg-white/95 shadow-2xl shadow-emerald-950/15 backdrop-blur sm:left-auto sm:right-5 sm:w-[360px]">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-950">Time Clock</p>
                  <p className="text-xs text-emerald-800/70">Punch in and out from here.</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Badge className={currentRecord ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}>
                  {initialLoading ? "Loading" : currentRecord ? "Clocked in" : "Ready"}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => setMinimized(true)}
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Minimize time clock</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs font-medium text-emerald-700/80">Running time</p>
                {initialLoading ? (
                  <Skeleton className="mt-2 h-7 w-full bg-emerald-100" />
                ) : (
                  <p className="mt-1 font-mono text-lg font-semibold text-emerald-950">
                    {currentRecord ? formatElapsedTime(currentRecord.punchIn, now) : "0:00:00"}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-700/80">Punch in</p>
                {initialLoading ? (
                  <Skeleton className="mt-2 h-7 w-full bg-emerald-100" />
                ) : (
                  <p className="mt-1 text-lg font-semibold text-emerald-950">
                    {currentRecord ? formatTime(currentRecord.punchIn) : "-"}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-700/80">Worked time</p>
                {initialLoading ? (
                  <Skeleton className="mt-2 h-7 w-full bg-emerald-100" />
                ) : (
                  <p className="mt-1 text-lg font-semibold text-emerald-950">
                    {currentRecord
                      ? formatDurationMinutes(activeMinutes)
                      : formatDurationMinutes(summary?.totalWorkedHours * 60)}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
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
          </CardContent>
        </Card>
      )}

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
    </>
  );
}
