# Raymond Sy

Static site for [ayray.github.io](https://ayray.github.io/): Raymond Sy's home on the internet. Who he is, what he makes, and a short account of his professional background.

Design: person first. The identity statement is the largest type on the site; projects come before background; a job title is context, never identity. Schibsted Grotesk carries every readable role and IBM Plex Mono is used only for small metadata (both SIL Open Font License, self-hosted in `public/fonts/`). Planning, requirements, decisions, and the private claim register live in Raymond's Brain, not here.

## Routes

| Route | What it is |
|---|---|
| `/` | Identity, Projects, Background |
| `/projects/` | Independent and personal projects (one entry per project; nothing implies more) |
| `/projects/<slug>/` | A project page |
| `/about/` | About Raymond, with the record of formal titles as held |
| `/404.html` | Not found, also serving retired legacy URLs |
| `/aboutme.html`, `/projects.html` | Legacy stubs forwarding to `/about/` and `/projects/` |

## Stack

Astro (static output), plain CSS with design tokens, no client JavaScript, HTML ordered-list diagrams laid out with container queries, Playwright and axe for tests. No backend. Deployed (when approved) by GitHub Actions to GitHub Pages.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Dev server |
| `npm run build` | **Review build.** Renders draft copy and shows a banner counting claims not yet Cleared |
| `npm run build:publish` | **Publish build.** Fails while any claim in use is not `Cleared` |
| `npm run preview` | Serve `dist/` at http://127.0.0.1:4321 |
| `npm test` | Playwright suite: layout at five widths, semantics, leak guard, identity hierarchy, axe in both themes, interaction, layout shift, and the claim guard |
| `npm run claims:sync` | Mirror claim *statuses* from the private register into `src/data/claims.json` |
| `npm run fonts` | Re-copy the Latin font subsets from the Fontsource dev dependencies |
| `npm run screenshots` | Review screenshots (set `REVIEW_DIR`) |

## Claims

Every piece of public copy lists the claim IDs it relies on: identity and background copy in `src/data/profile.ts`, projects in their YAML (`claims` for the project page, `cardClaims` where the project is listed). Only the status of each claim is mirrored here (`src/data/claims.json`); claim text, sources, and attribution stay in the private register. `Held`, `Prohibited`, and `Gap` claims fail every build; `Ready` claims render only in review builds; the publish build requires `Cleared`. `Cleared` is a content-quality state and authorizes no commit, push, publication, or deployment. `claims:sync` collects every `CLM-###` it finds under `src/`, including comments, so do not cite claim IDs in comments.

## Adding a project

1. Add `src/content/projects/<slug>.yaml`; the schema in `src/content.config.ts` validates it. A project's medium (system, tool, music, and so on) is its `kind`, not a new section.
2. Fields: `title`, `summary`, `excerpt`, `order`, `kind`, `status`, optional `whatItIs`, `builtWith`, `links`, `homeFigure`, `object` (for `/projects/`), `headerObject` (for its page), `claims`, `cardClaims`, `sections`, optional `pull`.
3. Register the new claim IDs in the private register, run `npm run claims:sync`, then `npm run build` and `npm test`.

A new area gets its own collection, route, and navigation item only when its content exists and a project entry cannot hold it.

## Legacy

The previous portfolio (a 2017 Bootstrap and jQuery site) remains in Git history, recoverable from commit `2cf11e0`.
