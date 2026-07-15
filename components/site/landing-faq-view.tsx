import { ChevronDown } from "lucide-react";

import type { LandingFaq } from "@/lib/landing-content";

export function LandingFaqView({ faq }: { faq: LandingFaq }) {
  const items = faq.items.filter(
    (item): item is LandingFaq["items"][number] & { question: string } =>
      Boolean(item.question && item.question.trim().length > 0)
  );

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-10">
      {faq.title ? (
        <h2 className="text-ink text-center text-[26px] font-bold tracking-[-0.015em] md:text-[34px]">
          {faq.title}
        </h2>
      ) : null}

      {faq.displayStyle === "accordion" ? (
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-3">
          {items.map((item) => (
            <details
              key={item.id}
              name="faq"
              className="group border-line bg-surface rounded-xl border p-5"
            >
              <summary className="text-ink marker:content-none flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown
                  className="text-ink-muted size-5 shrink-0 transition-transform duration-[120ms] group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              {item.answer ? (
                <p className="text-ink-soft mt-3 text-[15px] leading-relaxed">
                  {item.answer}
                </p>
              ) : null}
            </details>
          ))}
        </div>
      ) : faq.displayStyle === "grid" ? (
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-2">
              <h3 className="text-ink text-[16px] font-semibold">
                {item.question}
              </h3>
              {item.answer ? (
                <p className="text-ink-soft text-[15px] leading-relaxed">
                  {item.answer}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <ol className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
          {items.map((item, index) => (
            <li key={item.id} className="flex gap-4">
              <span className="text-accent shrink-0 text-[16px] font-bold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-ink text-[16px] font-semibold">
                  {item.question}
                </h3>
                {item.answer ? (
                  <p className="text-ink-soft text-[15px] leading-relaxed">
                    {item.answer}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
