export const categories = [
  "Review and Compliance",
  "Audience and Brand Strategy",
  "Channels and Engagement",
  "Market Access",
  "Measurement and Analytics",
  "Launch and Agency Business",
] as const;
export type Category = (typeof categories)[number];
export interface AlternateMeaning {
  phrase: string;
  context: string;
  definition: string;
  sourceName?: string;
  sourceUrl?: string;
}
export interface Term {
  id: string;
  acronym: string;
  expandedPhrase: string;
  definition: string;
  whyItMatters: string;
  meetingExample: string;
  accountAction: string;
  category: Category;
  relatedTerms: string[];
  alternateMeanings: AlternateMeaning[];
  sourceName: string;
  sourceUrl: string;
  sourceType: "authoritative" | "agency usage" | "industry reference";
  lastReviewed: string;
  status: "draft" | "in review" | "published";
  clientNote?: string;
}
export interface Suggestion {
  id: string;
  acronym: string;
  expandedPhrase: string;
  definition: string;
  category: Category;
  meetingExample: string;
  whyItMatters: string;
  source: string;
  clientContext: string;
  submittedAt: string;
  status: "submitted";
}
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  minutes: number;
  terms: string[];
  category: string;
}
