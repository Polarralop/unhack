"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ConcernBadge, FlagBadge, VisitBadge } from "@/components/Badges";
import { ImageGallery } from "@/components/ImageGallery";
import { LabTrail } from "@/components/LabTrail";
import { Journey } from "@/components/Journey";
import { Thread } from "@/components/Thread";
import { ValuesTable } from "@/components/ValuesTable";
import { relativeTime, shortDate } from "@/lib/format";
import { PATIENTS } from "@/lib/seed";
import { useResult, useStore } from "@/lib/store";

export function DoctorResultView() {
  const { id } = useParams<{ id: string }>();
  const result = useResult(id);
  const { dispatch } = useStore();

  if (!result) {
    return (
      <p>
        This result doesn’t exist. <Link href="/doctor" className="underline">Back to results</Link>
      </p>
    );
  }
  if (!result.sharedAt) {
    return (
      <p>
        This capture hasn’t been shared yet.{" "}
        <Link href={`/doctor/review/${result.id}`} className="underline">Review it</Link>
      </p>
    );
  }
  const patient = PATIENTS.find((p) => p.id === result.patientId)!;
  const first = patient.name.split(" ")[0];

  return (
    <div className="space-y-10">
      <div>
        <Link href="/doctor" className="text-sm text-muted hover:text-ink">
          ← Results
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          {patient.name}, {result.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-muted">
          <span>{patient.detail}</span>
          <span>
            {result.method} on {result.specimen.toLowerCase()}
          </span>
          <span>Collected {shortDate(result.collectedAt)}</span>
          <FlagBadge flag={result.flag} />
          <ConcernBadge concern={result.concern} />
          <VisitBadge result={result} />
        </div>
      </div>

      <section className="rounded-lg border border-line bg-surface p-5 sm:p-6">
        <h2 className="sr-only">Status</h2>
        <Journey result={result} />
        <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
          {result.check && (
            <p>
              <span className="font-semibold">Comprehension check: </span>
              {result.checkCorrect === undefined && <span className="text-muted">not answered yet</span>}
              {result.checkCorrect === true && <span className="text-scrub-deep">answered correctly on the first try</span>}
              {result.checkCorrect === false && (
                <span className="text-amber">answered incorrectly on the first try, so consider following up</span>
              )}
            </p>
          )}
          {result.discussInPerson && (
            <div className="flex flex-wrap items-center gap-3">
              <p>
                <span className="font-semibold">Asked to come in: </span>
                {result.appointmentBookedAt ? (
                  <span className="text-scrub-deep">visit booked {relativeTime(result.appointmentBookedAt)}</span>
                ) : result.appointmentRequestedAt ? (
                  <span className="text-amber">
                    {first} asked for an appointment {relativeTime(result.appointmentRequestedAt)}
                  </span>
                ) : (
                  <span className="text-muted">{first} hasn’t asked for an appointment yet</span>
                )}
              </p>
              {!result.appointmentBookedAt && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "bookAppointment", id: result.id })}
                  className="rounded-md border border-line px-3 py-1 font-semibold hover:border-ink"
                >
                  Mark visit booked
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-10">
          <section aria-labelledby="sent-heading" className="space-y-4">
            <h2 id="sent-heading" className="text-xl font-bold">What {first} sees</h2>
            <div className="space-y-4 rounded-lg border border-line bg-surface p-5">
              <p className="text-lg font-semibold">{result.summary}</p>
              <p>{result.meaning}</p>
              <ul className="list-disc space-y-1 pl-5">
                {result.nextSteps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </section>

          <section aria-labelledby="images-heading" className="space-y-4">
            <h2 id="images-heading" className="text-xl font-bold">Microscopy images</h2>
            <ImageGallery images={result.images} probes={result.probes} title={`${patient.name} ${result.title}`} />
          </section>

          <section aria-labelledby="lab-heading" className="space-y-3">
            <h2 id="lab-heading" className="text-xl font-bold">Lab report</h2>
            <LabTrail result={result} />
            <div className="rounded-lg border border-line bg-surface p-5">
              <p className="mb-4 text-sm">{result.labInterpretation}</p>
              <ValuesTable values={result.values} />
            </div>
          </section>
        </div>

        <section aria-labelledby="questions-heading">
          <h2 id="questions-heading" className="mb-4 text-xl font-bold">Questions</h2>
          <Thread result={result} as="doctor" />
        </section>
      </div>
    </div>
  );
}
