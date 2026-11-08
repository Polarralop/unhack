"use client";

import { useState } from "react";
import { relativeTime } from "@/lib/format";
import { DOCTOR, PATIENTS } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type { DiagnosticResult, Role } from "@/lib/types";

/** Questions and concerns tied to one result. */
export function Thread({
  result,
  as,
  textareaId,
}: {
  result: DiagnosticResult;
  as: Role;
  textareaId?: string;
}) {
  const { dispatch } = useStore();
  const [body, setBody] = useState("");
  const patient = PATIENTS.find((p) => p.id === result.patientId)!;
  const doctorFirst = DOCTOR.name;

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    dispatch({ type: "message", id: result.id, from: as, body: text });
    setBody("");
  }

  return (
    <div>
      {result.messages.length > 0 && (
        <ul className="mb-5 space-y-3">
          {result.messages.map((m) => {
            const mine = m.from === as;
            return (
              <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    m.from === "doctor" ? "bg-scrub-soft" : "border border-line bg-surface"
                  }`}
                >
                  <p className="text-sm text-muted">
                    <span className="font-semibold text-ink">
                      {m.from === "doctor" ? doctorFirst : patient.name}
                    </span>
                    , {relativeTime(m.at)}
                  </p>
                  <p className="mt-1 whitespace-pre-line">{m.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {result.messages.length === 0 && as === "doctor" && (
        <p className="mb-4 text-muted">{patient.name} hasn’t asked anything about this result.</p>
      )}

      <form onSubmit={send} className="space-y-3">
        <label htmlFor={textareaId ?? `reply-${result.id}`} className="block font-semibold">
          {as === "patient" ? `Ask ${DOCTOR.name} a question` : `Reply to ${patient.name}`}
        </label>
        <textarea
          id={textareaId ?? `reply-${result.id}`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder={
            as === "patient"
              ? "For example: does this mean I need to change my medication?"
              : "Write a response"
          }
          className="w-full rounded-md border border-line bg-surface px-3 py-2 placeholder:text-muted/70"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!body.trim()}
            className="rounded-md bg-scrub px-4 py-2 font-semibold text-white hover:bg-scrub-deep disabled:opacity-40"
          >
            {as === "patient" ? "Send question" : "Send reply"}
          </button>
          {as === "doctor" && result.concern === "open" && (
            <button
              type="button"
              onClick={() => dispatch({ type: "resolve", id: result.id })}
              className="rounded-md border border-line px-4 py-2 font-semibold hover:border-ink"
            >
              Mark question answered
            </button>
          )}
          {as === "patient" && (
            <p className="text-sm text-muted">For anything urgent, call the clinic or 911.</p>
          )}
        </div>
      </form>
    </div>
  );
}
