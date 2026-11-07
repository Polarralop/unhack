"use client";

import Link from "next/link";
import { FlagBadge } from "@/components/Badges";
import { byNewest, CaseCard, CaseGrid, patientName } from "@/components/lab/CaseCard";
import { relativeTime } from "@/lib/format";
import { DOCTOR, TECHNOLOGIST } from "@/lib/seed";
import { useStore } from "@/lib/store";

export default function PathologistQueue() {
  const { results } = useStore();
  const toSignOut = results.filter((r) => r.labStage === "signout").sort(byNewest("scoredAt"));
  const signedOut = results.filter((r) => r.labStage === "released").sort(byNewest("signedOutAt")).slice(0, 8);
  const scoring = results.filter((r) => r.labStage === "scoring").length;

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sign-out</h1>
        <p className="mt-1 text-muted">
          Check {TECHNOLOGIST.name}’s scoring against the images, then sign the report or send it back.
          {scoring > 0 && ` ${scoring} ${scoring === 1 ? "capture is" : "captures are"} still being scored.`}
        </p>
      </div>

      <section aria-labelledby="signout-heading">
        <h2 id="signout-heading" className="text-xl font-bold">Ready for sign-out</h2>
        <CaseGrid empty="Nothing waiting for you. Scored captures will appear here.">
          {toSignOut.map((r) => (
            <li key={r.id}>
              <CaseCard
                r={r}
                href={`/lab/pathologist/${r.id}`}
                meta={
                  <>
                    <FlagBadge flag={r.flag} />
                    <span className="text-muted">Scored {relativeTime(r.scoredAt!)}</span>
                  </>
                }
              />
            </li>
          ))}
        </CaseGrid>
      </section>

      <section aria-labelledby="released-heading">
        <h2 id="released-heading" className="text-xl font-bold">Recently signed out</h2>
        <p className="text-sm text-muted">Released to {DOCTOR.name}.</p>
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {signedOut.map((r) => (
            <li key={r.id}>
              <Link href={`/lab/pathologist/${r.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-3 hover:bg-paper">
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
