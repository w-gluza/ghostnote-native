import assert from "node:assert/strict";
import { test } from "node:test";

import { menuMaxHeight, placeMenu } from "./menu-placement.ts";

const window = { width: 375, height: 667 };
const insets = { top: 20, bottom: 34 };
const menu = { width: 160, height: 144 };

test("the menu opens below its trigger when there is room", () => {
  assert.deepEqual(
    placeMenu({
      trigger: { x: 24, y: 100, width: 120, height: 44 },
      menu,
      window,
      insets,
      align: "start",
    }),
    { top: 152, left: 24 },
  );
});

test("the menu flips above a trigger near the bottom edge", () => {
  assert.deepEqual(
    placeMenu({
      trigger: { x: 24, y: 560, width: 120, height: 44 },
      menu,
      window,
      insets,
      align: "start",
    }),
    { top: 408, left: 24 },
  );
});

test("a menu too tall for either side stays inside the safe area", () => {
  const tall = { width: 160, height: 500 };
  const { top } = placeMenu({
    trigger: { x: 24, y: 300, width: 120, height: 44 },
    menu: tall,
    window,
    insets,
    align: "start",
  });

  assert.equal(top, 125);
  assert.ok(top + tall.height <= window.height - insets.bottom);
});

test("an end-aligned menu lines up with the trigger's trailing edge", () => {
  assert.equal(
    placeMenu({
      trigger: { x: 231, y: 100, width: 120, height: 44 },
      menu,
      window,
      insets,
      align: "end",
    }).left,
    191,
  );
});

test("the menu never crosses the side edges of the window", () => {
  assert.equal(
    placeMenu({
      trigger: { x: 300, y: 100, width: 60, height: 44 },
      menu,
      window,
      insets,
      align: "start",
    }).left,
    207,
  );
  assert.equal(
    placeMenu({
      trigger: { x: 10, y: 100, width: 60, height: 44 },
      menu,
      window,
      insets,
      align: "end",
    }).left,
    8,
  );
});

test("the tallest menu leaves a gap inside both safe-area edges", () => {
  assert.equal(menuMaxHeight(window, insets), 597);
});
