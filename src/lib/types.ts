export type Role = "doctor" | "patient";

/**
 * Whether the test found what it was looking for (e.g. a gene change).
 * "positive" is not always bad news for the patient: a positive HER2 result
 * opens up targeted treatment. Copy on each result explains what it means.
 */
export type Flag = "negative" | "positive";

export type ValueFlag = "normal" | "abnormal";

export interface Person {
  id: string;
  name: string;
  /** Short line shown under the name, e.g. age or clinic. */
  detail: string;
}

export interface ResultValue {
  name: string;
  value: string;
  unit: string;
  /** The cutoff the lab uses, e.g. "under 2.0". */
  range: string;
  flag: ValueFlag;
}

export interface ProbeChannel {
  /** What the colour marks, e.g. "HER2 gene". */
  name: string;
  /** CSS colour of the swatch. */
  color: string;
}

export interface MicroscopyImage {
  id: string;
  /** Path under /public. */
  src: string;
  /** e.g. "Overview, 40×" */
  caption: string;
  magnification: string;
}

export interface ComprehensionCheck {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/** The patient-facing part of a result, written (or approved) by the doctor. */
export interface PatientExplanation {
  /** One or two plain-language sentences: what the result says. */
  summary: string;
  /** What it means for the patient. */
  meaning: string;
  nextSteps: string[];
  check?: ComprehensionCheck;
  /**
   * The result may mean a new or changed cancer diagnosis. The patient page
   * stays non-explicit and asks them to come in to talk it through.
   */
  discussInPerson: boolean;
}

export interface Message {
  id: string;
  from: Role;
  body: string;
  at: string;
}

export type ConcernState = "none" | "open" | "resolved";

export interface DiagnosticResult extends PatientExplanation {
  id: string;
  patientId: string;
  title: string;
  /** Fluorescence microscopy method, e.g. "FISH" or "Immunofluorescence". */
  method: string;
  /** What was tested, e.g. "Breast tissue biopsy". */
  specimen: string;
  collectedAt: string;
  /** When the microscope captured the images. */
  capturedAt: string;
  /** The lab's technical interpretation. Shown to the doctor only. */
  labInterpretation: string;
  flag: Flag;
  values: ResultValue[];
  probes: ProbeChannel[];
  images: MicroscopyImage[];
  /** Suggested patient wording, offered to the doctor during review. */
  suggested?: PatientExplanation;
  /** Unset while the result is waiting for the doctor's review. */
  sharedAt?: string;
  viewedAt?: string;
  acknowledgedAt?: string;
  /** Whether the patient's first answer to the check was right. */
  checkCorrect?: boolean;
  appointmentRequestedAt?: string;
  appointmentBookedAt?: string;
  concern: ConcernState;
  messages: Message[];
}

export type SharedResult = DiagnosticResult & { sharedAt: string };

export function isShared(r: DiagnosticResult): r is SharedResult {
  return r.sharedAt !== undefined;
}

export type Stage = "shared" | "opened" | "understood";

export function stageOf(r: DiagnosticResult): Stage {
  if (r.acknowledgedAt) return "understood";
  if (r.viewedAt) return "opened";
  return "shared";
}
