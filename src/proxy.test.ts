import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "./proxy";

const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

afterEach(() => {
  if (originalAppUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
  else process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
});

describe("proxy canonical host redirect", () => {
  it("redirects the apex host to the configured www host without losing path or query", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://www.drkhaleej.com";

    const response = proxy(
      new NextRequest("https://drkhaleej.com/ar/om/doctors?specialty=cardiology"),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://www.drkhaleej.com/ar/om/doctors?specialty=cardiology",
    );
  });

  it("does not redirect the canonical www host", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://www.drkhaleej.com";

    const response = proxy(new NextRequest("https://www.drkhaleej.com/en/om"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("does not redirect the isolated workers.dev candidate", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://www.drkhaleej.com";

    const response = proxy(
      new NextRequest("https://drkhaleej-web-candidate.example.workers.dev/en/om"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
