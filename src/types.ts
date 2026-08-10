/**
 * Data model for data/data.json (imported as src/data/data.json).
 *
 * See README.md → "Data field reference" for the full contributor-facing
 * description of every field below.
 */

export interface Strategy {
  /** Official title of the strategy document, in its original language. */
  title: string;
  /** 1–3 sentence plain-language summary of scope and purpose. */
  description: string;
  /**
   * Where to find the document. Either:
   *  - an absolute URL to the official government/ministry page or PDF, or
   *  - a path relative to /public, e.g. "documents/germany/file.pdf"
   *    for a copy mirrored inside this repository.
   */
  documentUrl: string;
  /** Year the strategy was published or last officially revised. */
  year?: number;
  /** Language(s) the document is available in, e.g. "English", "French, Arabic". */
  language?: string;
  /** Free-text note: draft status, supersession, translation caveats, etc. */
  note?: string;
}

export interface Country {
  /** Region used for grouping, e.g. "Africa", "Americas", "Asia", "Europe",
   *  "Middle East", "Oceania". Free text — new regions are supported and
   *  will render with an auto-generated color and code. */
  region: string;
  /** Country name as it should be displayed. */
  name: string;
  /** ISO 3166-1 alpha-2 code (e.g. "DE"), used only as a display tag. */
  isoCode?: string;
  /** Path to the flag image, relative to /public, e.g. "flags/de.svg". */
  flag: string;
  /** One or more national eHealth strategy documents for this country. */
  strategies: Strategy[];
}

export interface EhealthDirectory {
  /** ISO date string, manually bumped by contributors on data changes. */
  lastUpdated: string;
  countries: Country[];
}
