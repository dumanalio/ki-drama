import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Chapter } from "@/types/database";

export function ChapterCard({ chapter }: { chapter: Chapter }) {
  return (
    <Link
      href={`/grundlagen/${chapter.slug}`}
      className="group border-line bg-surface shadow-card hover:border-line-strong flex flex-col gap-2 rounded-xl border p-5 transition-colors duration-[120ms]"
    >
      <h3 className="text-ink group-hover:text-accent text-[18px] font-semibold tracking-[-0.01em]">
        {chapter.title}
      </h3>
      <p className="text-ink-soft flex-1 text-[15px] leading-relaxed">
        {chapter.summary}
      </p>
      <span className="text-accent mt-2 inline-flex items-center gap-1 text-[14px] font-medium">
        Kapitel lesen
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </span>
    </Link>
  );
}
