"use client";

import Link from "next/link";
import { ConcernBadge, PatientOutcomeBadge } from "@/components/Badges";
import { relativeTime } from "@/lib/format";
import { CURRENT_PATIENT_ID, DOCTOR, PATIENTS } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { isShared, stageOf } from "@/lib/types";

export default function PatientInbox() {
  const { results } = useStore();
  const patient = PATIENTS.find((p) => p.id === CURRENT_PATIENT_ID)!;
  const mine = results
    .filter(isShared)
    .filter((r) => r.patientId === CURRENT_PATIENT_ID)
    .sort((a, b) => b.sharedAt.localeCompare(a.sharedAt));
  const unread = mine.filter((r) => !r.viewedAt).length;
  const toConfirm = mine.filter((r) => r.viewedAt && !r.acknowledgedAt).length;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Hi {patient.name.split(" ")[0]}</h1>
      <p className="mt-1 text-lg text-muted">
        {unread > 0
          ? `${DOCTOR.name} shared ${unread === 1 ? "a new result" : `${unread} new results`} with you.`
          : toConfirm > 0
            ? `You have ${toConfirm === 1 ? "a result" : `${toConfirm} results`} to confirm you’ve understood.`
            : "You’re all caught up."}
      </p>

      {mine.length === 0 ? (
        <p className="mt-8 text-muted">When your doctor shares a test result, it will show up here.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {mine.map((r) => {
            const stage = stageOf(r);
            return (
              <li key={r.id}>
                <Link
                  href={`/patient/results/${r.id}`}
                  className={`block rounded-lg border bg-surface p-5 hover:border-scrub ${
                    stage === "shared" ? "border-scrub border-l-[6px]" : "border-line"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-lg font-bold">
                      {r.title}
                      {stage === "shared" && <span className="ml-2 text-base font-semibold text-scrub">New</span>}
                    </p>
                    <p className="text-sm text-muted">{relativeTime(r.sharedAt)}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {stage === "shared" ? (
                      <span className="text-muted">Tap to read what your doctor wrote.</span>
                    ) : (
                      <>
                        <PatientOutcomeBadge result={r} />
                        {r.discussInPerson && !r.appointmentRequestedAt ? (
                          <span className="text-sm font-semibold text-amber">Please come in when you can</span>
                        ) : r.discussInPerson && !r.appointmentBookedAt ? (
                          <span className="text-sm text-muted">Visit requested</span>
                        ) : stage === "opened" ? (
                          <span className="text-sm font-semibold text-amber">Please confirm you understand</span>
                        ) : null}
                        <ConcernBadge concern={r.concern} />
                      </>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
