# Product brief — prototype

## Problem

Diagnostic results often reach patients as raw reports or not at all. Doctors have no reliable signal that a patient saw a result, understood it, or has unanswered worries.

## Users

- **Doctor / clinician** — publishes results, tracks their status, answers concerns.
- **Patient** — receives results, reads a plain-language explanation, confirms understanding, asks questions.

## Prototype goals

A clickable prototype on mock data that demonstrates the full loop:

- Doctor dashboard: list of shared results with status (sent → viewed → acknowledged → concern open/resolved).
- Doctor: compose/share a result with a plain-language summary and next steps.
- Patient inbox: list of results, unread badge.
- Patient result view: summary, detail, "I understand" acknowledgement, optional comprehension check.
- Concern thread per result between patient and doctor.
- Role switcher so one person can click through both sides.

## Out of scope for the prototype

Real authentication, persistence, EHR/HL7/FHIR integration, notifications (email/SMS), compliance hardening, multi-clinic tenancy.

## Result status model (draft)

`sent` → `viewed` → `acknowledged`, with an independent concern state: `none` | `open` | `resolved`.

## Open questions

- Should urgent/abnormal results require a call before release?
- What counts as "understood" — a checkbox, a quiz, or teach-back?
- Can patients share results with caregivers/family?
- Target jurisdiction(s) for compliance?
