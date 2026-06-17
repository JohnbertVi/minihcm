import "./config/env.js";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();
const port = process.env.PORT || 5000;
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    name: "Mini Time Tracking API",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api", attendanceRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
}

export default app;
