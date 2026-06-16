import { Link } from "react-router-dom";

export default function AuthShell({ title, subtitle, children, footerText, footerLink, footerLabel }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase text-slate-500">Mini Time Tracking</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        </div>
        {children}
        <p className="mt-6 text-center text-sm text-slate-600">
          {footerText}{" "}
          <Link className="font-semibold text-slate-950 hover:underline" to={footerLink}>
            {footerLabel}
          </Link>
        </p>
      </section>
    </main>
  );
}
