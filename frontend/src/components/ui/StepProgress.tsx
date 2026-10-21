interface StepProgressProps {
  steps: string[];
  currentStep: number; // 0-indexed
}

export default function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
      {steps.map((label, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs ${
                isDone
                  ? "border-gold bg-gold text-ink"
                  : isActive
                    ? "border-gold text-gold"
                    : "border-line text-cream-dim/60"
              }`}
            >
              {isDone ? "✓" : i + 1}
            </span>
            <span className={`text-sm ${isActive ? "text-cream" : "text-cream-dim/70"}`}>{label}</span>
            {i < steps.length - 1 && <span className="mx-2 h-px w-6 bg-line" />}
          </li>
        );
      })}
    </ol>
  );
}
