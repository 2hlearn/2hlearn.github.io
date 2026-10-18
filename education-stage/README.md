# Bakkat education staging adapter

This directory is an isolated education staging adapter. It is not a clone of all bakkat features and is not a validated CMS integration. Its approved target is the dedicated `staging/education-template` branch and `2hcube-education-stage` Pages project. Production `main`, GitHub Pages, and DNS are preserved. See STAGE_DEPLOYMENT.md for build boundaries.

## Reproduce

Node >=22. `npm ci --ignore-scripts`, `npm run build`, `npm test`. Deployable static output is `dist/`. Dependency lock is included. No analytics, no canonical URLs tied to a staging domain, robots and HTTP noindex headers included. Noindex is not access protection; only already-public/user-authorized content is in the output.

## Scope and provenance

- Pinned source snapshots in PROVENANCE.json. 2hcube urgent wording edits already landed in ed691c2; no duplicate edits or main changes.
- Bakkat patterns: explicit publication filtering; stable slug identity; content-reference cover and featured selection; exclusion of repeated stories; Markdown HTML disabled.
- Home: a cover referencing either collection, four small navigation tiles, concise company and lead-instructor summaries. About/team/contact routes preserved from source Markdown; content remains subject to editorial review.
- Programs: two categories, one cover, up to three featured, remaining list; six course detail pages from user-supplied titles and dates. These are reference curricula, not claims of current classes or Inflearn availability.
- Articles: independently modeled collection. Initial article is draft and excluded. No fictitious public stories.
- JSON content enables a later Decap JSON-file collection. `cms-config.example.json` uses test-repo and is deliberately outside published output. No current GitHub or OAuth target is active. /admin/ explains unavailable editing rather than faking save buttons.
- Three upstream modules are now reused unchanged under vendor/bakkat and actually imported by the build: scripts/home-selections.mjs, src/admin/home-curation.js, src/admin/post-id.js. The education select wrapper adds stricter ASCII slug validation and adapts return names. This is vendored reuse pinned to a SHA, not a live shared package. Custom media, date widgets, OAuth, deletion workflow and publication-history are NOT ported. See REUSE_MAP.md.

## Remaining gates before real staging CMS

1. Parent selects dedicated staging source branch/repository; ensure no GHPages production build is triggered. Re-read current main before creating a branch to preserve concurrent edits.
2. Review source against final wireframe changes and approved biography. Existing about page still has the old senior-model vision. Do not silently erase it; editorial review should resolve it.
3. Bind CMS only to the approved stage branch and approved authentication callback. Existing bakkat OAuth / repo / main must not be reused blindly. Credentials and grants need explicit authorization.
4. CMS configuration now includes a file-based site curation editor in addition to the two content collections. Program cover/featured use relation fields; the homepage uses collection + slug with build validation (no dynamic two-collection picker yet). Smoke-test create → draft → preview → publish on staging, including cancel/repeated submission, images and Korean titles.
5. Local thumbnails use restricted asset paths, required alt text, raster-extension/signature checks, 5 MiB cap, symlink prohibition and SHA256 inventory. Signature checks are not full image decoding. Add feed/sitemap/canonical production behavior. Current seed has no images; image field is NOT yet end-to-end CMS tested.
6. Browser desktop/mobile QA was attempted but Chromium launch failed with socket Operation not permitted. Current checks cover generated routes/content, not browser rendering.
7. /softwalk/ currently displays an explicit link to existing production. This is safe for preview only. Before DNS cutover, bring full Softwalk static output into stage or prepare exact route mapping to its own host. Do not promote the placeholder to production: its absolute link would loop back after domain change.
8. DNS/custom domains untouched. Before any switch: URL inventory, content/assets diff, staging CMS validation, rollback and source SHA verification.

## Suggested rollout

Use one stable staging project and a dedicated non-production source branch. Build the actual education adapter there rather than repeatedly migrating frameworks. Compare legacy assets/routes first, then activate CMS with scoped stage authentication, then review design/content. Domain cutover is a separate approval after acceptance, never an automatic consequence of a successful staging build.

## Refined local validation

16 automated tests pass. ASSET_INVENTORY_DIFF.json retains the full pinned repository-tree comparison. That tree has no binary/static image assets; remote Jekyll theme assets and separate Softwalk hosting are outside its scope and remain cutover blockers. Browser visual QA is still unverified.
