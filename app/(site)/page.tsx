export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-12 px-6 py-24">
      <div className="flex flex-col gap-2">
        <span className="text-ink-muted text-[13px] font-semibold tracking-[0.06em] uppercase">
          Fundament
        </span>
        <h1 className="text-ink text-[34px] font-bold tracking-[-0.02em] md:text-[52px]">
          KI-Drama
        </h1>
        <p className="text-ink-soft max-w-[65ch] text-[17px] leading-relaxed">
          Die Aufregung ist groß, die Erklärung fehlt. Diese Seite zeigt die
          Schriften und Farben des Design-Systems — sonst nichts.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-ink text-[20px] font-semibold tracking-[-0.01em]">
          Typografie
        </h2>
        <div className="border-line bg-surface rounded-[12px] border p-6 shadow-[var(--shadow-card)]">
          <p className="font-display text-ink text-[34px] font-bold tracking-[-0.015em]">
            Plus Jakarta Sans — Überschriften
          </p>
          <p className="text-ink-soft mt-2 max-w-[65ch] text-[17px] leading-relaxed">
            Inter ist die Schrift für Fließtext und UI. Sie ist ruhig, gut
            lesbar und in mehreren Schnitten verfügbar.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ink text-[20px] font-semibold tracking-[-0.01em]">
          Farben
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {[
            { name: "canvas", className: "bg-canvas" },
            { name: "surface", className: "bg-surface border border-line" },
            { name: "surface-alt", className: "bg-surface-alt" },
            { name: "ink", className: "bg-ink" },
            { name: "accent", className: "bg-accent" },
            { name: "accent-soft", className: "bg-accent-soft" },
            { name: "signal", className: "bg-signal" },
            { name: "success", className: "bg-success" },
            { name: "warning", className: "bg-warning" },
            { name: "danger", className: "bg-danger" },
          ].map((swatch) => (
            <div key={swatch.name} className="flex flex-col gap-2">
              <div
                className={`h-20 rounded-[12px] ${swatch.className}`}
                aria-hidden
              />
              <span className="text-ink-muted text-[14px] font-medium">
                {swatch.name}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
