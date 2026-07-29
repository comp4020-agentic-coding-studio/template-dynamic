import { describe, expect, inject, it } from "vitest";

// A worked page-specific test, not an invariant. It describes the starter
// implementation so there is a concrete example to replace with tests for the
// week's published spec.
describe("starter page", () => {
  const baseUrl = inject("baseUrl");

  it("marks the intro region used by the starter script", async () => {
    const source = await (await fetch(baseUrl)).text();
    expect(
      source,
      "This described the starter page you've now replaced. Replace it with a test for this week's published spec, or delete it — don't re-add the attribute to make it pass.",
    ).toContain('data-testid="intro"');
  });
});
