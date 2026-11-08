"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FlagBadge } from "@/components/Badges";
import { LabTrail } from "@/components/LabTrail";
import { ImageGallery } from "@/components/ImageGallery";
import { ValuesTable } from "@/components/ValuesTable";
import { METHODS, SPECIMENS, suggestionFor } from "@/lib/assays";
import { relativeTime, shortDate } from "@/lib/format";
import { PATIENTS } from "@/lib/seed";
import { useResult, useStore } from "@/lib/store";
import type { DiagnosticResult } from "@/lib/types";

export function ReviewView() {
  const { id } = useParams<{ id: string }>();
  const result = useResult(id);

  if (!result) {
    return (
      <p>
        This capture doesn’t exist. <Link href="/doctor" className="underline">Back to results</Link>
      </p>
    );
  }
  if (result.labStage !== "released") {
    return (
      <p>
        This capture is still at the lab. It will appear in your feed once it’s signed out.{" "}
        <Link href="/doctor" className="underline">Back to results</Link>
      </p>
    );
  }
  if (result.sharedAt) {
    return (
      <p>
        This result has already been shared.{" "}
        <Link href={`/doctor/results/${result.id}`} className="underline">Open it</Link>
      </p>
    );
  }
  // key: reset the form if a different capture is opened
  return <Review key={result.id} result={result} />;
}

const field = "w-full rounded-md border border-line bg-surface px-3 py-2";

function Review({ result }: { result: DiagnosticResult }) {
  const { dispatch } = useStore();
  const router = useRouter();
  const patient = PATIENTS.find((p) => p.id === result.patientId)!;
  // Based on the lab's signed-out call, so it fits uploads and re-scored captures too.
  const s = suggestionFor(result.assayKey, result.flag);
  const sCheck = s?.check;

  const [method, setMethod] = useState(result.method);
  const [specimen, setSpecimen] = useState(result.specimen);
  const [flag, setFlag] = useState(result.flag);
  const [discussInPerson, setDiscussInPerson] = useState(s?.discussInPerson ?? false);
  const [summary, setSummary] = useState(s?.summary ?? "");
  const [meaning, setMeaning] = useState(s?.meaning ?? "");
  const [nextSteps, setNextSteps] = useState((s?.nextSteps ?? []).join("\n"));
  const [withCheck, setWithCheck] = useState(Boolean(sCheck));
  const [question, setQuestion] = useState(sCheck?.question ?? "");
  const [correct, setCorrect] = useState(sCheck ? sCheck.options[sCheck.correctIndex] : "");
  const [wrong, setWrong] = useState(sCheck ? sCheck.options.find((_, i) => i !== sCheck.correctIndex)! : "");
  const [explanation, setExplanation] = useState(sCheck?.explanation ?? "");

  const canShare =
    summary.trim() && meaning.trim() && (!withCheck || (question.trim() && correct.trim() && wrong.trim()));

  function share(e: React.FormEvent) {
    e.preventDefault();
    if (!canShare) return;
    dispatch({
      type: "share",
      id: result.id,
      details: {
        method,
        specimen,
        flag,
        discussInPerson,
        summary: summary.trim(),
        meaning: meaning.trim(),
        nextSteps: nextSteps.split("\n").map((l) => l.trim()).filter(Boolean),
        check: withCheck
          ? {
              question: question.trim(),
              options: [wrong.trim(), correct.trim()],
              correctIndex: 1,
              explanation: explanation.trim() || `The answer is: ${correct.trim()}`,
            }
          : undefined,
      },
    });
    router.push(`/doctor/results/${result.id}`);
  }

  return (
    <div className="space-y-10">
      <div>
        <Link href="/doctor" className="text-sm text-muted hover:text-ink">
          ← Results
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Review: {patient.name}, {result.title}
        </h1>
        <p className="mt-1 text-muted">
          Collected {shortDate(result.collectedAt)}. Signed out by {result.signedOutBy}{" "}
          {relativeTime(result.signedOutAt!)}.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="lab-heading" className="space-y-6">
          <h2 id="lab-heading" className="text-xl font-bold">Lab report</h2>
          <LabTrail result={result} />
          <ImageGallery images={result.images} probes={result.probes} title={`${patient.name} ${result.title}`} />
          <div className="rounded-lg border border-line bg-surface p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="font-semibold">Signed-out result</span>
              <FlagBadge flag={result.flag} />
            </div>
            <p className="text-sm">{result.labInterpretation}</p>
            <p className="mt-1 text-sm text-muted">Text above is hidden from patient.</p>
            <div className="mt-4">
              <ValuesTable values={result.values} />
            </div>
          </div>
        </section>

        <form onSubmit={share} className="space-y-8">
          <div>
            <h2 className="text-xl font-bold">For {patient.name}</h2>
            <p className="mt-1 text-muted">
              {s
                ? "Pre-filled with suggested wording for this result. Edit anything before you share."
                : "There’s no suggested wording for this result yet. Write it in your own words."}
            </p>
          </div>

          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="sr-only">About the test</legend>
            <label className="block space-y-1.5">
              <span className="font-semibold">Method</span>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className={field}>
                {METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="font-semibold">Specimen</span>
              <select value={specimen} onChange={(e) => setSpecimen(e.target.value)} className={field}>
                {SPECIMENS.map((sp) => (
                  <option key={sp}>{sp}</option>
                ))}
              </select>
            </label>
            <div className="space-y-1.5 sm:col-span-2">
              <span className="font-semibold">Result</span>
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                {(["negative", "positive"] as const).map((f) => (
                  <label key={f} className="flex items-center gap-2">
                    <input type="radio" name="flag" checked={flag === f} onChange={() => setFlag(f)} className="accent-scrub" />
                    {f === "negative" ? "Negative, no change found" : "Positive, change found"}
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          <label className="flex gap-3 rounded-lg border border-line bg-surface p-4">
            <input
              type="checkbox"
              checked={discussInPerson}
              onChange={(e) => setDiscussInPerson(e.target.checked)}
              className="mt-1.5 accent-scrub"
            />
            <span>
              <span className="block font-semibold">Ask {patient.name.split(" ")[0]} to come in to talk about it</span>
              <span className="block text-sm text-muted">
                For results that may mean a new or changed cancer diagnosis. Keep the wording below gentle and
                non-explicit. The patient will see a calm request to come in and a button to ask for an appointment.
              </span>
            </span>
          </label>

          <fieldset className="space-y-4">
            <legend className="text-lg font-bold">Explanation</legend>
            <label className="block space-y-1.5">
              <span className="font-semibold">What the result says</span>
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} className={field} />
            </label>
            <label className="block space-y-1.5">
              <span className="font-semibold">What it means for them</span>
              <textarea value={meaning} onChange={(e) => setMeaning(e.target.value)} rows={3} className={field} />
            </label>
            <label className="block space-y-1.5">
              <span className="font-semibold">Next steps</span>
              <span className="block text-sm text-muted">One per line.</span>
              <textarea value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} rows={4} className={field} />
            </label>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-bold">Comprehension check</legend>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={withCheck} onChange={(e) => setWithCheck(e.target.checked)} className="accent-scrub" />
              Ask one question before they confirm they understand
            </label>
            {withCheck && (
              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="font-semibold">Question</span>
                  <input value={question} onChange={(e) => setQuestion(e.target.value)} className={field} />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="font-semibold">Correct answer</span>
                    <input value={correct} onChange={(e) => setCorrect(e.target.value)} className={field} />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="font-semibold">A wrong answer</span>
                    <input value={wrong} onChange={(e) => setWrong(e.target.value)} className={field} />
                  </label>
                </div>
                <label className="block space-y-1.5">
                  <span className="font-semibold">Explanation shown after they answer</span>
                  <input value={explanation} onChange={(e) => setExplanation(e.target.value)} className={field} />
                </label>
              </div>
            )}
          </fieldset>

          <div className="flex items-center gap-4 border-t border-line pt-6">
            <button
              type="submit"
              disabled={!canShare}
              className="rounded-md bg-scrub px-5 py-2.5 font-semibold text-white hover:bg-scrub-deep disabled:opacity-40"
            >
              Share with {patient.name}
            </button>
            <Link href="/doctor" className="text-muted hover:text-ink">
              Not now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
