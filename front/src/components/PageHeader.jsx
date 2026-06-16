import { Card, CardContent } from "@/components/ui/card";

export default function PageHeader({ title, description, actions, meta }) {
  return (
    <Card className="border-emerald-100 bg-white/90 shadow-sm backdrop-blur">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {meta && (
              <p className="mb-2 text-xs font-semibold uppercase text-emerald-700">
                {meta}
              </p>
            )}
            <h2 className="text-2xl font-semibold text-emerald-950">{title}</h2>
            {description && (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-emerald-800/70">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-end gap-3">{actions}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
