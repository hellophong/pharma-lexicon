# Pharma Lexicon

An editorial field guide for pharmaceutical agency teams: 50 foundational terms, six categories, practical account actions, and a local term-submission workflow. Existing learning-path deep links and the footer’s onboarding action remain available. Built with React 19, TypeScript, and Vite. No backend or third-party analytics service is connected.

## Run locally

Use Node.js 22.14+ (Node 24 recommended) and pnpm 11.19.0.

```sh
corepack enable
corepack prepare pnpm@11.19.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

```sh
pnpm format:check
pnpm lint
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm preview
```

`pnpm format` formats source files. `pnpm build` type-checks and generates `dist/`. Deploy `dist/` to a static host at the domain root. Hash routes work without server rewrite rules. No environment variables or secrets are required. The branch is `feat/pharma-lexicon-prototype`; there is no automatic deployment or default-branch merge.

## Product and design

Warm paper, forest green, and restrained citron give the library an editorial identity. Self-hosted DM Sans supports reading; Bodoni Moda creates distinct acronym and headline moments. The visual system uses typography and lines, plus an image-generated open-reference brand symbol. The original transparent asset is stored at `public/brand/pharma-lexicon-symbol.png` and rendered as an alpha mask in forest green (header) and citron (footer). The product name remains live text for legibility and accessibility. See `public/brand/README.md` for the generation prompt.

The simplified page starts directly with the lexicon beneath navigation, followed by the contribution section and a deep-green footer. The hero, audience strip, problem statement, storytelling, context note, learning-path cards, and product-vision sections have been removed. The glossary layout and capabilities are unchanged. Reduced-motion preferences disable transitions and smooth scrolling.

The reusable design system lives in `src/styles.css`: color, type, spacing, container and motion tokens; button variants; filter chips; cards; progress bars; search, focus, and empty states. Most information is progressively disclosed through native modal dialogs. The keyboard shortcut `/` focuses the lexicon search. Escape closes dialogs; native dialogs contain keyboard focus and return it to the invoking control.

## Architecture

- `src/data/types.ts`: the CMS-ready Term, AlternateMeaning, Suggestion, and LearningPath contracts.
- `src/data/terms.ts`: 50 editorial records, references, contextual alternate meanings, and publication status. The compact row format is mapped to fully named Term objects. Field order is specified by the `Row` tuple type.
- `src/data/paths.ts`: ordered learning sequences referencing stable term IDs.
- `src/lib/search.ts`: pure partial-match search across acronyms, expansions, definitions, implications, and alternate meanings. Filters compose with search.
- `src/lib/storage.ts`: guarded, versioned local storage for saved terms and reading progress; malformed or unavailable storage does not prevent browsing.
- `src/lib/analytics.ts`: a typed event boundary, with no transport or service.
- `src/components/`: shared modal, term field note, onboarding reader, and contribution form.
- `src/App.tsx`: landing-page narrative, library controls, routing, and composition.
- `tests/`: content/search integrity and Playwright interaction, accessibility, and responsive checks.
- `screenshots/`: desktop, tablet, mobile, and reduced-motion captures.

### Local state

- `pl:bookmarks:v1`: stable term ID array.
- `pl:progress:v1`: `pathId:termId` reading-completion array.
- `pl:suggestions:v1`: structured submission records with UUID, timestamp, and `submitted` status.

Suggestions are saved on the current browser only. The completion view illustrates Submitted → Editorial review → Compliance review if needed → Published; it does not impersonate a live moderation service. Nothing is automatically published. Clearing browser storage removes local progress and suggestions. Learning completion measures reading, not assessed proficiency.

### URLs and metadata

A term has a direct URL such as `/#term/mlr`; a path uses `/#path/first-mlr`. Terms update the document title and have a copy-link action. Invalid term/path IDs have a recovery screen. Generic description, Open Graph metadata, social artwork, and a favicon are included. Hash routes do not provide term-specific search indexing or social cards. Before deployment, set an absolute canonical URL and production social image URL; the included PNG social image supports common crawlers. An SSR or prerendered routing layer is the next step for indexed public term pages.

## Content management

See [CONTENT.md](CONTENT.md) for the editorial process and field-level guidance. Content changes do not require presentation changes; this static prototype still requires a build/deployment to distribute source edits.

Entries paraphrase public FDA, CMS, HHS, NCI, NLM, WHO, NICE, HealthCare.gov, and ISPOR references where appropriate. Common agency conventions are labeled separately. All meeting examples and account actions are original editorial guidance. Sources support terminology, not an endorsement of the product or every suggested agency action. “Published” means visible in the prototype; an independent clinical/regulatory review has not been performed. This is an educational U.S.-focused reference, not medical, legal, or regulatory advice.

## Analytics boundary

Subscribe to `window` events named `pharma-lexicon:analytics`. Event names include search, filter, term_open, bookmark, path_start, lesson_complete, and suggestion_submit. Properties intentionally omit raw search strings, submission text, patient data, and user identity. A future adapter can forward approved events to an analytics service after privacy review and consent decisions. No network events are sent now.

## Validation and limitations

Automated coverage verifies 50 complete and uniquely identified records, related-term integrity, learning references, search combinations, persistence, deep links, alternate meanings, dialog focus restoration, onboarding completion, suggestion storage, responsive overflow, reduced motion, and automated WCAG A/AA rules. Browser screenshots supplement code checks. Automated accessibility checks cannot certify full WCAG conformance; production release should include screen-reader and human usability review. Browser tests currently target Chromium, not a cross-browser/device certification matrix.

No authentication, remote storage, live moderation, organization isolation, quizzes, or actual client-specific term collections are implemented. The data contract supports optional client notes, but production permissions must be designed before using them. Current progress and bookmarks belong to a browser, not an employee account.

## Recommended production sequence

1. **Editorial governance:** assign content owners, independent subject-matter reviewers, source-review cadence, and a change history. Approve the initial library before organizational rollout.
2. **Persistent submissions:** introduce a repository/API boundary backed by Postgres or an equivalent database. Validate server-side, add rate limits, record reviewer decisions, and keep published terms separate from proposals. Preserve UUIDs and stable slugs.
3. **Authentication:** add the organization’s SSO/OIDC provider, with reader, contributor, editor, compliance reviewer, and admin roles. Apply organization/client authorization to data retrieval, not just UI visibility.
4. **CMS:** map the existing Term contract to Sanity, Contentful, or a self-hosted CMS. Use draft/published revisions and conditional compliance gates, then replace the static data loader with validated published records. Keep related terms as ID references.
5. **Analytics:** connect the event adapter to an approved service; define retention, consent, and access controls. Measure successful lookups, path completion, and content gaps without storing sensitive free text.
6. **Learning:** add assessed questions, role-specific paths, and permissioned client glossaries after validating the reference experience with new hires and experienced account teams.
