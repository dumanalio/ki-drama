import Image from "next/image";
import Link from "next/link";

import { DEFAULT_NAVIGATION, type FooterColumn } from "@/lib/navigation";

export function Footer({
  logoUrl = null,
  logoAlt = null,
  logoHeight = 32,
  footerText = DEFAULT_NAVIGATION.footerText,
  footerColumns = DEFAULT_NAVIGATION.footerColumns,
}: {
  logoUrl?: string | null;
  logoAlt?: string | null;
  logoHeight?: number;
  footerText?: string;
  footerColumns?: FooterColumn[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-line bg-surface border-t">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-14 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={logoAlt ?? "KI-Drama"}
              width={logoHeight * 4}
              height={logoHeight}
              style={{ height: logoHeight, width: "auto" }}
              className="object-contain"
            />
          ) : (
            <span className="font-display text-ink text-[18px] font-bold">
              KI-Drama
            </span>
          )}
          <p className="text-ink-soft max-w-[32ch] text-[15px] leading-relaxed">
            {footerText}
          </p>
        </div>

        {footerColumns.map((column) => (
          <nav key={column.id} className="flex flex-col gap-2">
            <span className="text-ink-muted text-[13px] font-semibold tracking-[0.06em] uppercase">
              {column.heading}
            </span>
            {column.links
              .filter((item) => item.visible)
              .map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="text-ink-soft hover:text-ink text-[15px] transition-colors duration-[120ms]"
                >
                  {item.label}
                </Link>
              ))}
          </nav>
        ))}
      </div>

      <div className="border-line border-t">
        <div className="text-ink-muted mx-auto flex max-w-[1200px] flex-col gap-3 px-6 py-6 text-[14px] sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} KI-Drama</span>
          <div className="flex gap-6">
            <Link
              href="/impressum"
              className="hover:text-ink transition-colors duration-[120ms]"
            >
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="hover:text-ink transition-colors duration-[120ms]"
            >
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
