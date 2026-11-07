# unhack

A results hub for **fluorescence microscopy** tests used to detect and monitor cancer, such as FISH (fluorescence in situ hybridization) on biopsies, bone marrow, blood and urine. Doctors share each result with patients and make sure it is **received**, **understood**, and that patient **concerns get addressed**.

> **Status:** early prototype. Everything runs on mock data. Do not enter real patient information.

## The core loop

1. **Microscope captures the sample** (hardware, simulated here). Images, lab findings and the lab's interpretation land in the doctor's **From the microscope** feed.
2. **Doctor reviews and shares**: checks the images and findings, edits the suggested plain-language explanation, next steps and comprehension check, and shares it with the patient.
3. **Patient reviews the result**: plain-language summary, what it means, next steps, the microscopy images (expand or download) and the lab's detailed findings.
4. **Patient confirms understanding, asks questions, and comes in when needed.** Results that may mean a new or changed cancer diagnosis are worded gently, never explicitly, and ask the patient to come in, with a **Request an appointment** button.
5. **Doctor follows up**: sees unopened results, misunderstandings, open questions and appointment requests, and closes the loop.

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

Open the home page and pick **Doctor view** or **Patient view**; the switch in the top bar flips between them at any time. You play as **Dr. Amara Okafor** (doctor) and **Sam Rivera** (patient). Every action is saved in your browser's localStorage; use **Reset demo data** in the footer to start over.

### A two-minute demo

1. **Doctor view**: click **Simulate a microscope capture**, open a capture from **From the microscope**, expand an image, adjust the suggested wording and **Share** it.
2. **Patient view**: open the new *Urine cell test (FISH)*. Note the "would like to see you" request, then **Request an appointment**, look at the images, answer the check question and ask a question.
3. **Doctor view**: the appointment request and question show up under **Needs your follow-up**. Reply, **Mark question answered**, and **Mark visit booked**.

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
    doctor/page.tsx               Dashboard: microscope feed, needs follow-up, shared results
    doctor/review/[id]/           Review a capture and share it with the patient
    doctor/results/[id]/          One shared result: status, images, lab findings, questions
    patient/page.tsx              Patient's results inbox
    patient/results/[id]/         Read, come-in request, images, check, confirm, ask a question
  components/                     Journey, ImageGallery (preview + download), ComeInCallout, Thread, ValuesTable, badges
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
