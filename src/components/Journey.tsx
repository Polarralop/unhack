import { relativeTime } from "@/lib/format";
import { stageOf, type DiagnosticResult } from "@/lib/types";

const STEPS = [
  { key: "shared", label: "Shared", at: (r: DiagnosticResult) => r.sharedAt },
  { key: "opened", label: "Opened", at: (r: DiagnosticResult) => r.viewedAt },
  { key: "understood", label: "Understood", at: (r: DiagnosticResult) => r.acknowledgedAt },
] as const;

/**
 * The result's journey to the patient: shared → opened → understood.
 * This is the platform's core signal, shown the same way to both sides.
 */
export function Journey({ result, compact = false }: { result: DiagnosticResult; compact?: boolean }) {
  const reached = STEPS.findIndex((s) => s.key === stageOf(result));

  if (compact) {
    return (
      <div className="flex items-center" aria-label={`Status: ${STEPS[reached].label}`}>
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center">
            {i > 0 && <span className={`h-0.5 w-5 ${i <= reached ? "bg-scrub" : "bg-line"}`} />}
            <span
              title={s.label}
              className={`size-2.5 rounded-full border-2 ${i <= reached ? "border-scrub bg-scrub" : "border-line bg-surface"}`}
            />
          </div>
        ))}
        <span className="ml-2.5 text-sm text-muted">{STEPS[reached].label}</span>
      </div>
    );
  }

  return (
    <ol className="grid grid-cols-3" aria-label="Result status">
      {STEPS.map((s, i) => {
        const done = i <= reached;
        const at = s.at(result);
        return (
          <li key={s.key} className="relative pr-2">
            <div className="flex items-center">
              <span
                className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  done ? "border-scrub bg-scrub text-white" : "border-line bg-surface text-muted"
                }`}
                aria-hidden
              >
                {done ? "✓" : i + 1}
              </span>
              {i < STEPS.length - 1 && (
                <span className={`h-1 flex-1 ${i < reached ? "bg-scrub" : "bg-line"}`} aria-hidden />
              )}
            </div>
            <p className={`mt-2 font-semibold ${done ? "text-ink" : "text-muted"}`}>{s.label}</p>
            <p className="text-sm text-muted">{at ? relativeTime(at) : "Not yet"}</p>
          </li>
        );
      })}
    </ol>
  );
}
