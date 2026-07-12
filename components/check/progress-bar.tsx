export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1 w-full bg-line"
    >
      <div
        className="h-full bg-accent transition-[width] duration-200"
        style={{ width: `${Math.round(progress * 100)}%` }}
      />
    </div>
  );
}
