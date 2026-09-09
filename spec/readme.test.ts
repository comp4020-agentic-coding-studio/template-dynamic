import { createMarkdownProcessor, parseFrontmatter } from "@astrojs/markdown-remark";
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { describe, expect, inject, it } from "vitest";

// README.md is your account of what this app is and what good looks like
// here, and the deployed app publishes it in full at /readme/ so a visitor
// reads it without leaving the site. This check holds that promise whatever
// the stack: it renders README.md to text and asserts the served page contains
// all of it. Styling, navigation and a footer around it all pass; a trimmed or
// paraphrased copy fails. Shipped and always on — keep it green, and keep the
// route in spec/routes.ts so the invariants cover the page too.
const baseUrl = inject("baseUrl");

const text = (html: string): string => new JSDOM(html).window.document.body.textContent ?? "";

// Letters and digits only: markdown renderers disagree about punctuation
// (smart quotes, dashes, entities) and whitespace, and none of that is content.
const normalise = (s: string): string => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

describe("readme", () => {
  it("serves the whole of README.md at /readme/", async () => {
    const { content } = parseFrontmatter(readFileSync("README.md", "utf8"));
    const processor = await createMarkdownProcessor();
    const expected = normalise(text((await processor.render(content)).code));
    expect(expected, "README.md has no text in it").not.toBe("");

    const res = await fetch(new URL("/readme/", baseUrl));
    expect(res.status).toBe(200);
    const served = normalise(text(await res.text()));
    expect(
      served.includes(expected),
      "/readme/ doesn't carry the full text of README.md — every word of it has to be there",
    ).toBe(true);
  });
});
