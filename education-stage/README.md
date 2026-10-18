# Bakkat education staging adapter

This directory is an isolated education staging adapter. It is not a clone of all bakkat features and is not a validated CMS integration. Its approved target is the dedicated `staging/education-template` branch and `2hcube-education-stage` Pages project. Production `main`, GitHub Pages, and DNS are preserved. See STAGE_DEPLOYMENT.md for build boundaries.

## Reproduce

Node >=22. `npm ci --ignore-scripts`, `npm run build`, `npm test`. Deployable static output is `dist/`. Dependency lock is included. No analytics, no canonical URLs tied to a staging domain, robots and HTTP noindex headers included. Noindex is not access protection; only already-public/user-authorized content is in the output.

## Scope and provenance

- Pinned source snapshots in PROVENANCE.json. 2hcube urgent wording edits already landed in ed691c2; no duplicate edits or main changes.
- Bakkat patterns: explicit publication filtering; stable slug identity; content-reference cover and featured selection; exclusion of repeated stories; Markdown HTML disabled.
- Home: a cover referencing either collection, four small navigation tiles, concise company and lead-instructor summaries. About/team/contact routes preserved from source Markdown; content remains subject to editorial review.
- Programs: two categories, one cover, up to three featured, remaining list; six specialist course summaries plus one preparing introductory course from user-supplied title and subtitle. No schedules, detailed curricula, or claims of current classes or Inflearn availability.
- Articles: independently modeled collection. Initial article is draft and excluded. No fictitious public stories.
- JSON content enables a later Decap JSON-file collection. `cms-config.example.json` uses test-repo and is deliberately outside published output. No current GitHub or OAuth target is active. /admin/ explains unavailable editing rather than faking save buttons.
- Three upstream modules are now reused unchanged under vendor/bakkat and actually imported by the build: scripts/home-selections.mjs, src/admin/home-curation.js, src/admin/post-id.js. The education select wrapper adds stricter ASCII slug validation and adapts return names. This is vendored reuse pinned to a SHA, not a live shared package. Custom media, date widgets, OAuth, deletion workflow and publication-history are NOT ported. See REUSE_MAP.md.

## Remaining gates before real staging CMS

1. The dedicated staging branch and Pages project are already connected. Keep all CMS writes on `staging/education-template`, preserve current `main`, and verify that editing cannot publish to GitHub Pages production.
2. Review source against final wireframe changes and approved biography. Existing about page still has the old senior-model vision. Do not silently erase it; editorial review should resolve it.
3. Bind CMS only to the approved stage branch and approved authentication callback. Existing bakkat OAuth / repo / main must not be reused blindly. Credentials and grants need explicit authorization.
4. CMS configuration now includes a file-based site curation editor in addition to the two content collections. Program cover/featured use relation fields; the homepage uses collection + slug with build validation (no dynamic two-collection picker yet). Smoke-test create → draft → preview → publish on staging, including cancel/repeated submission, images and Korean titles.
5. Local thumbnails use restricted asset paths, required alt text, raster-extension/signature checks, 5 MiB cap, symlink prohibition and SHA256 inventory. Signature checks are not full image decoding. The original brand logo and generated LLM illustration are included; image upload through CMS is NOT yet end-to-end tested. Production feed/sitemap/canonical behavior remains a later migration step.
6. Local desktop and 390px mobile home/program/detail views were reviewed in Chrome without horizontal overflow. Recheck the actual Pages deployment after each approved update.
7. /softwalk/ currently displays an explicit link to existing production. This is safe for preview only. Before DNS cutover, bring full Softwalk static output into stage or prepare exact route mapping to its own host. Do not promote the placeholder to production: its absolute link would loop back after domain change.
8. DNS/custom domains untouched. Before any switch: URL inventory, content/assets diff, staging CMS validation, rollback and source SHA verification.

## Suggested rollout

Use one stable staging project and a dedicated non-production source branch. Build the actual education adapter there rather than repeatedly migrating frameworks. Compare legacy assets/routes first, then activate CMS with scoped stage authentication, then review design/content. Domain cutover is a separate approval after acceptance, never an automatic consequence of a successful staging build.

## Refined local validation

The initial cloud package passed 16 tests. The first Mac staging build passed 17 tests. The current brand/public-summary review passes 25 tests. ASSET_INVENTORY_DIFF.json retains the pinned repository-tree comparison from preparation. Its source snapshot had no binary/static image assets; the approved local brand logo and LLM illustration are added separately. Remote Jekyll theme assets and separate Softwalk hosting remain outside this adapter and remain migration blockers.

## Approved staging revision

- Original 716×716 logo bytes retained; navy/gold/coral roles replace the green palette. Gradient use is limited to cover accents and preparation badges.
- Home cover: LLM 공부의 정석 / LLM은 어떻게 동작하는가 / 인프런 공개 준비 중. No course enrollment URL or inferred schedule, duration, difficulty, audience, outcomes or detailed curriculum.
- A new text-free LLM concept illustration shows token tiles, connected processing layers and a magnifying glass. It is used on the home cover and course introduction. It is a conceptual cover, not a complete architecture diagram or an exported course slide.
- All course records contain only public summaries. The six specialist courses have two or three short topic names. Course free-form bodies and reference schedules were removed. Raw source documents and detail fields are rejected, including drafts. CMS remains disabled and warns that drafts in a public repository are public source.
- Local build and 25 tests passed; 17 generated page routes returned 200. Desktop and 390px mobile home/program views were reviewed without horizontal overflow.
- Existing About history and © 2015–current-year footer preserved. This revision is approved only for the existing staging branch and Pages project. Main, GitHub Pages production and DNS remain unchanged. CMS authentication and saving remain disabled.
