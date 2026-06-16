import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function KpiCard({ label, value, tone = "default" }) {
  const tones = {
    default: "border-emerald-100 bg-white text-emerald-950",
    good: "border-emerald-200 bg-emerald-50/80 text-emerald-950",
    warn: "border-amber-200 bg-amber-50/80 text-amber-950",
    info: "border-sky-200 bg-sky-50/80 text-sky-950",
  };

  return (
    <Card className={cn("shadow-sm transition hover:-translate-y-0.5 hover:shadow-md", tones[tone])}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium leading-5 text-emerald-700/80 sm:text-sm">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums sm:text-3xl">{value}</p>
      </CardContent>
    </Card>
  );
}
