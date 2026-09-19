import type { Term } from "../data/types";
export function searchTerms(
  terms: Term[],
  query: string,
  category = "All categories",
  letter = "All",
  saved?: string[],
) {
  const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return terms
    .filter((term) => {
      const text = [
        term.acronym,
        term.expandedPhrase,
        term.definition,
        term.whyItMatters,
        ...term.alternateMeanings.flatMap((m) => [m.phrase, m.definition]),
      ]
        .join(" ")
        .toLocaleLowerCase();
      return (
        words.every((word) => text.includes(word)) &&
        (category === "All categories" || term.category === category) &&
        (letter === "All" || term.acronym.startsWith(letter)) &&
        (!saved || saved.includes(term.id))
      );
    })
    .sort((a, b) => a.acronym.localeCompare(b.acronym));
}
