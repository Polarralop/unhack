"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PatientOutcomeBadge } from "@/components/Badges";
import { ComeInCallout } from "@/components/ComeInCallout";
import { ImageGallery } from "@/components/ImageGallery";
import { Journey } from "@/components/Journey";
import { Thread } from "@/components/Thread";
import { ValuesTable } from "@/components/ValuesTable";
import { relativeTime, shortDate } from "@/lib/format";
import { CURRENT_PATIENT_ID, DOCTOR } from "@/lib/seed";
import { useResult, useStore } from "@/lib/store";

export function PatientResultView() {
  const { id } = useParams<{ id: string }>();
  const result = useResult(id);
  const { dispatch } = useStore();
  const [picked, setPicked] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Opening the page counts as the patient having received and seen it.
  useEffect(() => {
    if (result && !result.viewedAt) dispatch({ type: "view", id: result.id });
  }, [result, dispatch]);

  if (!result || result.patientId !== CURRENT_PATIENT_ID || !result.sharedAt) {
    return (
      <p>
        We couldn’t find this result. <Link href="/patient" className="underline">Back to your results</Link>
      </p>
    );
  }

  const check = result.check;
  const answered = picked !== null || result.acknowledgedAt !== undefined;
  const canConfirm = !check || answered;

  function pick(i: number) {
    if (!check || picked !== null) return;
    setPicked(i);
    dispatch({ type: "answerCheck", id: result!.id, correct: i === check.correctIndex });
  }

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <Link href="/patient" className="text-sm text-muted hover:text-ink">
          ← Your results
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{result.title}</h1>
        <p className="mt-1 text-muted">
          {result.method} on {result.specimen.toLowerCase()}, collected {shortDate(result.collectedAt)}. Shared by {DOCTOR.name}{" "}
          {relativeTime(result.sharedAt!)}.
        </p>
      </div>

      <section aria-labelledby="summary-heading" className="space-y-4">
        <h2 id="summary-heading" className="sr-only">Summary</h2>
        <PatientOutcomeBadge result={result} />
        <p className="text-2xl font-semibold leading-snug">{result.summary}</p>
        <p className="text-lg">{result.meaning}</p>
      </section>

      {result.discussInPerson && <ComeInCallout result={result} />}

      <section aria-labelledby="next-heading">
        <h2 id="next-heading" className="text-xl font-bold">What to do next</h2>
        <ol className="mt-3 space-y-3">
          {result.nextSteps.map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-scrub-soft text-sm font-bold text-scrub-deep">
                {i + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="images-heading" className="space-y-3">
        <h2 id="images-heading" className="text-xl font-bold">Your microscope images</h2>
        <p className="text-muted">
          These are pictures of cells from your sample under a fluorescence microscope. Glowing dyes make the
          cell centres (nuclei) show up blue, and coloured dots mark the genes the test looks for.
          {result.discussInPerson && " We can walk you through them when you come in."}
        </p>
        <ImageGallery images={result.images} probes={result.probes} title={result.title} />
      </section>

      {result.values.length > 0 && (
        <section>
          <button
            type="button"
            aria-expanded={showDetail}
            onClick={() => setShowDetail((v) => !v)}
            className="font-semibold text-scrub-deep underline underline-offset-4"
          >
            {showDetail ? "Hide the lab’s findings" : "Show the lab’s detailed findings"}
          </button>
          {showDetail && (
            <div className="mt-4 rounded-lg border border-line bg-surface p-4">
              <ValuesTable values={result.values} />
            </div>
          )}
        </section>
      )}

      <section aria-labelledby="confirm-heading" className="rounded-lg border-2 border-scrub bg-surface p-5 sm:p-6">
        {result.acknowledgedAt ? (
          <div>
            <h2 id="confirm-heading" className="text-xl font-bold text-scrub-deep">You confirmed you understand this result</h2>
            <p className="mt-1 text-muted">
              {DOCTOR.name} can see that you’ve read it. You can still ask a question below.
            </p>
            <div className="mt-5">
              <Journey result={result} />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <h2 id="confirm-heading" className="text-xl font-bold">Check you’ve got it</h2>

            {check && (
              <fieldset>
                <legend className="mb-3 font-semibold">{check.question}</legend>
                <div className="space-y-2">
                  {check.options.map((opt, i) => {
                    const isPicked = picked === i;
                    const isRight = i === check.correctIndex;
                    const reveal = picked !== null;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => pick(i)}
                        disabled={reveal}
                        className={`block w-full rounded-md border px-4 py-3 text-left ${
                          reveal && isRight
                            ? "border-scrub bg-scrub-soft"
                            : reveal && isPicked
                              ? "border-amber bg-amber-soft"
                              : "border-line hover:border-scrub"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {picked !== null && (
                  <p className={`mt-3 ${picked === check.correctIndex ? "text-scrub-deep" : "text-amber"}`} role="status">
                    {picked === check.correctIndex ? "That’s right. " : "Not quite. "}
                    <span className="text-ink">{check.explanation}</span>
                  </p>
                )}
              </fieldset>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={!canConfirm}
                onClick={() => dispatch({ type: "acknowledge", id: result.id })}
                className="rounded-md bg-scrub px-5 py-2.5 font-semibold text-white hover:bg-scrub-deep disabled:opacity-40"
              >
                I understand this result
              </button>
              <button
                type="button"
                onClick={() => document.getElementById("patient-question")?.focus()}
                className="rounded-md border border-line px-5 py-2.5 font-semibold hover:border-ink"
              >
                I have a question
              </button>
            </div>
            {!canConfirm && <p className="text-sm text-muted">Answer the question above first.</p>}
          </div>
        )}
      </section>

      <section aria-labelledby="questions-heading">
        <h2 id="questions-heading" className="mb-4 text-xl font-bold">Questions about this result</h2>
        <Thread result={result} as="patient" textareaId="patient-question" />
      </section>
    </div>
  );
}
