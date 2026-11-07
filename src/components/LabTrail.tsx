import { relativeTime } from "@/lib/format";
import type { DiagnosticResult } from "@/lib/types";

/** Who handled a capture at the lab, and when. Shown to lab staff and the doctor. */
export function LabTrail({ result }: { result: DiagnosticResult }) {
  const steps = [
    { label: "Captured", by: "Microscope", at: result.capturedAt },
    { label: "Scored", by: result.scoredBy, at: result.labStage === "scoring" ? undefined : result.scoredAt },
    { label: "Signed out", by: result.signedOutBy, at: result.signedOutAt },
  ];
  return (
    <ol className="grid grid-cols-3 gap-2 rounded-lg border border-line bg-surface p-4 text-sm" aria-label="Lab progress">
      {steps.map((s) => (
        <li key={s.label} className={s.at ? "" : "text-muted"}>
          <p className="font-semibold">
            <span aria-hidden className={s.at ? "text-scrub" : ""}>{s.at ? "✓ " : "○ "}</span>
            {s.label}
          </p>
          <p>{s.at ? `${s.by}, ${relativeTime(s.at)}` : "Not yet"}</p>
        </li>
      ))}
    </ol>
  );
}
