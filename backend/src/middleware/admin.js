export function requireAdmin(req, res, next) {
  if (req.user?.profile?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
}
