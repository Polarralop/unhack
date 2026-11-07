"use client";

import { createContext, useContext, useEffect, useReducer } from "react";
import { PATHOLOGIST, seedResults, simulateCapture, TECHNOLOGIST } from "./seed";
import type { DiagnosticResult, Flag, PatientExplanation, ResultValue, Role } from "./types";

const STORAGE_KEY = "unhack-demo-v4";

type Action =
  | { type: "load"; results: DiagnosticResult[] }
  | { type: "view"; id: string }
  | { type: "answerCheck"; id: string; correct: boolean }
  | { type: "acknowledge"; id: string }
  | { type: "message"; id: string; from: Role; body: string }
  | { type: "resolve"; id: string }
  | { type: "capture" }
  | { type: "addCapture"; result: DiagnosticResult }
  | { type: "submitScore"; id: string; values: ResultValue[]; flag: Flag; interpretation: string }
  | { type: "signOut"; id: string; flag: Flag; interpretation: string }
  | { type: "sendBack"; id: string; note: string }
  | {
      type: "share";
      id: string;
      details: Pick<DiagnosticResult, "method" | "specimen" | "flag"> & PatientExplanation;
    }
  | { type: "requestAppointment"; id: string }
  | { type: "bookAppointment"; id: string }
  | { type: "reset" };

function now() {
  return new Date().toISOString();
}

function update(
  results: DiagnosticResult[],
  id: string,
  fn: (r: DiagnosticResult) => DiagnosticResult,
) {
  return results.map((r) => (r.id === id ? fn(r) : r));
}

/** `null` until the stored demo data has been loaded in the browser. */
type State = DiagnosticResult[] | null;

function reducer(state: State, action: Action): State {
  if (action.type === "load") return action.results;
  if (state === null) return state;
  switch (action.type) {
    case "view":
      return update(state, action.id, (r) => (r.viewedAt ? r : { ...r, viewedAt: now() }));
    case "answerCheck":
      // Only the first answer is recorded — that's the honest comprehension signal.
      return update(state, action.id, (r) =>
        r.checkCorrect === undefined ? { ...r, checkCorrect: action.correct } : r,
      );
    case "acknowledge":
      return update(state, action.id, (r) => ({ ...r, acknowledgedAt: r.acknowledgedAt ?? now() }));
    case "message":
      return update(state, action.id, (r) => ({
        ...r,
        concern: action.from === "patient" ? "open" : r.concern,
        messages: [
          ...r.messages,
          { id: crypto.randomUUID(), from: action.from, body: action.body, at: now() },
        ],
      }));
    case "resolve":
      return update(state, action.id, (r) => ({ ...r, concern: "resolved" }));
    case "capture":
      return [simulateCapture(), ...state];
    case "addCapture":
      return [action.result, ...state];
    case "submitScore":
      return update(state, action.id, (r) => ({
        ...r,
        labStage: "signout",
        values: action.values,
        flag: action.flag,
        labInterpretation: action.interpretation,
        scoredAt: now(),
        scoredBy: TECHNOLOGIST.name,
        returnNote: undefined,
      }));
    case "signOut":
      return update(state, action.id, (r) => ({
        ...r,
        labStage: "released",
        flag: action.flag,
        labInterpretation: action.interpretation,
        signedOutAt: now(),
        signedOutBy: PATHOLOGIST.name,
      }));
    case "sendBack":
      return update(state, action.id, (r) => ({ ...r, labStage: "scoring", returnNote: action.note }));
    case "share":
      return update(state, action.id, (r) => ({ ...r, ...action.details, sharedAt: now() }));
    case "requestAppointment":
      return update(state, action.id, (r) => ({ ...r, appointmentRequestedAt: r.appointmentRequestedAt ?? now() }));
    case "bookAppointment":
      return update(state, action.id, (r) => ({ ...r, appointmentBookedAt: r.appointmentBookedAt ?? now() }));
    case "reset":
      return seedResults();
  }
}

interface Store {
  results: DiagnosticResult[];
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<Store | null>(null);

/**
 * Prototype-only store: all state lives in the browser (localStorage).
 * Children render only after mount so dates and stored state never
 * mismatch between server and client.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [results, dispatch] = useReducer(reducer, null);

  useEffect(() => {
    let loaded: DiagnosticResult[] | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) loaded = JSON.parse(raw);
    } catch {
      loaded = null;
    }
    dispatch({ type: "load", results: loaded ?? seedResults() });
  }, []);

  useEffect(() => {
    if (results === null) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch {
      // Storage unavailable (private mode etc.) — the demo still works in memory.
    }
  }, [results]);

  if (results === null) return null;
  return <StoreContext.Provider value={{ results, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside StoreProvider");
  return store;
}

export function useResult(id: string) {
  const { results } = useStore();
  return results.find((r) => r.id === id);
}
