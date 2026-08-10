/**
 * Resolves a path from data.json (flag or documentUrl) into a URL the
 * browser can load.
 *
 *  - Absolute URLs (http/https) — e.g. a link straight to a ministry's
 *    own PDF — are returned unchanged.
 *  - Relative paths — e.g. "flags/de.svg" or "documents/germany/x.pdf",
 *    meaning "this file lives in /public" — are prefixed with Vite's
 *    BASE_URL so they resolve correctly whether the site is served from
 *    a domain root or from a GitHub Pages project path.
 */
export function resolveAsset(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = import.meta.env.BASE_URL; // e.g. "./" or "/repo-name/"
  return base.replace(/\/$/, "") + "/" + path.replace(/^\//, "");
}
