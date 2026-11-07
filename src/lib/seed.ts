import { ASSAYS } from "./assays";
import type { DiagnosticResult, MicroscopyImage, PatientExplanation, Person } from "./types";

// All people and results below are fictional demo data.

export const CENTRE = "Demo Health Centre";

export const DOCTOR: Person = {
  id: "dr-okafor",
  name: "Dr. Amara Okafor",
  detail: "Oncology",
};

/** Lab staff. In the prototype you play both lab roles. */
export const TECHNOLOGIST: Person = {
  id: "lab-chen",
  name: "Lee Chen",
  detail: "Medical laboratory technologist",
};

export const PATHOLOGIST: Person = {
  id: "lab-sato",
  name: "Dr. Hana Sato",
  detail: "Pathologist",
};

export const CLINIC_PHONE = "555-0142";

/** The patient you play as when you switch to the patient view. */
export const CURRENT_PATIENT_ID = "p-rivera";

export const PATIENTS: Person[] = [
  { id: "p-rivera", name: "Sam Rivera", detail: "34 years" },
  { id: "p-lee", name: "Jordan Lee", detail: "52 years" },
  { id: "p-nair", name: "Priya Nair", detail: "47 years" },
  { id: "p-silva", name: "Mateo Silva", detail: "61 years" },
  { id: "p-mensah", name: "Ada Mensah", detail: "58 years" },
  { id: "p-kim", name: "Noah Kim", detail: "29 years" },
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
 * A capture straight off the microscope, waiting in the lab's scoring queue.
 * Values are the scoring software's pre-counts for the technologist to check.
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
    assayKey: assay.key,
    source: "simulated",
    title: assay.title,
    method: assay.method,
    specimen: assay.specimen,
    collectedAt: opts.collectedAt,
    capturedAt: opts.capturedAt,
    labStage: "scoring",
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

/**
 * A capture uploaded from the real microscope camera. Values start blank:
 * there's no counting software, so the technologist enters what they count.
 */
export function uploadedCapture(opts: {
  id: string;
  assay: string;
  patientId: string;
  collectedAt: string;
  images: MicroscopyImage[];
}): DiagnosticResult {
  const assay = ASSAYS[opts.assay];
  return {
    ...EMPTY_EXPLANATION,
    id: opts.id,
    patientId: opts.patientId,
    assayKey: assay.key,
    source: "upload",
    title: assay.title,
    method: assay.method,
    specimen: assay.specimen,
    collectedAt: opts.collectedAt,
    capturedAt: new Date().toISOString(),
    labStage: "scoring",
    labInterpretation: "",
    flag: "negative",
    values: assay.outcomes[0].values.map((v) => ({ ...v, value: "", flag: "normal" })),
    probes: assay.probes,
    images: opts.images,
    concern: "none",
    messages: [],
  };
}

/** Scored by the technologist, waiting for the pathologist. */
function scored(capture: DiagnosticResult, scoredAt: string): DiagnosticResult {
  return { ...capture, labStage: "signout", scoredAt, scoredBy: TECHNOLOGIST.name };
}

/** Signed out by the pathologist and released to the doctor. */
function released(capture: DiagnosticResult, scoredAt: string, signedOutAt: string): DiagnosticResult {
  return {
    ...scored(capture, scoredAt),
    labStage: "released",
    signedOutAt,
    signedOutBy: PATHOLOGIST.name,
  };
}

/** Released by the lab, then reviewed and shared by the doctor. */
function shared(
  capture: DiagnosticResult,
  sharedAt: string,
  extra: Partial<DiagnosticResult> = {},
): DiagnosticResult {
  // Lab work happens between capture and sharing; place it in that window.
  const span = new Date(sharedAt).getTime() - new Date(capture.capturedAt).getTime();
  const at = (f: number) => new Date(new Date(capture.capturedAt).getTime() + span * f).toISOString();
  return { ...released(capture, at(0.3), at(0.7)), ...capture.suggested!, sharedAt, ...extra };
}

/** Tests that fit each demo patient's story, used by the capture simulator. */
const PATIENT_ASSAYS: Record<string, string[]> = {
  "p-rivera": ["uro", "lym", "mel"],
  "p-lee": ["alk", "ros1"],
  "p-nair": ["her2", "sln"],
  "p-silva": ["bcr"],
  "p-mensah": ["her2", "sln"],
  "p-kim": ["lym"],
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
    // At the lab: waiting to be scored
    newCapture({ id: "c-mensah", assay: "her2", patientId: "p-mensah", collectedAt: ago(2), capturedAt: ago(0, 2) }),
    // At the lab: scored, waiting for the pathologist
    scored(newCapture({ id: "c-kim", assay: "lym", patientId: "p-kim", collectedAt: ago(4), capturedAt: ago(1) }), ago(0, 6)),

    // Released by the lab, waiting for the doctor's review
    released(
      newCapture({ id: "c-ros1", assay: "ros1", patientId: "p-lee", collectedAt: ago(6), capturedAt: ago(2) }),
      ago(1, 6),
      ago(0, 1),
    ),
    released(
      newCapture({ id: "c-sln", assay: "sln", patientId: "p-nair", collectedAt: ago(3), capturedAt: ago(1, 12) }),
      ago(1),
      ago(0, 3),
    ),

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
