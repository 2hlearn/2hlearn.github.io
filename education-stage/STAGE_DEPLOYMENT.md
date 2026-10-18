# Approved stage boundaries

- Base: latest observed `2hlearn/2hlearn.github.io` main at `5dece5b5cb90812570f69091af45b2f43b008ece`.
- Branch: `staging/education-template`; this directory is added without changing existing repository files.
- Cloudflare account: Boscofile. New Pages project: `2hcube-education-stage`.
- Build root: `education-stage`. Node: `24.19.0` (>=22).
- Build command: `npm ci && npm run build`. Output: `dist` relative to build root.
- Only the approved branch may trigger builds. Preview branch deployments must be disabled. No custom domain or DNS changes.
- Public pages.dev preview: no authentication boundary. Robots meta, robots.txt, and X-Robots-Tag request search exclusion.
- Analytics collection remains off. Live CMS authentication and saving remain disabled.
- Footer uses a build-time current-year fallback and updates the displayed year in the browser. Existing About history remains unchanged.
- `/softwalk/` is a stage-only notice linking to existing production. This does not establish readiness for domain cutover.
- Three pinned bakkat modules are directly reused. This is not a full engine port or proven CMS integration.
