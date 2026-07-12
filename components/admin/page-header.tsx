import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-ink text-[26px] font-bold tracking-[-0.015em]">
        {title}
      </h1>
      {action}
    </div>
  );
}
