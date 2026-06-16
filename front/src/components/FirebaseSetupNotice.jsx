export default function FirebaseSetupNotice({ missingKeys }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8">
      <section className="w-full max-w-2xl rounded-lg border border-amber-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase text-amber-700">Mini Time Tracking</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Firebase config is missing</h1>
        <p className="mt-3 text-slate-600">
          The app cannot load authentication until the frontend Firebase environment variables are set.
        </p>

        <div className="mt-5 rounded-md bg-slate-100 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-950">Create this file:</p>
          <code className="mt-2 block">front/.env</code>
          <p className="mt-4 font-semibold text-slate-950">Copy from:</p>
          <code className="mt-2 block">front/.env.example</code>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-950">Missing values:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {missingKeys.map((key) => (
              <li key={key}>VITE_FIREBASE_{key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}</li>
            ))}
          </ul>
        </div>

        <p className="mt-5 text-sm text-slate-600">
          After saving the `.env` file, restart the Vite dev server.
        </p>
      </section>
    </main>
  );
}
