# unhack

A results hub for **fluorescence microscopy** tests used to detect and monitor cancer, such as FISH (fluorescence in situ hybridization) on biopsies, bone marrow, blood and urine. Doctors share each result with patients and make sure it is **received**, **understood**, and that patient **concerns get addressed**.

> **Status:** early prototype. Everything runs on mock data. Do not enter real patient information.

## The core loop

Built for a hospital or health centre where the lab, the ordering doctor and the patient all use one system.

1. **Microscope captures the sample** (hardware, simulated here). The capture lands in the **lab's scoring queue**. Images are stored exactly as captured and can't be edited.
2. **Lab scores and signs out**: a technologist checks the scoring software's pre-counts against the images and records the findings; a pathologist reviews them and signs out the report (or sends it back for re-scoring). Only signed-out results reach the doctor.
3. **Doctor reviews and shares**: checks the images and signed report, edits the suggested plain-language explanation, next steps and comprehension check, and shares it with the patient.
4. **Patient reviews the result**: plain-language summary, what it means, next steps, the microscopy images (expand or download) and the lab's detailed findings.
5. **Patient confirms understanding, asks questions, and comes in when needed.** Results that may mean a new or changed cancer diagnosis are worded gently, never explicitly, and ask the patient to come in, with a **Request an appointment** button.
6. **Doctor follows up**: sees unopened results, misunderstandings, open questions and appointment requests, and closes the loop.

See [docs/product-brief.md](docs/product-brief.md) for scope and open questions.

## Stack (prototype)

| Concern    | Choice                              |
| ---------- | ----------------------------------- |
| Framework  | Next.js 16 (App Router) + TypeScript |
| Styling    | Tailwind CSS 4, Atkinson Hyperlegible Next |
| Data       | Mock data in browser localStorage (no backend yet) |
| Runtime    | Node 24 (see `.nvmrc`)              |

## Getting started

```bash
nvm use        # Node 24
npm install
npm run dev    # http://localhost:3000
```

Open the home page and pick **Lab**, **Doctor** or **Patient**; the switch in the top bar flips between them at any time. You play as **Lee Chen** (technologist) and **Dr. Hana Sato** (pathologist) in the lab, **Dr. Amara Okafor** (doctor) and **Sam Rivera** (patient). Every action is saved in your browser's localStorage; use **Reset demo data** in the footer to start over.

### A two-minute demo

1. **Lab**: click **Simulate a microscope capture**, open it under **To score**, check the pre-counted values and **Send for sign-out**. Then open it under **Ready for sign-out** and **Sign out and release**.
2. **Doctor**: open the result under **Ready for your review**, expand an image, adjust the suggested wording and **Share** it.
3. **Patient**: open the new *Urine cell test (FISH)*. Note the "would like to see you" request, then **Request an appointment**, look at the images, answer the check question and ask a question.
4. **Doctor**: the appointment request and question show up under **Needs your follow-up**. Reply, **Mark question answered**, and **Mark visit booked**.

### Scripts

| Command         | What it does               |
| --------------- | -------------------------- |
| `npm run dev`   | Dev server with hot reload |
| `npm run build` | Production build           |
| `npm run lint`  | ESLint                     |
| `npm run images` | Regenerate the synthetic microscopy images in `public/demo-images/` |

## Project layout

```
src/
  app/
    page.tsx                      Home: pick a view
    lab/page.tsx                  Lab queues: to score, ready for sign-out, recently released
    lab/[id]/                     Score a capture (technologist) or sign it out (pathologist)
    doctor/page.tsx               Dashboard: ready for review, needs follow-up, shared results
    doctor/review/[id]/           Review a signed-out result and share it with the patient
    doctor/results/[id]/          One shared result: status, images, lab findings, questions
    patient/page.tsx              Patient's results inbox
    patient/results/[id]/         Read, come-in request, images, check, confirm, ask a question
  components/                     Journey, LabTrail, ImageGallery (preview + download), ComeInCallout, Thread, ValuesTable, badges
  lib/
    types.ts                      Data model
    assays.ts                     Fluorescence assay catalogue: probes, images, outcomes, suggested wording
    seed.ts                       Fictional demo patients, results, and the capture simulator
    store.tsx                     Client-side state (useReducer + localStorage)
scripts/generate-demo-images.mjs  Draws the synthetic fluorescence images (SVG)
public/demo-images/               Generated images (not real patient data)
```

## Data & privacy

This project will eventually handle protected health information (PHI). From day one:

- Never commit real patient data, credentials or `.env` files.
- Use only synthetic/mock data in fixtures, screenshots and demos.
- Compliance requirements (HIPAA / PHIPA / PIPEDA, depending on deployment) will be scoped before any real data is handled.
