"use client";

import { CLINIC_PHONE, DOCTOR } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type { DiagnosticResult } from "@/lib/types";

/**
 * Shown on results the doctor wants to discuss in person. Deliberately calm
 * and non-explicit: the goal is getting the patient in, not delivering news.
 */
export function ComeInCallout({ result }: { result: DiagnosticResult }) {
  const { dispatch } = useStore();
  const doctorShort = DOCTOR.name.replace(/^Dr\. \w+ /, "Dr. ");

  return (
    <section aria-labelledby="come-in-heading" className="rounded-lg bg-amber-soft p-5 sm:p-6">
      <h2 id="come-in-heading" className="text-xl font-bold">
        {doctorShort} would like to see you
      </h2>
      {result.appointmentBookedAt ? (
        <p className="mt-2">Your visit is booked. We look forward to seeing you, and you’re welcome to bring someone with you.</p>
      ) : result.appointmentRequestedAt ? (
        <p className="mt-2">
          Thanks, your request is in. The clinic will call you to find a time that suits you. You can also call us
          at <a href={`tel:${CLINIC_PHONE}`} className="font-semibold underline">{CLINIC_PHONE}</a>.
        </p>
      ) : (
        <>
          <p className="mt-2">
            Please come in to go over this result together, whenever you can. There’s no need to prepare
            anything, and you’re welcome to bring someone with you.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <button
              type="button"
              onClick={() => dispatch({ type: "requestAppointment", id: result.id })}
              className="rounded-md bg-scrub px-5 py-2.5 font-semibold text-white hover:bg-scrub-deep"
            >
              Request an appointment
            </button>
            <p>
              or call <a href={`tel:${CLINIC_PHONE}`} className="font-semibold underline">{CLINIC_PHONE}</a>
            </p>
          </div>
        </>
      )}
    </section>
  );
}
