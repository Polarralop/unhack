"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FlagBadge } from "@/components/Badges";
import { ImageGallery } from "@/components/ImageGallery";
import { LabTrail } from "@/components/LabTrail";
import { ValuesTable } from "@/components/ValuesTable";
import { relativeTime, shortDate } from "@/lib/format";
import { DOCTOR, PATHOLOGIST, PATIENTS, TECHNOLOGIST } from "@/lib/seed";
import { useResult, useStore } from "@/lib/store";
import { flagFor, type DiagnosticResult, type Flag, type ResultValue } from "@/lib/types";

const field = "w-full rounded-md border border-line bg-surface px-3 py-2";

export function LabCaseView() {
  const { id } = useParams<{ id: string }>();
  const result = useResult(id);

  if (!result) {
    return (
      <p>
        This case doesn’t exist. <Link href="/lab" className="underline">Back to the lab</Link>
      </p>
    );
  }
  const patient = PATIENTS.find((p) => p.id === result.patientId)!;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/lab" className="text-sm text-muted hover:text-ink">
          ← Lab
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          {patient.name}, {result.title}
        </h1>
        <p className="mt-1 text-muted">
          {result.method} on {result.specimen.toLowerCase()}. Collected {shortDate(result.collectedAt)}, ordered by{" "}
          {DOCTOR.name}.
        </p>
      </div>

      <LabTrail result={result} />

      <div className="grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="images-heading" className="space-y-3">
          <h2 id="images-heading" className="text-xl font-bold">Microscope images</h2>
          <p className="text-sm text-muted">Stored exactly as captured. Images can’t be edited.</p>
          <ImageGallery images={result.images} probes={result.probes} title={`${patient.name} ${result.title}`} />
        </section>

        {/* key: reset form state when the case moves to a new stage */}
        <div key={result.labStage}>
          {result.labStage === "scoring" && <ScoreForm result={result} />}
          {result.labStage === "signout" && <SignOutForm result={result} />}
          {result.labStage === "released" && <ReleasedReport result={result} />}
        </div>
      </div>
    </div>
  );
}

function CallChoice({ flag, setFlag, suggested }: { flag: Flag; setFlag: (f: Flag) => void; suggested?: Flag }) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="font-semibold">Overall result</legend>
      <div className="flex flex-wrap gap-x-5 gap-y-1">
        {(["negative", "positive"] as const).map((f) => (
          <label key={f} className="flex items-center gap-2">
            <input type="radio" name="call" checked={flag === f} onChange={() => setFlag(f)} className="accent-scrub" />
            {f === "negative" ? "Negative" : "Positive"}
          </label>
        ))}
      </div>
      {suggested && suggested !== flag && (
        <p className="text-sm text-amber">
          The values you entered suggest {suggested}. Check the call before sending.
        </p>
      )}
    </fieldset>
  );
}

function ScoreForm({ result }: { result: DiagnosticResult }) {
  const { dispatch } = useStore();
  const router = useRouter();
  const [values, setValues] = useState<ResultValue[]>(result.values);
  const [interpretation, setInterpretation] = useState(result.labInterpretation);
  const withFlags = values.map((v) => ({ ...v, flag: flagFor(v.value, v.rule) }));
  const suggested: Flag = withFlags.some((v) => v.flag === "abnormal") ? "positive" : "negative";
  const [flag, setFlag] = useState<Flag>(suggested);

  function setValue(i: number, value: string) {
    setValues((vs) => vs.map((v, j) => (j === i ? { ...v, value } : v)));
  }

  const complete = values.every((v) => v.value.trim()) && interpretation.trim();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!complete) return;
    dispatch({ type: "submitScore", id: result.id, values: withFlags, flag, interpretation: interpretation.trim() });
    router.push("/lab");
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Score</h2>
        <p className="text-sm text-muted">
          {TECHNOLOGIST.name}, {TECHNOLOGIST.detail.toLowerCase()}. Values are pre-counted by the microscope’s
          scoring software. Check each one against the images and correct it if needed.
        </p>
      </div>

      {result.returnNote && (
        <div className="rounded-lg bg-amber-soft p-4">
          <p className="font-semibold">Sent back by {PATHOLOGIST.name}</p>
          <p className="mt-1">{result.returnNote}</p>
        </div>
      )}

      <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
        {withFlags.map((v, i) => (
          <li key={v.name} className="grid gap-2 p-4 sm:grid-cols-[1fr_11rem] sm:items-center">
            <div>
              <label htmlFor={`v-${i}`} className="font-semibold">{v.name}</label>
              {v.range && <p className="text-sm text-muted">Normal if {v.range}</p>}
            </div>
            <div className="flex items-center gap-2">
              {v.rule?.kind === "equals" ? (
                <select id={`v-${i}`} value={v.value} onChange={(e) => setValue(i, e.target.value)} className={field}>
                  {v.rule.options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={`v-${i}`}
                  inputMode="decimal"
                  value={v.value}
                  onChange={(e) => setValue(i, e.target.value)}
                  className={`${field} tabular-nums`}
                />
              )}
              <span className="w-20 shrink-0 text-sm text-muted">{v.unit}</span>
            </div>
            {v.rule && (
              <p className={`text-sm font-semibold sm:col-span-2 ${v.flag === "abnormal" ? "text-alert" : "text-scrub-deep"}`}>
                {v.flag === "abnormal" ? "Abnormal" : "Normal"}
              </p>
            )}
          </li>
        ))}
      </ul>

      <CallChoice flag={flag} setFlag={setFlag} suggested={suggested} />

      <label className="block space-y-1.5">
        <span className="font-semibold">Technical interpretation</span>
        <span className="block text-sm text-muted">For the pathologist and ordering doctor. Patients never see this.</span>
        <textarea value={interpretation} onChange={(e) => setInterpretation(e.target.value)} rows={4} className={field} />
      </label>

      <button
        type="submit"
        disabled={!complete}
        className="rounded-md bg-scrub px-5 py-2.5 font-semibold text-white hover:bg-scrub-deep disabled:opacity-40"
      >
        Send for sign-out
      </button>
    </form>
  );
}

function SignOutForm({ result }: { result: DiagnosticResult }) {
  const { dispatch } = useStore();
  const router = useRouter();
  const [flag, setFlag] = useState<Flag>(result.flag);
  const [interpretation, setInterpretation] = useState(result.labInterpretation);
  const [sendingBack, setSendingBack] = useState(false);
  const [note, setNote] = useState("");

  function signOut() {
    if (!interpretation.trim()) return;
    dispatch({ type: "signOut", id: result.id, flag, interpretation: interpretation.trim() });
    router.push("/lab");
  }

  function sendBack(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    dispatch({ type: "sendBack", id: result.id, note: note.trim() });
    router.push("/lab");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Sign out</h2>
        <p className="text-sm text-muted">
          {PATHOLOGIST.name}, {PATHOLOGIST.detail.toLowerCase()}. Scored by {result.scoredBy}{" "}
          {relativeTime(result.scoredAt!)}.
        </p>
      </div>

      <div className="rounded-lg border border-line bg-surface p-4">
        <ValuesTable values={result.values} />
      </div>

      <CallChoice flag={flag} setFlag={setFlag} />

      <label className="block space-y-1.5">
        <span className="font-semibold">Final interpretation</span>
        <span className="block text-sm text-muted">This is the signed report {DOCTOR.name} will see.</span>
        <textarea value={interpretation} onChange={(e) => setInterpretation(e.target.value)} rows={4} className={field} />
      </label>

      {!sendingBack ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={signOut}
            disabled={!interpretation.trim()}
            className="rounded-md bg-scrub px-5 py-2.5 font-semibold text-white hover:bg-scrub-deep disabled:opacity-40"
          >
            Sign out and release to {DOCTOR.name}
          </button>
          <button
            type="button"
            onClick={() => setSendingBack(true)}
            className="rounded-md border border-line px-5 py-2.5 font-semibold hover:border-ink"
          >
            Send back for re-scoring
          </button>
        </div>
      ) : (
        <form onSubmit={sendBack} className="space-y-3 rounded-lg bg-amber-soft p-4">
          <label className="block space-y-1.5">
            <span className="font-semibold">What should {TECHNOLOGIST.name} re-check?</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              autoFocus
              placeholder="e.g. Please rescore 20 more nuclei from a different area."
              className={field}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!note.trim()}
              className="rounded-md bg-ink px-5 py-2.5 font-semibold text-white disabled:opacity-40"
            >
              Send back
            </button>
            <button type="button" onClick={() => setSendingBack(false)} className="px-2 font-semibold text-muted hover:text-ink">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function ReleasedReport({ result }: { result: DiagnosticResult }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Signed report</h2>
        <p className="text-sm text-muted">
          {result.sharedAt
            ? `${DOCTOR.name} shared this with the patient ${relativeTime(result.sharedAt)}.`
            : `Waiting for ${DOCTOR.name} to review and share with the patient.`}
        </p>
      </div>
      <div className="space-y-4 rounded-lg border border-line bg-surface p-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Result</span>
          <FlagBadge flag={result.flag} />
        </div>
        <p className="text-sm">{result.labInterpretation}</p>
        <ValuesTable values={result.values} />
      </div>
    </div>
  );
}
