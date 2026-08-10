/**
 * Validates src/data/data.json before it reaches the site or a PR is merged.
 *
 * Run with: npm run validate-data
 * Also runs automatically before `npm run build` (see package.json "prebuild"),
 * and in CI on every pull request (see .github/workflows/validate.yml).
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DATA_PATH = join(ROOT, "src/data/data.json");
const PUBLIC_DIR = join(ROOT, "public");

type Issue = { level: "error" | "warning"; message: string };
const issues: Issue[] = [];

function error(message: string) {
  issues.push({ level: "error", message });
}
function warn(message: string) {
  issues.push({ level: "warning", message });
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function checkAssetExists(relPath: string, context: string) {
  if (/^https?:\/\//i.test(relPath)) return; // external link — nothing to check locally
  const full = join(PUBLIC_DIR, relPath);
  if (!existsSync(full)) {
    error(`${context} points to "${relPath}", but public/${relPath} does not exist.`);
  }
}

function main() {
  if (!existsSync(DATA_PATH)) {
    error(`Could not find ${DATA_PATH}`);
    report();
    return;
  }

  let raw: string;
  try {
    raw = readFileSync(DATA_PATH, "utf-8");
  } catch (e) {
    error(`Could not read data.json: ${(e as Error).message}`);
    report();
    return;
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    error(`data.json is not valid JSON: ${(e as Error).message}`);
    report();
    return;
  }

  if (typeof json !== "object" || json === null || !("countries" in json)) {
    error(`data.json must be an object with a top-level "countries" array.`);
    report();
    return;
  }

  const doc = json as { lastUpdated?: unknown; countries?: unknown };

  if (!isNonEmptyString(doc.lastUpdated)) {
    warn(`Top-level "lastUpdated" should be a non-empty date string (e.g. "2026-08-10").`);
  }

  if (!Array.isArray(doc.countries)) {
    error(`"countries" must be an array.`);
    report();
    return;
  }

  const seen = new Set<string>();

  doc.countries.forEach((entry, index) => {
    const label = `countries[${index}]`;
    if (typeof entry !== "object" || entry === null) {
      error(`${label} must be an object.`);
      return;
    }
    const c = entry as Record<string, unknown>;

    if (!isNonEmptyString(c.region)) error(`${label}.region is required (e.g. "Africa", "Europe").`);
    if (!isNonEmptyString(c.name)) error(`${label}.name is required.`);
    if (!isNonEmptyString(c.flag)) {
      error(`${label}.name=${String(c.name)}: "flag" is required, e.g. "flags/xx.svg".`);
    } else {
      checkAssetExists(c.flag, `${label} (${c.name}) flag`);
    }

    if (c.isoCode !== undefined && !isNonEmptyString(c.isoCode)) {
      warn(`${label} (${c.name}): "isoCode" should be a non-empty string if present.`);
    }

    const key = `${c.region}::${String(c.name).toLowerCase()}`;
    if (seen.has(key)) {
      warn(`Duplicate entry for "${c.name}" in region "${c.region}" — consider merging their strategies into one entry.`);
    }
    seen.add(key);

    if (!Array.isArray(c.strategies)) {
      error(`${label} (${c.name}): "strategies" must be an array (can be empty).`);
      return;
    }
    if (c.strategies.length === 0) {
      warn(`${label} (${c.name}): has no strategies listed yet.`);
    }

    c.strategies.forEach((s, sIndex) => {
      const sLabel = `${label} (${c.name}).strategies[${sIndex}]`;
      if (typeof s !== "object" || s === null) {
        error(`${sLabel} must be an object.`);
        return;
      }
      const strat = s as Record<string, unknown>;
      if (!isNonEmptyString(strat.title)) error(`${sLabel}.title is required.`);
      if (!isNonEmptyString(strat.description)) error(`${sLabel}.description is required.`);
      if (!isNonEmptyString(strat.documentUrl)) {
        error(`${sLabel}.documentUrl is required.`);
      } else {
        checkAssetExists(strat.documentUrl, `${sLabel} (${strat.title})`);
      }
      if (strat.year !== undefined && typeof strat.year !== "number") {
        warn(`${sLabel}: "year" should be a number if present.`);
      }
    });
  });

  report();
}

function report() {
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  for (const w of warnings) console.warn(`⚠︎  ${w.message}`);
  for (const e of errors) console.error(`✗  ${e.message}`);

  if (errors.length === 0) {
    console.log(
      `✓ data.json looks good (${warnings.length} warning${warnings.length === 1 ? "" : "s"}).`
    );
    process.exit(0);
  } else {
    console.error(
      `\n${errors.length} error${errors.length === 1 ? "" : "s"} found in data.json — fix these before merging.`
    );
    process.exit(1);
  }
}

main();
