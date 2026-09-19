# Editorial guide

The field note is the unit of knowledge. A useful record answers: What is it? Why does it matter to our work? What should someone confirm or do next?

## Add a term

1. Search the existing entries and alternate meanings first. Prefer adding an alternate meaning when the same acronym already exists.
2. Add a source to `sources` in `src/data/terms.ts` if needed. Prefer a primary regulator, public health agency, or professional society for regulated, clinical, and access concepts. Use `agency usage` for organizational conventions; never label them official regulatory definitions.
3. Add a row in this order: acronym, expanded phrase, category index, definition, agency implication, meeting example, account action, related term IDs, source key. Category indices are 0–5 in the order listed in `src/data/types.ts`.
4. The initial library derives IDs by lowercasing the acronym and replacing `&` with `-`. Keep IDs stable once published. For a broader library, use explicit permanent IDs/slugs in the Term records rather than renaming published slugs.
5. Add context-labeled alternate meanings and an optional `clientNote` to the resulting Term object when relevant. Each alternate meaning can carry its own source.
6. Set `lastReviewed` to the actual editorial review date. The prototype’s shared date documents the initial source check, not independent compliance approval.
7. Set status to `draft` or `in review` while preparing content; use `published` only when ready for the visible library. The public dataset is filtered by status. For new records needing individual dates/status, extend the row type or migrate the source to full named Term objects; do not change every record’s date to imply a new review.
8. Check related IDs and learning paths. Run formatting, lint, tests, and build, then preview the field note on mobile and desktop.

The initial 50-count integrity assertion and landing-page count are intentional acceptance criteria for this prototype. When growing the collection, replace fixed marketing counts with `publishedTerms.length` and update the count test to the agreed library size.

## Write and verify

- Keep the definition concise, usually one or two sentences. Explain the idea before introducing more jargon.
- Specify U.S. jurisdiction where relevant; avoid universalizing payer rules, reporting deadlines, or client processes.
- Make implications and next actions specific to agency work: scope, schedule, claims, evidence, design, audience, measurement, or access.
- Label alternate meanings by discipline or organizational context. MLR, NDA, PA, and VA demonstrate this.
- Write fictional, non-confidential meeting examples. Do not include patient details, client secrets, or unapproved product claims.
- Cite the underlying terminology separately from editorial agency interpretation. Source links are not evidence that every practical suggestion is an official requirement.
- Regulatory or medical interpretation should receive specialist review before publication; this prototype has not undergone that independent review.

## Edit a term

Keep its ID unchanged. Check whether wording changes affect a learning path, source link, or alternate meaning. Revalidate the source and update the review date only after checking. Record substantive changes in version control. A CMS migration should add named author/reviewer fields and revision history.

## Retire a term

Change its status to `draft` to remove it from the published dataset. Remove or replace references to it in related terms and learning paths, then run the integrity tests. Keep the original record for history. A production model should add an explicit `retired` state, replacement ID, and redirect/tombstone page; the current status contract intentionally matches the prototype brief.

## Suggestions and moderation

The form saves structured records locally and shows a receipt. It never adds a suggestion to the published glossary. A real service should accept validated submissions, retain revision history, assign an editor, request compliance review when warranted, and publish only through an authorized action. Treat optional client context as sensitive and enforce organization/client permissions before enabling real client-specific content.
