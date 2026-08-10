import { el, svgFromString, slugify } from "./dom";
import { ICON_SEARCH, ICON_DOWNLOAD, ICON_MARK } from "./icons";
import { getRegionMeta } from "./regions";
import { resolveAsset } from "./assets";
import type { Country, Strategy } from "./types";

const REPO_URL = "https://github.com/your-org/ehealth-strategies-registry";

export function renderHeader(): HTMLElement {
  const brand = el("a", { class: "brand", href: "#top" }, [
    el("span", { class: "brand__mark" }, [svgFromString(ICON_MARK)]),
    el("span", { class: "brand__text" }, [
      el("span", { class: "brand__title" }, ["eHealth Strategies Registry"]),
      el("span", { class: "brand__subtitle" }, ["National Digital Health Policy Index"]),
    ]),
  ]);

  const link = el(
    "a",
    { class: "app-header__link", href: REPO_URL, target: "_blank", rel: "noopener noreferrer" },
    ["Contribute on GitHub ↗"]
  );

  return el("header", { class: "app-header", id: "top" }, [
    el("div", { class: "app-header__inner wrap" }, [brand, link]),
  ]);
}

export interface HeroStats {
  countryCount: number;
  strategyCount: number;
  regionCount: number;
}

export function renderHero(stats: HeroStats, orderedRegions: string[]): HTMLElement {
  const statBlock = (value: number, label: string) =>
    el("div", { class: "hero__stat" }, [
      el("span", { class: "hero__stat-value" }, [String(value)]),
      el("span", { class: "hero__stat-label" }, [label]),
    ]);

  const left = el("div", { class: "hero__lead" }, [
    el("span", { class: "hero__eyebrow" }, ["Digital health policy reference"]),
    el("h1", { class: "hero__title" }, [
      "National eHealth Strategies Registry",
    ]),
    el("p", { class: "hero__lede" }, [
      "A single index of official eHealth and digital health strategy documents published by ministries of health worldwide — built for policymakers, regulators and researchers.",
    ]),
    el("div", { class: "hero__stats" }, [
      statBlock(stats.countryCount, "Countries indexed"),
      statBlock(stats.strategyCount, "Strategies catalogued"),
      statBlock(stats.regionCount, "Regions covered"),
    ]),
  ]);

  const searchIcon = svgFromString(ICON_SEARCH);
  searchIcon.setAttribute("class", "search-field__icon");

  const searchField = el("div", { class: "search-field" }, [
    searchIcon,
    el("input", {
      type: "search",
      id: "search-input",
      placeholder: "Search by country or strategy name…",
      "aria-label": "Search by country or strategy name",
      autocomplete: "off",
    }),
  ]);

  const pills = orderedRegions.map((region) => {
    const meta = getRegionMeta(region);
    return el("a", { class: "region-pill", href: `#${slugify(region)}` }, [
      el("span", { class: "region-pill__dot", style: `background:${meta.color}` }),
      region,
    ]);
  });

  const tool = el("div", { class: "hero__tool" }, [
    el("span", { class: "hero__tool-label" }, ["Find a country"]),
    searchField,
    el("nav", { class: "region-nav", "aria-label": "Jump to region" }, pills),
  ]);

  return el("section", { class: "hero" }, [
    el("div", { class: "hero__inner wrap" }, [left, tool]),
  ]);
}

function strategyMetaChips(strategy: Strategy): HTMLElement | null {
  const chips: HTMLElement[] = [];
  if (strategy.year) chips.push(el("span", {}, [String(strategy.year)]));
  if (strategy.language) chips.push(el("span", {}, [strategy.language]));
  if (chips.length === 0) return null;
  return el("div", { class: "strategy-meta" }, chips);
}

function renderStrategyRow(country: Country, strategy: Strategy): HTMLElement {
  const meta = strategyMetaChips(strategy);
  const downloadIcon = svgFromString(ICON_DOWNLOAD);

  const main = el("div", { class: "strategy-main" }, [
    el("span", { class: "strategy-title" }, [strategy.title]),
    el("p", { class: "strategy-desc" }, [strategy.description]),
    meta,
    strategy.note ? el("p", { class: "strategy-note" }, [strategy.note]) : null,
  ]);

  const stamp = el(
    "a",
    {
      class: "download-stamp",
      href: resolveAsset(strategy.documentUrl),
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": `Download: ${strategy.title} (${country.name})`,
      title: "Download PDF",
    },
    [downloadIcon]
  );

  return el("li", { class: "strategy-row" }, [main, stamp]);
}

export function renderCountryCard(country: Country): HTMLElement {
  const meta = getRegionMeta(country.region);

  const searchBlob = [country.name, country.isoCode, ...country.strategies.map((s) => s.title)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const list =
    country.strategies.length > 0
      ? el(
          "ul",
          { class: "strategy-list" },
          country.strategies.map((s) => renderStrategyRow(country, s))
        )
      : el("p", { class: "strategy-empty" }, ["Strategy document pending — check back soon."]);

  const body = el("div", { class: "country-card__body" }, [
    el("div", { class: "country-card__head" }, [
      el("img", {
        class: "flag-thumb",
        src: resolveAsset(country.flag),
        alt: `${country.name} flag`,
        loading: "lazy",
      }),
      el("h3", { class: "country-name" }, [country.name]),
      country.isoCode ? el("span", { class: "country-tag" }, [country.isoCode]) : null,
    ]),
    list,
  ]);

  return el(
    "article",
    {
      class: "country-card",
      "data-search": searchBlob,
      "data-country": country.name,
    },
    [el("div", { class: "country-card__bar", style: `background:${meta.color}` }), body]
  );
}

export function renderRegionSection(region: string, countries: Country[]): HTMLElement {
  const meta = getRegionMeta(region);
  const id = slugify(region);

  const header = el("div", { class: "region-section__header" }, [
    el("span", { class: "region-section__dot", style: `background:${meta.color}` }),
    el("h2", { class: "region-section__title" }, [region]),
    el("span", { class: "region-section__code" }, [meta.code]),
    el("span", { class: "region-section__count" }, [
      `${countries.length} ${countries.length === 1 ? "country" : "countries"}`,
    ]),
  ]);

  const grid = el(
    "div",
    { class: "country-grid" },
    countries.map((c) => renderCountryCard(c))
  );

  return el("section", { class: "region-section", id, "data-region-section": region }, [
    el("div", { class: "wrap" }, [header, grid]),
  ]);
}

export function renderNoResults(): HTMLElement {
  return el("div", { class: "no-results hidden", id: "no-results" }, [
    el("p", { class: "no-results__title" }, ["No matching countries or strategies"]),
    el("p", {}, ["Try a different search term, or clear the search to see the full registry."]),
  ]);
}

export function renderFooter(lastUpdated: string): HTMLElement {
  return el("footer", { class: "site-footer" }, [
    el("div", { class: "site-footer__inner wrap" }, [
      el("p", {}, [
        "Strategy documents remain the property of their respective governments and ministries of health. This registry indexes and links to them for reference. See ",
        el("a", { href: REPO_URL, target: "_blank", rel: "noopener noreferrer" }, ["the project README"]),
        " to suggest an addition or correction.",
      ]),
      el("p", { class: "site-footer__meta" }, [`Registry data last updated ${lastUpdated}`]),
    ]),
  ]);
}
