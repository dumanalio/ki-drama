import { Card } from "@/components/ui/card";

export function KpiCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <span className="text-ink-muted text-[13px] font-medium">{label}</span>
      <p className="text-ink mt-2 text-[32px] font-bold tracking-[-0.02em]">
        {value}
      </p>
    </Card>
  );
}
