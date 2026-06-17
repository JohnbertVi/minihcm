import { Card, CardContent } from "@/components/ui/card";

export default function PageHeader({ title, description, actions, meta }) {
  return (
    <Card className="border-emerald-100 bg-white/90 shadow-sm backdrop-blur">
      <CardContent className="p-4 sm:p-6">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            {meta && (
              <p className="mb-2 text-xs font-semibold uppercase text-emerald-700">
                {meta}
              </p>
            )}
            <h2 className="text-xl font-semibold text-emerald-950 sm:text-2xl">{title}</h2>
            {description && (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-emerald-800/70">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex w-full min-w-0 flex-wrap items-end gap-3 lg:w-auto">{actions}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
