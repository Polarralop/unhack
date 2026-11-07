import { ASSAYS } from "./assays";
import type { DiagnosticResult, PatientExplanation, Person } from "./types";

// All people and results below are fictional demo data.

export const DOCTOR: Person = {
  id: "dr-okafor",
  name: "Dr. Amara Okafor",
  detail: "Oncology · Demo Cancer Centre",
};

export const CLINIC_PHONE = "555-0142";

/** The patient you play as when you switch to the patient view. */
export const CURRENT_PATIENT_ID = "p-rivera";

export const PATIENTS: Person[] = [
  { id: "p-rivera", name: "Sam Rivera", detail: "34 years" },
  { id: "p-lee", name: "Jordan Lee", detail: "52 years" },
  { id: "p-nair", name: "Priya Nair", detail: "47 years" },
  { id: "p-silva", name: "Mateo Silva", detail: "61 years" },
];

function ago(days: number, hours = 0): string {
  return new Date(Date.now() - (days * 24 + hours) * 3600_000).toISOString();
}

const EMPTY_EXPLANATION: PatientExplanation = {
  summary: "",
  meaning: "",
  nextSteps: [],
  discussInPerson: false,
};

/**
 * A capture straight off the microscope: lab findings and images, waiting
 * for the doctor to review and write the patient explanation.
 */
export function newCapture(opts: {
  id: string;
  assay: string;
  patientId: string;
  collectedAt: string;
  capturedAt: string;
  outcome?: number;
}): DiagnosticResult {
  const assay = ASSAYS[opts.assay];
  const outcome = assay.outcomes[opts.outcome ?? 0];
  return {
    ...EMPTY_EXPLANATION,
    id: opts.id,
    patientId: opts.patientId,
    title: assay.title,
    method: assay.method,
    specimen: assay.specimen,
    collectedAt: opts.collectedAt,
    capturedAt: opts.capturedAt,
    labInterpretation: outcome.labInterpretation,
    flag: outcome.flag,
    values: outcome.values,
    probes: assay.probes,
    images: assay.images.map((img, i) => ({ ...img, id: `${opts.id}-img${i + 1}` })),
    suggested: outcome.suggested,
    concern: "none",
    messages: [],
  };
}

/** A capture that the doctor has already reviewed and shared. */
function shared(
  capture: DiagnosticResult,
  sharedAt: string,
  extra: Partial<DiagnosticResult> = {},
): DiagnosticResult {
  return { ...capture, ...capture.suggested!, sharedAt, ...extra };
}

/** Tests that fit each demo patient's story, used by the capture simulator. */
const PATIENT_ASSAYS: Record<string, string[]> = {
  "p-rivera": ["uro", "lym", "mel"],
  "p-lee": ["alk", "ros1"],
  "p-nair": ["her2", "sln"],
  "p-silva": ["bcr"],
};

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Pretend the microscope just finished imaging a sample. */
export function simulateCapture(): DiagnosticResult {
  const patient = pick(PATIENTS);
  const assay = pick(PATIENT_ASSAYS[patient.id]);
  return newCapture({
    id: `c-${crypto.randomUUID().slice(0, 8)}`,
    assay,
    patientId: patient.id,
    collectedAt: ago(2),
    capturedAt: new Date().toISOString(),
  });
}

export function seedResults(): DiagnosticResult[] {
  return [
    // Waiting for review: fresh off the microscope
    newCapture({ id: "c-ros1", assay: "ros1", patientId: "p-lee", collectedAt: ago(6), capturedAt: ago(0, 1) }),
    newCapture({ id: "c-sln", assay: "sln", patientId: "p-nair", collectedAt: ago(3), capturedAt: ago(0, 3) }),

    // Shared with patients
    shared(newCapture({ id: "r-uro", assay: "uro", patientId: "p-rivera", collectedAt: ago(4), capturedAt: ago(1) }), ago(0, 5)),
    shared(
      newCapture({ id: "r-lym", assay: "lym", patientId: "p-rivera", collectedAt: ago(12), capturedAt: ago(8) }),
      ago(7),
      { viewedAt: ago(6) },
    ),
    shared(
      newCapture({ id: "r-mel", assay: "mel", patientId: "p-rivera", collectedAt: ago(45), capturedAt: ago(41) }),
      ago(40),
      {
        viewedAt: ago(40),
        acknowledgedAt: ago(39),
        concern: "resolved",
        messages: [
          { id: "m1", from: "patient", body: "Does this mean I don’t need to worry about my other moles?", at: ago(39, 2) },
          {
            id: "m2",
            from: "doctor",
            body: "This result is only about the mole we removed. Keep doing monthly skin checks, and because you have a lot of moles, a yearly skin exam with a dermatologist is a good idea. I’ll send the referral.",
            at: ago(38),
          },
        ],
      },
    ),
    shared(
      newCapture({ id: "r-her2", assay: "her2", patientId: "p-nair", collectedAt: ago(8), capturedAt: ago(4) }),
      ago(3),
      {
        viewedAt: ago(2),
        checkCorrect: false,
        appointmentRequestedAt: ago(1, 6),
        concern: "open",
        messages: [
          {
            id: "m3",
            from: "patient",
            body: "I looked up HER2 online and now I’m scared. Is this bad news?",
            at: ago(1, 4),
          },
        ],
      },
    ),
    shared(
      newCapture({ id: "r-alk", assay: "alk", patientId: "p-lee", collectedAt: ago(14), capturedAt: ago(11) }),
      ago(10),
      {
        viewedAt: ago(10),
        acknowledgedAt: ago(9),
        appointmentRequestedAt: ago(9),
        appointmentBookedAt: ago(8),
      },
    ),
    shared(newCapture({ id: "r-bcr", assay: "bcr", patientId: "p-silva", collectedAt: ago(9), capturedAt: ago(6) }), ago(5)),
  ];
}
