import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/services/authService.js";
import { getErrorMessage, notify } from "@/utils/feedback.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function validate(values = form) {
    const next = {};

    if (!values.email.trim()) {
      next.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = "Please enter a valid email address.";
    }

    if (!values.password) {
      next.password = "Password is required.";
    }

    return next;
  }

  function validateField(name) {
    const fieldErrors = validate();
    setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] || undefined }));
  }

  function handleBlur(name) {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name);
  }

  function handleChange(name, value) {
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

    if (touched[name]) {
      const fieldErrors = validate(nextForm);
      setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] || undefined }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const allErrors = validate();
    setTouched({ email: true, password: true });
    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) return;

    setSubmitting(true);

    try {
      await login(form.email, form.password);
      notify.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 text-center md:text-left"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
          Mini Time Tracking
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Welcome back
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Use your employee account to record attendance.
        </p>
      </motion.div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-1.5"
        >
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            autoComplete="email"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            onBlur={() => handleBlur("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-xs font-medium text-red-600">
              {errors.email}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-1.5"
        >
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(event) => handleChange("password", event.target.value)}
              onBlur={() => handleBlur("password")}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-emerald-700 focus:text-emerald-700 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-xs font-medium text-red-600">
              {errors.password}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <Button
            type="submit"
            className="w-full bg-emerald-600 py-5 text-base hover:bg-emerald-700"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </motion.div>
      </form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-8 text-center text-sm text-slate-600"
      >
        No account yet?{" "}
        <Link
          className="font-semibold text-emerald-700 transition hover:text-emerald-800 hover:underline"
          to="/register"
        >
          Register
        </Link>
      </motion.p>
    </div>
  );
}
