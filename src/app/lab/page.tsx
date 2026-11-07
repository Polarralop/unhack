"use client";

/* eslint-disable @next/next/no-img-element -- static demo SVGs */

import Link from "next/link";
import { FlagBadge } from "@/components/Badges";
import { relativeTime } from "@/lib/format";
import { DOCTOR, PATIENTS } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type { DiagnosticResult } from "@/lib/types";

function patientName(id: string) {
  return PATIENTS.find((p) => p.id === id)?.name ?? "Unknown patient";
}

function CaseCard({ r, meta }: { r: DiagnosticResult; meta: React.ReactNode }) {
  return (
    <Link href={`/lab/${r.id}`} className="flex gap-4 rounded-lg border border-line bg-surface p-3 hover:border-scrub">
      <img src={r.images[0]?.src} alt="" className="size-20 shrink-0 rounded bg-black object-cover" />
      <div className="min-w-0 space-y-1">
        <p className="font-semibold">{patientName(r.patientId)}</p>
        <p className="text-muted">{r.title}</p>
        <div className="flex flex-wrap items-center gap-2 text-sm">{meta}</div>
      </div>
    </Link>
  );
}

export default function LabQueue() {
  const { results, dispatch } = useStore();
  const byNewest = (key: "capturedAt" | "scoredAt" | "signedOutAt") => (a: DiagnosticResult, b: DiagnosticResult) =>
    (b[key] ?? "").localeCompare(a[key] ?? "");

  const toScore = results.filter((r) => r.labStage === "scoring").sort(byNewest("capturedAt"));
  const toSignOut = results.filter((r) => r.labStage === "signout").sort(byNewest("scoredAt"));
  const releasedRecently = results.filter((r) => r.labStage === "released").sort(byNewest("signedOutAt")).slice(0, 6);

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab</h1>
          <p className="mt-1 text-muted">
            Score each microscope capture, then a pathologist signs it out and it goes to the ordering doctor.
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: "capture" })}
          className="rounded-md border border-line bg-surface px-4 py-2 font-semibold hover:border-ink"
        >
          Simulate a microscope capture
        </button>
      </div>

      <section aria-labelledby="score-heading">
        <h2 id="score-heading" className="text-xl font-bold">To score</h2>
        <p className="text-sm text-muted">For the technologist. New captures from the microscope land here.</p>
        {toScore.length === 0 ? (
          <p className="mt-4 text-muted">Nothing to score. New captures will appear here.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {toScore.map((r) => (
              <li key={r.id}>
                <CaseCard
                  r={r}
                  meta={
                    r.returnNote ? (
                      <span className="font-semibold text-amber">Sent back by the pathologist</span>
                    ) : (
                      <span className="text-muted">Captured {relativeTime(r.capturedAt)}</span>
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="signout-heading">
        <h2 id="signout-heading" className="text-xl font-bold">Ready for sign-out</h2>
        <p className="text-sm text-muted">For the pathologist. Check the scoring and sign the report.</p>
        {toSignOut.length === 0 ? (
          <p className="mt-4 text-muted">Nothing waiting for sign-out.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {toSignOut.map((r) => (
              <li key={r.id}>
                <CaseCard
                  r={r}
                  meta={
                    <>
                      <FlagBadge flag={r.flag} />
                      <span className="text-muted">Scored {relativeTime(r.scoredAt!)}</span>
                    </>
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="released-heading">
        <h2 id="released-heading" className="text-xl font-bold">Recently released</h2>
        <p className="text-sm text-muted">Signed out and sent to {DOCTOR.name}.</p>
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {releasedRecently.map((r) => (
            <li key={r.id}>
              <Link href={`/lab/${r.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-3 hover:bg-paper">
                <span className="flex-1">
                  <span className="font-semibold">{patientName(r.patientId)}</span>
                  <span className="text-muted">, {r.title}</span>
                </span>
                <FlagBadge flag={r.flag} />
                <span className="text-sm text-muted">Signed out {relativeTime(r.signedOutAt!)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
