/**
 * Region metadata used purely for display: a short registry-style code and
 * a CSS color variable, shown as a small tag and left-edge color bar on
 * every country card.
 *
 * data/data.json stores `region` as free text on purpose, so a contributor
 * can introduce a new region just by typing it. If a region isn't listed
 * here, getRegionMeta() derives a reasonable code and picks a color from
 * FALLBACK_PALETTE deterministically, so the site never breaks — but for a
 * polished result, add real entries here when you introduce a new region.
 */

export interface RegionMeta {
  code: string;
  color: string;
}

export const REGION_ORDER = [
  "Europe",
  "Africa",
  "Americas",
  "Asia",
  "Middle East",
  "Oceania",
] as const;

const REGION_META: Record<string, RegionMeta> = {
  Africa: { code: "AFR", color: "var(--region-africa)" },
  Americas: { code: "AMS", color: "var(--region-americas)" },
  Asia: { code: "ASA", color: "var(--region-asia)" },
  Europe: { code: "EUR", color: "var(--region-europe)" },
  "Middle East": { code: "MEA", color: "var(--region-middle-east)" },
  Oceania: { code: "OCE", color: "var(--region-oceania)" },
};

const FALLBACK_PALETTE = [
  "var(--region-fallback-1)",
  "var(--region-fallback-2)",
  "var(--region-fallback-3)",
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function deriveCode(region: string): string {
  const letters = region.replace(/[^A-Za-z]/g, "").toUpperCase();
  return (letters.slice(0, 3) || "REG").padEnd(3, "X");
}

export function getRegionMeta(region: string): RegionMeta {
  if (REGION_META[region]) return REGION_META[region];
  const color = FALLBACK_PALETTE[hashString(region) % FALLBACK_PALETTE.length];
  return { code: deriveCode(region), color };
}

/** Orders known regions first (in REGION_ORDER), unknown regions after,
 * alphabetically, so new regions added by contributors never go missing. */
export function orderRegions(regions: string[]): string[] {
  const known = REGION_ORDER.filter((r) => regions.includes(r));
  const unknown = regions
    .filter((r) => !(REGION_ORDER as readonly string[]).includes(r))
    .sort((a, b) => a.localeCompare(b));
  return [...known, ...unknown];
}
