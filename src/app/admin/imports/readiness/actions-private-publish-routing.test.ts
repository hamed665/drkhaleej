import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("P09 private publish routing", () => {
  it("uses the persisted verified Reservation before transient runtime-context gates", () => {
    const source = readFileSync(new URL("./actions.ts", import.meta.url), "utf8");
    const handlerStart = source.indexOf(
      'if (operation === "private_publish") {\n        const dependencies = createPharmacyPrivateAdminPublishOperationDependenciesFromEnvironment',
    );
    const runtimeContextReader = source.indexOf(
      "const reader = createPharmacyPrivateAdminRuntimeContextReaderFromEnvironment()",
    );

    expect(handlerStart).toBeGreaterThan(-1);
    expect(runtimeContextReader).toBeGreaterThan(-1);
    expect(handlerStart).toBeLessThan(runtimeContextReader);
  });
});
