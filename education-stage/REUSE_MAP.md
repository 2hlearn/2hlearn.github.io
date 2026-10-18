# Education adapter reuse map

Source: boscofile/bakkat at 74bb5e5a02cd834e65a503df1b5b2f5d3468e7c4.

## Exact upstream source, directly executed
- vendor/bakkat/scripts/home-selections.mjs: selectHomeStories; actual cover/featured/remainder selection.
- vendor/bakkat/src/admin/home-curation.js: validateSelection and MAX_FEATURED; actual publication, duplicate and item-cap checks. replaceCover is retained but not called yet.
- vendor/bakkat/src/admin/post-id.js: slug validator dependency; education wrapper additionally restricts IDs to ASCII.

These are pinned, byte-for-byte vendored source modules. Tests compare the first two with their separately retained reference originals. They are not an independently published shared package; syncing changes requires explicit upstream review and tests.

## Education-specific new code
- src/model.mjs: course/article schema guards, cross-collection home reference, site settings and tighter thumbnail/URL policy, thin upstream selection wrapper.
- src/assets.mjs: local raster inventory and signature/path/size checks.
- src/build.mjs and style.css: education pages, two category layout, safe Markdown, staging fences and asset manifest.
- cms-config.example.json: two content collections + site file configuration. This does not activate OAuth, a backend, or saving/publishing.

## Not reused or proven
Bakkat custom editor widgets, media transforms, OAuth worker, delete lifecycle, date handling, publication-history, deployment workflow and production SEO. No claim of full bakkat platform parity or completed multi-tenant template extraction.

## Next shared-platform step
After this staged adapter is accepted, extract the reused pure modules into a versioned common package with consumer contract tests for both bakkat and education. Keep branding, categories, routes and CMS targets as per-site configuration. Do not modify bakkat production to accomplish this preview.
