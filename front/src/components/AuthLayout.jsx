import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery } from "../hooks/useMediaQuery.js";

const springTransition = {
  type: "spring",
  stiffness: 65,
  damping: 14,
  mass: 0.8,
};

const slideTransition = {
  duration: 0.65,
  ease: [0.22, 1, 0.36, 1], // custom ease-out-expo
};

export default function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname === "/register";
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Direction for the inner form cross-fade.
  const direction = useMemo(() => (isRegister ? 1 : -1), [isRegister]);

  // On desktop the panels swap sides. On mobile the brand panel is hidden
  // and the form stays in place.
  const panelOffset = isDesktop && isRegister ? "100%" : "0%";
  const formOffset = isRegister && isDesktop ? "-100%" : "0%";

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-100 px-4 py-8">
      {/* soft ambient background blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-[10%] -top-[10%] h-[45vh] w-[45vh] rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[50vh] w-[50vh] rounded-full bg-emerald-300/25 blur-3xl" />
      </div>

      <section className="relative grid min-h-[640px] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-emerald-900/10 ring-1 ring-emerald-900/5 md:grid-cols-2">
        {/* Brand panel — slides right on register, left on login */}
        <motion.div
          initial={false}
          animate={{ x: panelOffset }}
          transition={slideTransition}
          className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 p-10 text-white md:flex"
        >
          {/* animated dot pattern */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.45) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* subtle glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl"
          />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: 0.15 }}
              className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 p-2 ring-1 ring-white/20 backdrop-blur-sm"
            >
              <img
                src="/logo.png"
                alt="Mini Time Tracking"
                className="h-full w-full object-contain drop-shadow-sm"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: 0.2 }}
              className="text-sm font-semibold uppercase tracking-widest text-emerald-200"
            >
              Mini Time Tracking
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: 0.28 }}
              className="mt-5 max-w-sm text-4xl font-semibold leading-[1.15]"
            >
              Clean attendance tracking for daily operations.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: 0.36 }}
              className="mt-4 max-w-sm text-[15px] leading-relaxed text-emerald-100/80"
            >
              Record punches, review history, and generate daily or weekly summaries in one simple place.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.46 }}
            className="relative z-10 grid gap-3 text-sm text-emerald-100"
          >
            <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition hover:bg-white/15">
              <p className="font-semibold text-white">Timekeeping</p>
              <p className="mt-1 text-emerald-100/80">Punch in, punch out, and review attendance history.</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition hover:bg-white/15">
              <p className="font-semibold text-white">Reports</p>
              <p className="mt-1 text-emerald-100/80">Daily and weekly metrics for admin review.</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Form panel — slides left on register, right on login */}
        <motion.div
          initial={false}
          animate={{ x: formOffset }}
          transition={slideTransition}
          className="relative flex flex-col justify-center overflow-hidden p-6 sm:p-10"
        >
          <div className="mx-auto w-full max-w-[380px]">
            {/* mobile logo fallback */}
            <div className="mb-8 flex items-center justify-center gap-3 md:hidden">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-emerald-600 p-1.5">
                <img
                  src="/logo.png"
                  alt="Mini Time Tracking"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Mini Time Tracking</p>
                <p className="text-xs text-emerald-700/70">Attendance system</p>
              </div>
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={location.pathname}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 24 : -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -24 : 24 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
