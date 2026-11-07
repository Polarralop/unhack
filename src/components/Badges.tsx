import type { ConcernState, DiagnosticResult, Flag } from "@/lib/types";

const pill = "inline-flex rounded-full px-2.5 py-0.5 text-sm font-semibold";

/** Doctor-facing lab call. */
export function FlagBadge({ flag }: { flag: Flag }) {
  return flag === "negative" ? (
    <span className={`${pill} bg-scrub-soft text-scrub-deep`}>Negative</span>
  ) : (
    <span className={`${pill} bg-alert-soft text-alert`}>Positive</span>
  );
}

/**
 * Patient-facing outcome. Results that should be discussed in person get a
 * calm, non-explicit label instead of "changes found".
 */
export function PatientOutcomeBadge({ result }: { result: DiagnosticResult }) {
  if (result.discussInPerson) return <span className={`${pill} bg-amber-soft text-amber`}>Let’s talk in person</span>;
  if (result.flag === "negative") return <span className={`${pill} bg-scrub-soft text-scrub-deep`}>No changes found</span>;
  return <span className={`${pill} bg-amber-soft text-amber`}>Changes found</span>;
}

export function ConcernBadge({ concern }: { concern: ConcernState }) {
  if (concern === "none") return null;
  if (concern === "open") return <span className={`${pill} bg-amber-soft text-amber`}>Question open</span>;
  return <span className="inline-flex px-1 text-sm text-muted">Question answered</span>;
}

export function VisitBadge({ result }: { result: DiagnosticResult }) {
  if (result.appointmentBookedAt) return <span className="inline-flex px-1 text-sm text-muted">Visit booked</span>;
  if (result.appointmentRequestedAt) return <span className={`${pill} bg-amber-soft text-amber`}>Visit requested</span>;
  return null;
}
