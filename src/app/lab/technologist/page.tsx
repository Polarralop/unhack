"use client";

import Link from "next/link";
import { FlagBadge } from "@/components/Badges";
import { byNewest, CaseCard, CaseGrid } from "@/components/lab/CaseCard";
import { relativeTime } from "@/lib/format";
import { PATHOLOGIST } from "@/lib/seed";
import { useStore } from "@/lib/store";

export default function TechnologistQueue() {
  const { results, dispatch } = useStore();
  const toScore = results.filter((r) => r.labStage === "scoring").sort(byNewest("capturedAt"));
  const waiting = results.filter((r) => r.labStage === "signout").sort(byNewest("scoredAt"));

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scoring</h1>
          <p className="mt-1 text-muted">
            Upload captures from the microscope camera, score them, and send them to {PATHOLOGIST.name} for sign-out.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/lab/technologist/new"
            className="rounded-md bg-scrub px-4 py-2 font-semibold text-white hover:bg-scrub-deep"
          >
            Upload a capture
          </Link>
          <button
            type="button"
            onClick={() => dispatch({ type: "capture" })}
            className="rounded-md border border-line bg-surface px-4 py-2 font-semibold hover:border-ink"
          >
            Simulate a capture
          </button>
        </div>
      </div>

      <section aria-labelledby="score-heading">
        <h2 id="score-heading" className="text-xl font-bold">To score</h2>
        <CaseGrid empty="Nothing to score. Upload a capture from the microscope to get started.">
          {toScore.map((r) => (
            <li key={r.id}>
              <CaseCard
                r={r}
                href={`/lab/technologist/${r.id}`}
                meta={
                  r.returnNote ? (
                    <span className="font-semibold text-amber">Sent back by {PATHOLOGIST.name}</span>
                  ) : (
                    <span className="text-muted">
                      {r.source === "upload" ? "Uploaded" : "Captured"} {relativeTime(r.capturedAt)}
                    </span>
                  )
                }
              />
            </li>
          ))}
        </CaseGrid>
      </section>

      <section aria-labelledby="waiting-heading">
        <h2 id="waiting-heading" className="text-xl font-bold">Waiting for sign-out</h2>
        <p className="text-sm text-muted">Scored and with {PATHOLOGIST.name}. If they send one back, it returns to your list.</p>
        <CaseGrid empty="Nothing waiting for sign-out.">
          {waiting.map((r) => (
            <li key={r.id}>
              <CaseCard
                r={r}
                href={`/lab/technologist/${r.id}`}
                meta={
                  <>
                    <FlagBadge flag={r.flag} />
                    <span className="text-muted">Sent {relativeTime(r.scoredAt!)}</span>
                  </>
                }
              />
            </li>
          ))}
        </CaseGrid>
      </section>
    </div>
  );
}
