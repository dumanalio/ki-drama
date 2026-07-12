import { Calendar, Mail, RefreshCw, StickyNote } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { formatBerlin } from "@/lib/time";
import type { LeadActivity } from "@/types/database";

const KIND_ICONS: Record<string, LucideIcon> = {
  notiz: StickyNote,
  status: RefreshCw,
  mail: Mail,
  termin: Calendar,
};

export function LeadTimeline({ activities }: { activities: LeadActivity[] }) {
  if (activities.length === 0) {
    return (
      <p className="text-ink-muted text-[14px]">
        Noch keine Einträge in der Timeline.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-4">
      {activities.map((activity) => {
        const Icon = KIND_ICONS[activity.kind] ?? StickyNote;
        return (
          <li key={activity.id} className="flex gap-3">
            <span className="bg-surface-alt flex size-8 shrink-0 items-center justify-center rounded-full">
              <Icon className="text-ink-muted size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              {activity.body ? (
                <p className="text-ink-soft text-[14px] leading-relaxed">
                  {activity.body}
                </p>
              ) : null}
              <span className="text-ink-muted text-[13px]">
                {formatBerlin(activity.created_at, {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                Uhr
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
