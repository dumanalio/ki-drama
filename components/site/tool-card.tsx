import Image from "next/image";
import { AlertTriangle, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Tool } from "@/types/database";

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <div className="border-line bg-surface shadow-card flex flex-col gap-4 rounded-xl border p-5">
      <div className="flex items-center gap-3">
        <div className="bg-surface-alt flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
          {tool.logo_url ? (
            <Image
              src={tool.logo_url}
              alt={`Logo von ${tool.name}`}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-ink-muted text-[15px] font-semibold">
              {tool.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-ink text-[16px] font-semibold">
            {tool.name}
          </span>
          {tool.vendor ? (
            <span className="text-ink-muted text-[13px]">{tool.vendor}</span>
          ) : null}
        </div>
      </div>

      <Badge variant="soft" className="self-start">
        {tool.category}
      </Badge>

      <p className="text-ink-soft text-[15px] leading-relaxed">
        {tool.summary}
      </p>

      {tool.good_for.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-ink-muted text-[13px] font-semibold tracking-[0.06em] uppercase">
            Gut für
          </span>
          <ul className="text-ink-soft flex flex-col gap-1 text-[15px] leading-relaxed">
            {tool.good_for.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {tool.price_hint ? (
        <div className="text-ink-muted flex items-center gap-1.5 text-[14px]">
          <Tag className="size-3.5" aria-hidden="true" />
          {tool.price_hint}
        </div>
      ) : null}

      {tool.watch_out ? (
        <div className="text-warning flex items-start gap-1.5 text-[14px]">
          <AlertTriangle
            className="mt-0.5 size-3.5 shrink-0"
            aria-hidden="true"
          />
          {tool.watch_out}
        </div>
      ) : null}
    </div>
  );
}
