"use client";

import * as React from "react";

import { ToolCard } from "@/components/site/tool-card";
import { cn } from "@/lib/utils";
import type { Tool } from "@/types/database";

export function LandschaftFilter({ tools }: { tools: Tool[] }) {
  const categories = React.useMemo(
    () => Array.from(new Set(tools.map((tool) => tool.category))),
    [tools]
  );
  const [activeCategory, setActiveCategory] = React.useState<string | null>(
    null
  );

  const filtered = activeCategory
    ? tools.filter((tool) => tool.category === activeCategory)
    : tools;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={cn(
            "rounded-full px-4 py-2 text-[14px] font-medium transition-colors duration-[120ms]",
            activeCategory === null
              ? "bg-ink text-white"
              : "bg-surface-alt text-ink-soft hover:text-ink"
          )}
        >
          Alle
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={cn(
              "rounded-full px-4 py-2 text-[14px] font-medium transition-colors duration-[120ms]",
              activeCategory === category
                ? "bg-ink text-white"
                : "bg-surface-alt text-ink-soft hover:text-ink"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
