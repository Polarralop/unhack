# Product brief — prototype

## Focus

A test hub for **fluorescence microscopy** results used to catch and monitor cancer. In practice this is mostly FISH (fluorescence in situ hybridization), plus immunofluorescence and fluorescence cytology. Example tests:

| Test | Specimen | What it tells the care team |
| --- | --- | --- |
| HER2 FISH | Breast tumour biopsy | Whether HER2-targeted treatment is likely to work |
| ALK break-apart FISH | Lung tumour biopsy | Whether ALK-blocking pills are an option |
| Urine FISH (UroVysion-type) | Urine | Whether cells show changes linked to bladder cancer |
| Lymphoma panel (BCL2 / BCL6 / MYC) | Lymph node biopsy | Whether gene changes linked to lymphoma are present |
| Melanoma FISH | Skin biopsy | Whether an unclear mole has melanoma-type changes |
| BCR-ABL1 FISH | Bone marrow / blood | Whether chronic myeloid leukemia is under control |

These results are high-stakes and easy to misread: "positive" can be good news (HER2-positive means targeted treatment works), and a positive screening test is not a diagnosis. That's why comprehension checks and an easy way to ask questions matter here.

## Problem

Diagnostic results often reach patients as raw reports or not at all. Doctors have no reliable signal that a patient saw a result, understood it, or has unanswered worries.

## Users

- **Lab technologist**: checks the scoring software's counts against the images and records findings.
- **Pathologist**: reviews the scoring and signs out the report, or sends it back.
- **Doctor / clinician** — publishes results, tracks their status, answers concerns.
- **Patient** — receives results, reads a plain-language explanation, confirms understanding, asks questions.

## Prototype features

1. **Testing via the microscope.** Hardware side, out of scope for this app; simulated by a "Simulate a microscope capture" button.
2. **Lab review in the platform.** Each capture lands in the lab's scoring queue. A technologist scores it, then a pathologist signs it out (or sends it back). Lab review happens inside the platform rather than as an external hand-off, while responsibility stays with the lab. Images are never edited.
3. **Doctor reviews and shares.** Signed-out results land in the doctor's "Ready for your review" feed. The doctor checks the images and the signed report, edits suggested patient wording, next steps and an optional comprehension check, and shares the result.
4. **Patient reviews and responds.** The patient sees a plain-language summary, what it means, next steps, the microscopy images (expandable preview + download) and detailed findings. They confirm they understand and can ask questions.

### Results that may mean cancer

The patient page is never explicit about a cancer diagnosis. When the doctor ticks "Ask the patient to come in", the patient sees a calm "Dr. Okafor would like to see you" request, whenever they can, with a **Request an appointment** button and the clinic's phone number. The doctor's dashboard flags appointment requests, and patients who were asked to come in but haven't requested a visit.

## Out of scope for the prototype

Real microscope integration, real authentication, persistence, EHR/HL7/FHIR integration, notifications (email/SMS), compliance hardening, multi-clinic tenancy.

## Result status model (draft)

Lab: `scoring` → `signout` → `released` (a pathologist can send a capture back to `scoring`). Then: `shared` → `opened` → `understood`. Separate from that: concern state `none` | `open` | `resolved`, and for come-in results, appointment `requested` → `booked`.

## Open questions

- Decided: FISH, immunofluorescence and fluorescence cytology are all offered.
- Decided: results include the microscopy images, with an expandable preview and download.
- Decided: possible cancer diagnoses are non-explicit and ask the patient to come in.
- Decided: lab review lives in the platform as its own role (technologist scores, pathologist signs out). The doctor communicates but doesn't make the primary reading. Images aren't edited.
- Setting: a hospital or health centre where the lab and clinicians share one system.
- Decided (prototype): technologists upload images from the microscope camera (JPEG/PNG/TIFF), stored in the browser only, on a single demo machine. Lab has separate technologist and pathologist views.
- Later: per-channel images combined into a colour composite; automatic pickup from the camera's save folder; shared storage across devices.
- Should the doctor be able to send a question back to the lab about a signed-out report?
- What image format will the real microscope produce (TIFF / OME-TIFF), and do patients download the original or a web-friendly copy?
- Should the clinic book appointments in-app, or keep the "we'll call you" request?

- What counts as "understood" — a checkbox, a quiz, or teach-back?
- Can patients share results with caregivers/family?
- Target jurisdiction(s) for compliance?
