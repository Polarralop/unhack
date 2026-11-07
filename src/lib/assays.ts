import type { Flag, MicroscopyImage, PatientExplanation, ProbeChannel, ResultValue, ValueRule } from "./types";

// Catalogue of fluorescence microscopy assays the simulated microscope can
// produce. Cutoffs are modelled on real FISH assays but simplified for the
// prototype and must not be used clinically. Images are synthetic.

export interface AssayOutcome {
  flag: Flag;
  /** What the microscope's scoring software pre-counts; the technologist checks these. */
  values: ResultValue[];
  labInterpretation: string;
  suggested: PatientExplanation;
}

export interface Assay {
  key: string;
  title: string;
  method: string;
  specimen: string;
  probes: ProbeChannel[];
  images: Omit<MicroscopyImage, "id">[];
  outcomes: AssayOutcome[];
}

const FOUND: ValueRule = { kind: "equals", normal: "Not found", options: ["Not found", "Found"] };
const SEEN: ValueRule = { kind: "equals", normal: "None seen", options: ["None seen", "Seen"] };

const NUCLEUS: ProbeChannel = { name: "Cell nucleus (DAPI)", color: "#3a52d0" };
const RED = "#ff4a4a";
const GREEN = "#47ff7e";
const AQUA = "#45e3ff";
const GOLD = "#ffcf3d";
const YELLOW = "#fff35a";

function images(key: string, low = "40×", high = "100×"): Omit<MicroscopyImage, "id">[] {
  return [
    { src: `/demo-images/${key}-1.svg`, caption: `Overview of the sample`, magnification: low },
    { src: `/demo-images/${key}-2.svg`, caption: `Close-up of individual cells`, magnification: high },
  ];
}

const comeIn = "Please come in at whatever time works for you. Use the button on this page or call the clinic.";

export const ASSAYS: Record<string, Assay> = {
  her2: {
    key: "her2",
    title: "HER2 test on breast biopsy (FISH)",
    method: "FISH",
    specimen: "Breast tissue biopsy",
    probes: [NUCLEUS, { name: "HER2 gene", color: RED }, { name: "Chromosome 17 marker", color: GREEN }],
    images: images("her2"),
    outcomes: [
      {
        flag: "positive",
        values: [
          { name: "HER2 to chromosome 17 ratio", value: "2.6", unit: "ratio", range: "under 2.0", rule: { kind: "below", limit: 2.0 }, flag: "abnormal" },
          { name: "Average HER2 copies per cell", value: "7.1", unit: "copies", range: "under 4.0", rule: { kind: "below", limit: 4.0 }, flag: "abnormal" },
          { name: "Cells counted", value: "40", unit: "cells", range: "", flag: "normal" },
        ],
        labInterpretation:
          "HER2 AMPLIFIED. HER2/CEP17 ratio 2.6, mean HER2 copy number 7.1 per cell (40 nuclei scored, 2 observers). ASCO/CAP group 1.",
        suggested: {
          summary: "Your biopsy results are back, and they give us important information for planning your care.",
          meaning:
            "There are treatment options that fit this result well. Dr. Okafor would like to go over it with you in person so there’s time for all of your questions.",
          nextSteps: [comeIn, "Bring a family member or friend if you’d like support."],
          check: {
            question: "What’s the next step?",
            options: ["Wait until my next routine visit", "Come in to talk about the result and plan my care"],
            correctIndex: 1,
            explanation: "The next step is to come in so we can talk about the result and plan your care together.",
          },
          discussInPerson: true,
        },
      },
    ],
  },
  alk: {
    key: "alk",
    title: "ALK gene test on lung biopsy (FISH)",
    method: "FISH",
    specimen: "Lung tissue biopsy",
    probes: [
      NUCLEUS,
      { name: "ALK gene, start", color: GREEN },
      { name: "ALK gene, end", color: RED },
      { name: "Both together (gene intact)", color: YELLOW },
    ],
    images: images("alk"),
    outcomes: [
      {
        flag: "negative",
        values: [{ name: "Cells with a split ALK signal", value: "4", unit: "% of cells", range: "under 15%", rule: { kind: "below", limit: 15 }, flag: "normal" }],
        labInterpretation: "NEGATIVE for ALK rearrangement. 2 of 50 nuclei (4%) with split signals; cutoff 15%.",
        suggested: {
          summary: "This test looked for a specific gene change in your biopsy and didn’t find it.",
          meaning:
            "This helps narrow down which treatments will work best for you. Dr. Okafor will go over it together with your other results in person.",
          nextSteps: [comeIn],
          discussInPerson: true,
        },
      },
    ],
  },
  ros1: {
    key: "ros1",
    title: "ROS1 gene test on lung biopsy (FISH)",
    method: "FISH",
    specimen: "Lung tissue biopsy",
    probes: [
      NUCLEUS,
      { name: "ROS1 gene, start", color: GREEN },
      { name: "ROS1 gene, end", color: RED },
      { name: "Both together (gene intact)", color: YELLOW },
    ],
    images: images("ros1"),
    outcomes: [
      {
        flag: "negative",
        values: [{ name: "Cells with a split ROS1 signal", value: "2", unit: "% of cells", range: "under 15%", rule: { kind: "below", limit: 15 }, flag: "normal" }],
        labInterpretation: "NEGATIVE for ROS1 rearrangement. 1 of 50 nuclei (2%) with split signals; cutoff 15%.",
        suggested: {
          summary: "This test looked for another gene change in your biopsy and didn’t find it.",
          meaning:
            "Together with your other test results, this helps us choose the right treatment for you. We’ll go over everything in person.",
          nextSteps: ["We’ll talk about this result at your next appointment."],
          check: {
            question: "When will you go over this result with your doctor?",
            options: ["At my next appointment", "I won’t, there’s nothing to discuss"],
            correctIndex: 0,
            explanation: "Dr. Okafor will go over it with your other results at your next appointment.",
          },
          discussInPerson: true,
        },
      },
    ],
  },
  uro: {
    key: "uro",
    title: "Urine cell test (FISH)",
    method: "FISH",
    specimen: "Urine",
    probes: [
      NUCLEUS,
      { name: "Chromosome 3", color: RED },
      { name: "Chromosome 7", color: GREEN },
      { name: "Chromosome 17", color: AQUA },
      { name: "9p21 gene region", color: GOLD },
    ],
    images: images("uro"),
    outcomes: [
      {
        flag: "positive",
        values: [
          { name: "Cells with extra chromosome copies (3, 7, 17)", value: "6", unit: "cells", range: "under 4", rule: { kind: "below", limit: 4 }, flag: "abnormal" },
          { name: "Cells missing the 9p21 gene region", value: "2", unit: "cells", range: "under 12", rule: { kind: "below", limit: 12 }, flag: "normal" },
          { name: "Cells looked at", value: "25", unit: "cells", range: "", flag: "normal" },
        ],
        labInterpretation:
          "POSITIVE by UroVysion-type criteria: 6 of 25 cells with gains of ≥2 of chromosomes 3, 7, 17 (cutoff ≥4). 9p21 loss in 2 cells (cutoff ≥12).",
        suggested: {
          summary: "Your urine test found some cells that we’d like to take a closer look at.",
          meaning:
            "This result doesn’t give us an answer on its own. The best next step is to talk it over in person and plan a short follow-up exam of your bladder, called a cystoscopy.",
          nextSteps: [
            comeIn,
            "If you see blood in your urine again before then, let us know.",
            "Bring any questions. We’ll go through everything together.",
          ],
          check: {
            question: "What’s the best next step?",
            options: [
              "Wait for my next yearly check-up",
              "Come in to talk it over and plan a follow-up exam",
              "Nothing, the test was normal",
            ],
            correctIndex: 1,
            explanation: "The best next step is to come in so we can go over the result together and plan a follow-up exam.",
          },
          discussInPerson: true,
        },
      },
    ],
  },
  lym: {
    key: "lym",
    title: "Lymph node gene panel (FISH)",
    method: "FISH",
    specimen: "Lymph node biopsy",
    probes: [NUCLEUS, { name: "Gene, start", color: GREEN }, { name: "Gene, end", color: RED }, { name: "Both together (gene intact)", color: YELLOW }],
    images: images("lym"),
    outcomes: [
      {
        flag: "negative",
        values: [
          { name: "BCL2 gene rearrangement", value: "Not found", unit: "", range: "not found", rule: FOUND, flag: "normal" },
          { name: "BCL6 gene rearrangement", value: "Not found", unit: "", range: "not found", rule: FOUND, flag: "normal" },
          { name: "MYC gene rearrangement", value: "Not found", unit: "", range: "not found", rule: FOUND, flag: "normal" },
        ],
        labInterpretation: "NEGATIVE for BCL2, BCL6 and MYC rearrangement (break-apart probes, 200 nuclei each).",
        suggested: {
          summary: "The test didn’t find any of the gene changes it was looking for.",
          meaning:
            "Together with the other tests on your biopsy, this means the swollen lymph node was most likely reacting to an infection.",
          nextSteps: ["No treatment is needed.", "If the lump is still there or getting bigger in 6 weeks, book a check-up."],
          check: {
            question: "Do you need treatment for this lymph node?",
            options: ["Yes, I need to start treatment", "No, but I should get it checked if it doesn’t go away"],
            correctIndex: 1,
            explanation: "No treatment is needed. Just book a check-up if the lump is still there in 6 weeks.",
          },
          discussInPerson: false,
        },
      },
    ],
  },
  mel: {
    key: "mel",
    title: "Mole biopsy gene test (FISH)",
    method: "FISH",
    specimen: "Skin biopsy",
    probes: [
      NUCLEUS,
      { name: "RREB1 gene", color: RED },
      { name: "MYB gene", color: GOLD },
      { name: "CCND1 gene", color: GREEN },
      { name: "Chromosome 6 marker", color: AQUA },
    ],
    images: images("mel"),
    outcomes: [
      {
        flag: "negative",
        values: [{ name: "Gene changes linked to melanoma", value: "Not found", unit: "", range: "not found", rule: FOUND, flag: "normal" }],
        labInterpretation: "NEGATIVE. Melanoma FISH criteria not met (RREB1, MYB, CCND1, CEP6; 30 nuclei).",
        suggested: {
          summary: "The mole we removed doesn’t have the gene changes we were checking for.",
          meaning: "It is a benign (harmless) mole, and it has been fully removed.",
          nextSteps: ["Check your skin once a month for new or changing spots."],
          discussInPerson: false,
        },
      },
    ],
  },
  bcr: {
    key: "bcr",
    title: "BCR-ABL1 monitoring test (FISH)",
    method: "FISH",
    specimen: "Bone marrow",
    probes: [
      NUCLEUS,
      { name: "BCR gene", color: GREEN },
      { name: "ABL1 gene", color: RED },
      { name: "BCR-ABL1 joined", color: YELLOW },
    ],
    images: images("bcr"),
    outcomes: [
      {
        flag: "positive",
        values: [
          { name: "Cells with BCR-ABL1 fusion", value: "8", unit: "% of cells", range: "under 1%", rule: { kind: "below", limit: 1 }, flag: "abnormal" },
          { name: "Previous result (3 months ago)", value: "0", unit: "% of cells", range: "under 1%", rule: { kind: "below", limit: 1 }, flag: "normal" },
        ],
        labInterpretation: "POSITIVE. BCR-ABL1 dual fusion in 16 of 200 nuclei (8%). Previous: 0/200.",
        suggested: {
          summary: "Your latest monitoring test shows a change from last time.",
          meaning:
            "This is something we want to look at together. There are good options if your treatment needs adjusting.",
          nextSteps: [
            "Please come in within the next two weeks, or sooner if you can. Use the button on this page or call the clinic.",
            "Keep taking your current medicine every day until we talk.",
            "We’ll also do a blood test to double-check this result.",
          ],
          check: {
            question: "What should you do with your medicine until your appointment?",
            options: ["Stop taking it", "Keep taking it every day"],
            correctIndex: 1,
            explanation: "Keep taking it every day. We’ll decide together whether anything needs to change.",
          },
          discussInPerson: true,
        },
      },
    ],
  },
  sln: {
    key: "sln",
    title: "Sentinel lymph node check (immunofluorescence)",
    method: "Immunofluorescence",
    specimen: "Lymph node biopsy",
    probes: [NUCLEUS, { name: "Cytokeratin (marks cells that don’t belong in a lymph node)", color: GREEN }],
    images: images("sln", "20×", "63×"),
    outcomes: [
      {
        flag: "negative",
        values: [{ name: "Cytokeratin-positive cells", value: "None seen", unit: "", range: "none seen", rule: SEEN, flag: "normal" }],
        labInterpretation: "NEGATIVE. No cytokeratin-positive cells identified in 3 levels of the sentinel node.",
        suggested: {
          summary: "No concerning cells were found in the lymph node removed during your surgery.",
          meaning: "This is good news. It means nothing has spread to this lymph node.",
          nextSteps: ["We’ll go over your full surgery results at your follow-up appointment."],
          discussInPerson: false,
        },
      },
    ],
  },
};

/**
 * Suggested patient wording for a result, matched on the lab's final call.
 * Undefined when the catalogue has no wording for that outcome yet.
 */
export function suggestionFor(assayKey: string, flag: Flag): PatientExplanation | undefined {
  return ASSAYS[assayKey]?.outcomes.find((o) => o.flag === flag)?.suggested;
}

/** Methods offered when reviewing a result. */
export const METHODS = ["FISH", "Immunofluorescence", "Fluorescence cytology"];

/** Specimens offered when reviewing a result. */
export const SPECIMENS = [
  "Tissue biopsy",
  "Breast tissue biopsy",
  "Lung tissue biopsy",
  "Lymph node biopsy",
  "Skin biopsy",
  "Bone marrow",
  "Blood",
  "Urine",
];
