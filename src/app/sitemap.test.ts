import { beforeEach, describe, expect, it, vi } from "vitest";

const { listPublicImportSitemapEntries } = vi.hoisted(() => ({
  listPublicImportSitemapEntries: vi.fn(),
}));

vi.mock("@/server/public/import-sitemap", () => ({
  listPublicImportSitemapEntries,
}));

import sitemap from "./sitemap";

describe("public sitemap", () => {
  beforeEach(() => {
    listPublicImportSitemapEntries.mockResolvedValue([
      {
        pathname: "/en/om/pharmacies/al-khuwair-pharmacy",
        lastModified: new Date("2026-08-18T12:00:00.000Z"),
      },
      {
        pathname: "/ar/om/pharmacies/al-khuwair-pharmacy",
        lastModified: new Date("2026-08-18T12:00:00.000Z"),
      },
      {
        pathname: "/en/om/doctor/sara-ahmed",
        lastModified: new Date("2026-08-19T12:00:00.000Z"),
      },
      {
        pathname: "/en/om/doctor/sara-ahmed",
        lastModified: new Date("2026-08-19T12:00:00.000Z"),
      },
    ]);
  });

  it("emits only unique canonical URLs and does not fabricate static lastmod values", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).not.toContain("https://www.drkhaleej.com/en/om/search");
    expect(urls).not.toContain("https://www.drkhaleej.com/en/om/offers");
    expect(entries.find((entry) => entry.url === "https://www.drkhaleej.com/en/om")).not.toHaveProperty(
      "lastModified",
    );
    expect(
      entries.find(
        (entry) => entry.url === "https://www.drkhaleej.com/en/om/doctor/sara-ahmed",
      )?.lastModified,
    ).toEqual(new Date("2026-08-19T12:00:00.000Z"));
  });

  it("adds hreflang only when both indexable locale variants exist", async () => {
    const entries = await sitemap();
    const homepage = entries.find((entry) => entry.url === "https://www.drkhaleej.com/en/om");
    const pharmacy = entries.find(
      (entry) => entry.url === "https://www.drkhaleej.com/en/om/pharmacies/al-khuwair-pharmacy",
    );
    const unpairedDoctor = entries.find(
      (entry) => entry.url === "https://www.drkhaleej.com/en/om/doctor/sara-ahmed",
    );

    expect(homepage?.alternates?.languages).toEqual({
      "en-OM": "https://www.drkhaleej.com/en/om",
      "ar-OM": "https://www.drkhaleej.com/ar/om",
      "x-default": "https://www.drkhaleej.com/en/om",
    });
    expect(pharmacy?.alternates?.languages).toEqual({
      "en-OM": "https://www.drkhaleej.com/en/om/pharmacies/al-khuwair-pharmacy",
      "ar-OM": "https://www.drkhaleej.com/ar/om/pharmacies/al-khuwair-pharmacy",
      "x-default": "https://www.drkhaleej.com/en/om/pharmacies/al-khuwair-pharmacy",
    });
    expect(unpairedDoctor?.alternates).toBeUndefined();
  });
});
