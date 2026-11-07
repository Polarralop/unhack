"use client";

/* eslint-disable @next/next/no-img-element -- static demo SVGs */

import Link from "next/link";
import { ConcernBadge, FlagBadge, VisitBadge } from "@/components/Badges";
import { Journey } from "@/components/Journey";
import { daysSince, relativeTime } from "@/lib/format";
import { PATIENTS } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { isShared, type SharedResult } from "@/lib/types";

/** Why a shared result needs the doctor's attention, or null if it doesn't. */
function attentionReason(r: SharedResult): string | null {
  if (r.concern === "open") return "Patient asked a question";
  if (r.appointmentRequestedAt && !r.appointmentBookedAt) return "Patient asked for an appointment";
  if (!r.viewedAt && daysSince(r.sharedAt) >= 3) return `Not opened after ${Math.floor(daysSince(r.sharedAt))} days`;
  if (r.checkCorrect === false && !r.acknowledgedAt) return "Patient may have misunderstood";
  if (r.discussInPerson && r.viewedAt && !r.appointmentRequestedAt && daysSince(r.viewedAt) >= 2)
    return "Asked to come in, no visit requested yet";
  if (r.flag === "positive" && r.viewedAt && !r.acknowledgedAt && daysSince(r.viewedAt) >= 2)
    return "Positive result opened but not confirmed";
  return null;
}

function patientName(id: string) {
  return PATIENTS.find((p) => p.id === id)?.name ?? "Unknown patient";
}

export default function DoctorDashboard() {
  const { results, dispatch } = useStore();
  const incoming = results.filter((r) => !isShared(r)).sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
  const sharedResults = results.filter(isShared).sort((a, b) => b.sharedAt.localeCompare(a.sharedAt));
  const attention = sharedResults
    .map((r) => ({ r, reason: attentionReason(r) }))
    .filter((x): x is { r: SharedResult; reason: string } => x.reason !== null);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Results</h1>
        <p className="mt-1 text-muted">
          {incoming.length} waiting for your review, {sharedResults.length} shared with patients
        </p>
      </div>

      <section aria-labelledby="incoming-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="incoming-heading" className="text-xl font-bold">From the microscope</h2>
            <p className="text-sm text-muted">New captures land here. Review each one and share it with the patient.</p>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: "capture" })}
            className="rounded-md border border-line bg-surface px-4 py-2 font-semibold hover:border-ink"
          >
            Simulate a microscope capture
          </button>
        </div>

        {incoming.length === 0 ? (
          <p className="mt-4 text-muted">You’re all caught up. New microscope captures will appear here.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {incoming.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/doctor/review/${r.id}`}
                  className="flex gap-4 rounded-lg border border-line bg-surface p-3 hover:border-scrub"
                >
                  <img
                    src={r.images[0]?.src}
                    alt=""
                    className="size-24 shrink-0 rounded bg-black object-cover"
                  />
                  <div className="min-w-0 space-y-1">
                    <p className="font-semibold">{patientName(r.patientId)}</p>
                    <p className="text-muted">{r.title}</p>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <FlagBadge flag={r.flag} />
                      <span className="text-muted">Captured {relativeTime(r.capturedAt)}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="attention-heading">
        <h2 id="attention-heading" className="text-xl font-bold">Needs your follow-up</h2>
        {attention.length === 0 ? (
          <p className="mt-3 text-muted">Nothing waiting on you. Every shared result has been opened and nobody has an open question.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-amber/30 bg-surface">
            {attention.map(({ r, reason }) => (
              <li key={r.id}>
                <Link
                  href={`/doctor/results/${r.id}`}
                  className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-4 hover:bg-amber-soft/40"
                >
                  <span className="w-full font-semibold text-amber sm:w-72">{reason}</span>
                  <span className="flex-1">
                    <span className="font-semibold">{patientName(r.patientId)}</span>
                    <span className="text-muted">, {r.title}</span>
                  </span>
                  <span className="text-sm text-muted">Shared {relativeTime(r.sharedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="all-heading">
        <h2 id="all-heading" className="text-xl font-bold">Shared with patients</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[48rem] text-left">
            <thead>
              <tr className="border-b border-line text-sm text-muted">
                <th className="px-5 py-3 font-normal">Patient</th>
                <th className="px-5 py-3 font-normal">Result</th>
                <th className="px-5 py-3 font-normal">Shared</th>
                <th className="px-5 py-3 font-normal">Status</th>
                <th className="px-5 py-3 font-normal">Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {sharedResults.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0 hover:bg-paper">
                  <td className="px-5 py-3.5">
                    <Link href={`/doctor/results/${r.id}`} className="font-semibold hover:underline">
                      {patientName(r.patientId)}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="mr-2">{r.title}</span>
                    {r.flag === "positive" && <FlagBadge flag={r.flag} />}
                  </td>
                  <td className="px-5 py-3.5 text-muted">{relativeTime(r.sharedAt)}</td>
                  <td className="px-5 py-3.5">
                    <Journey result={r} compact />
                  </td>
                  <td className="space-x-1 px-5 py-3.5">
                    <ConcernBadge concern={r.concern} />
                    <VisitBadge result={r} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
