import type { LearningPath } from "./types";
export const learningPaths: LearningPath[] = [
  {
    id: "first-mlr",
    title: "Your First MLR Review",
    description: "From the initial claim to a review-ready submission.",
    minutes: 8,
    terms: ["mlr", "pi", "isi", "sop", "opdp"],
    category: "START HERE",
  },
  {
    id: "market-access",
    title: "Understanding Market Access",
    description: "Connect coverage, affordability, and the patient journey.",
    minutes: 10,
    terms: ["pbm", "pa", "st", "oop", "pap", "heor"],
    category: "THE ACCESS PICTURE",
  },
  {
    id: "dashboard",
    title: "Reading a Campaign Dashboard",
    description: "Find the signal behind the numbers.",
    minutes: 7,
    terms: ["kpi", "ctr", "cpc", "cpm", "cpa"],
    category: "MEASUREMENT THAT MATTERS",
  },
  {
    id: "product-launch",
    title: "Preparing for a Product Launch",
    description: "Understand the milestones. Anticipate the dependencies.",
    minutes: 9,
    terms: ["nda", "bla", "pi", "sow", "raci", "wbs"],
    category: "READY FOR WHAT’S NEXT",
  },
];
