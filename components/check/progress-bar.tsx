export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="bg-line h-1 w-full"
    >
      <div
        className="bg-accent h-full transition-[width] duration-200"
        style={{ width: `${Math.round(progress * 100)}%` }}
      />
    </div>
  );
}
