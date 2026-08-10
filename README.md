# ehealthstrategies
National eHealth Strategies of Different Countries
![Deploy Website](https://github.com/abrararies/ehealthstrategies/actions/workflows/deploy.yml/badge.svg)

A catalogue of **national eHealth / digital
health strategies**, grouped by world region, so policymakers, regulators,
and researchers can quickly find and download what their peers have
published.

To make it easy to contribute, the whole site is driven by one JSON file — add a country or a
document by editing data, not code.

---

## Contents

- [Quick start](#quick-start)
- [Project structure](#project-structure)
- [Adding a new country](#adding-a-new-country)
- [Adding another strategy to an existing country](#adding-another-strategy-to-an-existing-country)
- [Updating or retiring a strategy](#updating-or-retiring-a-strategy)
- [Adding a new region](#adding-a-new-region)
- [Data field reference](#data-field-reference)
- [Flag image guidelines](#flag-image-guidelines)
- [Document guidelines & rights](#document-guidelines--rights)
- [Validating your changes](#validating-your-changes)
- [Local development](#local-development)
- [Contribution workflow](#contribution-workflow)
- [Customizing the design](#customizing-the-design)

---

## Quick start

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install       # install dependencies
npm run dev       # start the dev server at http://localhost:5173
npm run build     # type-check, validate data.json, and build to dist/
npm run preview   # serve the production build locally, to sanity-check it
```

## Project structure

```
.
├── src/
│   ├── data/
│   │   └── data.json        ← THE FILE YOU EDIT to add/update countries & strategies
│   ├── main.ts               entry point: loads data.json, renders the page
│   ├── render.ts              all DOM-building functions (header, hero, cards…)
│   ├── regions.ts             region display names → color + short code
│   ├── assets.ts              resolves flag/document paths to working URLs
│   ├── types.ts               TypeScript types for data.json
│   ├── icons.ts                inline SVG icons
│   ├── dom.ts                  tiny DOM-building helper
│   └── style.css               all styling (design tokens at the top)
├── public/
│   ├── flags/                 ← flag images referenced from data.json live here
│   └── documents/             ← PDF strategy documents referenced from data.json live here
├── scripts/
│   └── validate-data.ts       checks data.json for errors before you commit/deploy
├── .github/workflows/
│   ├── validate.yml           runs on every PR: validates data + builds
│   └── deploy.yml             runs on push to main: builds + publishes to GitHub Pages
└── index.html
```

Everything in `public/` is copied as-is into the final site, so any path you
write in `data.json` as `"flags/xx.svg"` or `"documents/..../file.pdf"` must
correspond to an actual file under `public/`.

## Adding a new country

1. **Add a flag image** to `public/flags/`. Name it by lowercase
   [ISO 3166-1 alpha-2 code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2),
   e.g. `public/flags/jp.svg` for Japan. SVG preferred (see
   [flag image guidelines](#flag-image-guidelines)).

2. **Add the PDF(s)** to a new folder under `public/documents/`, named after
   the country, e.g. `public/documents/japan/japan-digital-health-strategy-2024.pdf`.
   (Or skip this step entirely and link straight to the document on the
   ministry's own website — see [Document guidelines](#document-guidelines--rights).)

3. **Add an entry to `src/data/data.json`**, inside the `"countries"` array:

   ```json
   {
     "region": "Asia",
     "name": "Japan",
     "isoCode": "JP",
     "flag": "flags/jp.svg",
     "strategies": [
       {
         "title": "Digital Health Strategy 2024",
         "description": "One to three sentences on scope and purpose — what the strategy actually covers.",
         "documentUrl": "documents/japan/japan-digital-health-strategy-2024.pdf",
         "year": 2024,
         "language": "Japanese, English summary"
       }
     ]
   }
   ```

4. **Validate**: `npm run validate-data` — it checks required fields and
   confirms the flag/document files you referenced actually exist.

5. Commit and open a pull request (see [Contribution workflow](#contribution-workflow)).

The site groups and orders countries automatically — you never need to touch
`src/main.ts` or `src/render.ts` to add content.

## Adding another strategy to an existing country

A country can have any number of strategies (e.g. a current one and a
superseded one). Just add another object to that country's `"strategies"`
array — see Germany's entry for an example with two strategies.

## Updating or retiring a strategy

- **Minor edits** (fixed typo in the description, corrected year): edit the
  fields directly.
- **A country published a new strategy that replaces an old one**: add the
  new strategy as a new entry, and add a short `"note"` to the old one, e.g.
  `"note": "Superseded by the 2024 strategy; retained here for historical reference."`
  Don't delete the old entry outright — the history is useful to
  researchers, and the note keeps it from being read as still current.
- **Replacing a mirrored PDF file**: overwrite the file at the same path
  under `public/documents/`, or add a new file and update `documentUrl` —
  either works, just keep them in sync and run `npm run validate-data`.

## Adding a new region

Region is free text — type any string as `"region"` in `data.json` and the
site will create a new section for it automatically, with an auto-generated
color and code, so nothing breaks.

For a polished result (a deliberately chosen color instead of an
auto-generated one, and correct placement in the region order), add it to
`src/regions.ts`:

```ts
const REGION_META: Record<string, RegionMeta> = {
  // ...existing regions
  "Your Region": { code: "YRG", color: "var(--region-your-region)" },
};
```

...and define `--region-your-region` alongside the other region colors near
the top of `src/style.css`.

## Data field reference

| Field (`Strategy`) | Required | Type | Notes |
|---|---|---|---|
| `title` | ✅ | string | Official title, original language. |
| `description` | ✅ | string | 1–3 plain-language sentences on scope. |
| `documentUrl` | ✅ | string | Absolute URL to the official source, **or** a path relative to `public/` for a mirrored copy. |
| `year` | – | number | Year published or last revised. |
| `language` | – | string | e.g. `"French"`, `"Arabic, English"`. |
| `note` | – | string | Draft status, supersession, translation caveats, anything a reader should know. |

| Field (`Country`) | Required | Type | Notes |
|---|---|---|---|
| `region` | ✅ | string | Grouping label, e.g. `"Africa"`, `"Europe"`. Free text. |
| `name` | ✅ | string | Display name. |
| `isoCode` | – | string | ISO alpha-2 code, shown as a small tag. |
| `flag` | ✅ | string | Path under `public/flags/`, e.g. `"flags/jp.svg"`. |
| `strategies` | ✅ | array | Can be empty — renders as "Strategy document pending". |

Top level: `lastUpdated` (string, bump it when you make a data change) and
`countries` (array of the above).

## Flag image guidelines

- **Format**: SVG preferred (crisp at any size, small file size). PNG is
  fine if SVG isn't available.
- **Naming**: lowercase ISO 3166-1 alpha-2 code, e.g. `de.svg`, `jp.svg`.
- **Aspect ratio**: roughly 3:2 works best with the card layout.
- **Sourcing**: use an official source or a reputable open-license flag set
  (e.g. the MIT-licensed [`flag-icons`](https://github.com/lipis/flag-icons)
  project) rather than a random web image, to avoid low-resolution or
  incorrectly-proportioned flags.
- The flags shipped with this starter project are simplified, hand-drawn
  approximations for demonstration only — replace them with accurate flag
  assets before publishing.

## Document guidelines & rights

Two ways to point `documentUrl` at a document:

1. **Link directly to the official source** (e.g. the ministry's own PDF
   URL). This is the **recommended default** — it stays current
   automatically, uses no repo storage, and sidesteps any question of
   whether you're allowed to redistribute the file.
2. **Mirror a copy in `public/documents/`** when the official link is
   unreliable, likely to move, or when long-term archival matters more than
   always showing the latest revision.

If you do mirror a copy, please confirm you're permitted to redistribute it
(most government publications are, but licensing varies by country — check
before assuming). Keep mirrored PDFs reasonably sized; very large files
bloat the git repository for everyone who clones it.

**Naming convention** for mirrored files:
`public/documents/<country-slug>/<country-slug>-<short-title>-<year>.pdf`.

## Validating your changes

```bash
npm run validate-data
```

This checks that:
- `data.json` is valid JSON with the expected shape
- every country has a `region`, `name`, and `flag`
- every strategy has a `title`, `description`, and `documentUrl`
- every referenced `flag` and local `documentUrl` file actually exists
  under `public/`
- it warns (without failing) on things like duplicate country entries or
  countries with no strategies yet

It also runs automatically before `npm run build`, and in CI on every pull
request (`.github/workflows/validate.yml`), so a broken data entry is caught
before it reaches the live site.

## Local development

```bash
npm run dev
```

Starts Vite's dev server with hot reload — edits to `data.json`, styles, or
TypeScript show up instantly in the browser.

## Contribution workflow

1. Fork (or branch, if you have write access) this repository.
2. Make your change to `data.json` and/or `public/flags` /
   `public/documents`.
3. Run `npm run validate-data` and `npm run build` locally.
4. Open a pull request. The `validate.yml` workflow re-checks everything
   automatically.
5. Once merged into `main`, the site redeploys automatically within a
   couple of minutes.

## Customizing the design

All colors, fonts, spacing, and the region color palette are defined as CSS
custom properties at the top of `src/style.css` (`:root { ... }`) — change
values there rather than hunting through individual rules. The type system
uses three roles: a serif display face for headings, a system sans for body
text, and a monospace face for the small reference codes/tags — keep that
distinction if you extend the design, it's what gives the "registry/ledger"
feel its consistency.
