import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function KpiSkeletonGrid({ className, count = 4 }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Card className="border-emerald-100 bg-white shadow-sm" key={index}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-28 bg-emerald-100" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-24 bg-emerald-100" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TableSkeletonRows({ columns, rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <td className="px-4 py-3" key={columnIndex}>
              <Skeleton className="h-4 w-full max-w-[140px] bg-emerald-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
