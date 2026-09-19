import { describe, it, expect } from "vitest";
import { terms, publishedTerms } from "../src/data/terms";
import { learningPaths } from "../src/data/paths";
import { categories } from "../src/data/types";
import { searchTerms } from "../src/lib/search";
describe("editorial library integrity", () => {
  it("contains 50 unique, complete published entries", () => {
    expect(terms).toHaveLength(50);
    expect(new Set(terms.map((t) => t.id)).size).toBe(50);
    for (const term of terms) {
      expect(term.status).toBe("published");
      for (const field of [
        "acronym",
        "expandedPhrase",
        "definition",
        "whyItMatters",
        "meetingExample",
        "accountAction",
        "sourceName",
        "sourceUrl",
        "lastReviewed",
      ] as const)
        expect(term[field].length).toBeGreaterThan(0);
      expect(categories).toContain(term.category);
      expect(
        term.sourceUrl.startsWith("https://") ||
          term.sourceUrl === "#editorial-policy",
      ).toBe(true);
      term.relatedTerms.forEach((id) =>
        expect(terms.some((t) => t.id === id)).toBe(true),
      );
    }
  });
  it("gives every learning path valid terms", () => {
    for (const path of learningPaths) {
      expect(path.terms.length).toBeGreaterThan(0);
      path.terms.forEach((id) =>
        expect(publishedTerms.some((t) => t.id === id)).toBe(true),
      );
    }
  });
  it("distinguishes MLR meanings", () => {
    expect(terms.find((t) => t.id === "mlr")?.alternateMeanings).toHaveLength(
      2,
    );
  });
});
describe("search behavior", () => {
  it("matches acronym, partial expansion, definition, alternate meaning, and case-insensitive queries", () => {
    for (const query of [
      "mlr",
      "medical legal",
      "cross-functional",
      "medical loss",
      "  MLR  ",
    ])
      expect(searchTerms(terms, query).some((t) => t.id === "mlr")).toBe(true);
    expect(searchTerms(terms, "authoriz").some((t) => t.id === "pa")).toBe(
      true,
    );
  });
  it("combines category, letter, and saved filters", () => {
    expect(
      searchTerms(terms, "", categories[0], "M", ["mlr", "pi"]).map(
        (t) => t.id,
      ),
    ).toEqual(["mlr"]);
    expect(searchTerms(terms, "", "All categories", "All", [])).toEqual([]);
  });
  it("returns no results for missing terms and sorts alphabetically", () => {
    expect(searchTerms(terms, "zzzzzz")).toEqual([]);
    const results = searchTerms(terms, "");
    expect(results[0].acronym).toBe("AE");
  });
});
