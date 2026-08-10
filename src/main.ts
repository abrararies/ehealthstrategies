import "./style.css";
import directoryJson from "./data/data.json";
import type { Country, EhealthDirectory } from "./types";
import { orderRegions } from "./regions";
import {
  renderHeader,
  renderHero,
  renderRegionSection,
  renderNoResults,
  renderFooter,
} from "./render";

const directory = directoryJson as EhealthDirectory;

function groupByRegion(countries: Country[]): Map<string, Country[]> {
  const grouped = new Map<string, Country[]>();
  for (const country of countries) {
    const list = grouped.get(country.region) ?? [];
    list.push(country);
    grouped.set(country.region, list);
  }
  for (const list of grouped.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return grouped;
}

function mount() {
  const app = document.getElementById("app");
  if (!app) throw new Error("Missing #app root element");

  const grouped = groupByRegion(directory.countries);
  const orderedRegions = orderRegions([...grouped.keys()]);

  const strategyCount = directory.countries.reduce((sum, c) => sum + c.strategies.length, 0);
  const stats = {
    countryCount: directory.countries.length,
    strategyCount,
    regionCount: orderedRegions.length,
  };

  const main = document.createElement("main");
  main.id = "main";
  for (const region of orderedRegions) {
    main.append(renderRegionSection(region, grouped.get(region) ?? []));
  }
  main.append(renderNoResults());

  app.append(
    renderHeader(),
    renderHero(stats, orderedRegions),
    main,
    renderFooter(directory.lastUpdated)
  );

  wireSearch();
}

function wireSearch() {
  const input = document.getElementById("search-input") as HTMLInputElement | null;
  const noResults = document.getElementById("no-results");
  if (!input || !noResults) return;

  const cards = Array.from(document.querySelectorAll<HTMLElement>(".country-card"));
  const sections = Array.from(document.querySelectorAll<HTMLElement>(".region-section"));

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    let totalVisible = 0;

    for (const section of sections) {
      const sectionCards = cards.filter((card) => section.contains(card));
      let visibleInSection = 0;

      for (const card of sectionCards) {
        const haystack = card.dataset.search ?? "";
        const matches = query === "" || haystack.includes(query);
        card.classList.toggle("hidden", !matches);
        if (matches) visibleInSection++;
      }

      section.classList.toggle("hidden", visibleInSection === 0);
      totalVisible += visibleInSection;
    }

    noResults.classList.toggle("hidden", totalVisible !== 0);
  });
}

mount();
