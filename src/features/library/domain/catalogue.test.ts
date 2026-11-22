import assert from "node:assert/strict";
import { test } from "node:test";

import { catalogueSections, findEntry, findKitItem } from "./catalogue.ts";

test("an exercise id resolves to a rudiment, a kit exercise or a groove", () => {
  assert.deepEqual(
    ["single-stroke-roll", "snare-over-feet", "groove-basic-rock"].map((id) => {
      const entry = findEntry(id)!;
      return [entry.source, entry.name, entry.level];
    }),
    [
      ["rudiment", "Single Stroke Roll", 1],
      ["kit-coordination", "Snare + Feet", 1],
      ["groove", "Basic Rock", 1],
    ],
  );
  assert.equal(findEntry("nothing-here"), undefined);
});

test("a kit entry describes its instruments and a groove its style", () => {
  const groove = findEntry("groove-basic-rock")!;
  assert.equal(groove.category, "Rock");
  assert.equal(groove.detail, "Hi-hat · Snare · Kick");
  assert.equal(groove.defaultBpm, 80);
  assert.equal(findEntry("snare-over-feet")!.category, "Kit Coordination");
});

test("only kit exercises and grooves open in the kit player", () => {
  assert.equal(findKitItem("groove-shuffle")?.name, "Shuffle");
  assert.equal(findKitItem("four-way-coordination")?.name, "Four-Way");
  assert.equal(findKitItem("single-stroke-roll"), undefined);
});

test("the catalogue lists the three library categories with unique ids", () => {
  assert.deepEqual(
    catalogueSections.map((section) => section.title),
    ["Rudiments", "Kit Coordination", "Grooves"],
  );
  const ids = catalogueSections.flatMap((section) =>
    section.entries.map((entry) => entry.id),
  );
  assert.equal(new Set(ids).size, ids.length);
});
