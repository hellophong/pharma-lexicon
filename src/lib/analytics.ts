export type AnalyticsEvent =
  | "search"
  | "filter"
  | "term_open"
  | "bookmark"
  | "path_start"
  | "lesson_complete"
  | "suggestion_submit";
// Consumers may subscribe to this event. Never include search text or submission contents.
export function track(
  name: AnalyticsEvent,
  properties: Record<string, string | number | boolean> = {},
) {
  window.dispatchEvent(
    new CustomEvent("pharma-lexicon:analytics", {
      detail: { name, properties, timestamp: new Date().toISOString() },
    }),
  );
}
