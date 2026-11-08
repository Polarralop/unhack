# GlowLab

A results hub for **fluorescence microscopy** tests used to detect and monitor cancer, such as FISH (fluorescence in situ hybridization) on biopsies, bone marrow, blood and urine. Doctors share each result with patients and make sure it is **received**, **understood**, and that patient **concerns get addressed**.

> **Status:** early prototype. Everything runs on mock data. Do not enter real patient information.

## The core loop

Built for a hospital or health centre where the lab, the ordering doctor and the patient all use one system.

1. **Microscope captures the sample.** The technologist uploads the camera's images (JPEG, PNG or TIFF), or simulates a capture, and it lands in the **scoring queue**. Images are stored exactly as captured and can't be edited.
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

Open the home page and pick **Lab**, **Doctor** or **Patient**; the switch in the top bar flips between them at any time. Under **Lab**, a second switch picks **Technologist** (Lee Chen) or **Pathologist** (Dr. Hana Sato). You also play **Dr. Amara Okafor** (doctor) and **Sam Rivera** (patient). Every action is saved in your browser's localStorage; use **Reset demo data** in the footer to start over.

### A two-minute demo

1. **Lab → Technologist**: click **Upload a capture** and add images from the microscope camera (or **Simulate a capture**). Open it under **To score**, enter the values and **Send for sign-out**.
   **Lab → Pathologist**: open it under **Ready for sign-out** and **Sign out and release** (or send it back).
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
    lab/technologist/             Scoring queue, upload a capture (new/), score a case ([id]/)
    lab/pathologist/              Sign-out queue, sign out or send back a case ([id]/)
    doctor/page.tsx               Dashboard: ready for review, needs follow-up, shared results
    doctor/review/[id]/           Review a signed-out result and share it with the patient
    doctor/results/[id]/          One shared result: status, images, lab findings, questions
    patient/page.tsx              Patient's results inbox
    patient/results/[id]/         Read, come-in request, images, check, confirm, ask a question
  components/                     Journey, LabTrail, ImageGallery, MicroscopyImg, lab/ (LabCaseView, CaseCard) (preview + download), ComeInCallout, Thread, ValuesTable, badges
  lib/
    types.ts                      Data model
    assays.ts                     Fluorescence assay catalogue: probes, images, outcomes, suggested wording
    seed.ts                       Fictional demo patients, results, and the capture simulator
    store.tsx                     Client-side state (useReducer + localStorage)
    imageStore.ts                 Uploaded images in IndexedDB (originals + viewable previews, TIFF → PNG)
scripts/generate-demo-images.mjs  Draws the synthetic fluorescence images (SVG)
public/demo-images/               Generated images (not real patient data)
```

## Uploading microscope images

The prototype has no database or server storage. Uploaded images live in the **browser's IndexedDB** on the machine that uploaded them:

- Other browsers and devices won't see uploads. Run the whole demo on one machine.
- **Originals are stored untouched** and are what **Download original** returns. TIFFs get a separate PNG copy for display, since most browsers can't show TIFF.
- Upload one combined colour image per view. Separate per-channel images aren't combined yet.
- **Reset demo data** also deletes uploaded images.
- Use non-patient material (cell lines, control or teaching slides) for demos.

## Data & privacy

This project will eventually handle protected health information (PHI). From day one:

- Never commit real patient data, credentials or `.env` files.
- Use only synthetic/mock data in fixtures, screenshots and demos.
- Compliance requirements (HIPAA / PHIPA / PIPEDA, depending on deployment) will be scoped before any real data is handled.
