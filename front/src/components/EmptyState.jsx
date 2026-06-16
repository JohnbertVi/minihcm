import { Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function EmptyState({ title, description, colSpan }) {
  return (
    <tr>
      <td className="px-4 py-12 text-center" colSpan={colSpan}>
        <Card className="mx-auto max-w-sm border-emerald-100 bg-white/80 py-8 shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-950">{title}</p>
              {description && (
                <p className="mt-1 text-sm text-emerald-800/70">{description}</p>
              )}
            </div>
          </div>
        </Card>
      </td>
    </tr>
  );
}
