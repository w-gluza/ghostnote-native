import assert from "node:assert/strict";
import { test } from "node:test";

import { canBeChoked, chokedBy, type Chokes } from "./choke.ts";

type Hat = "open" | "closed" | "pedal" | "snare";

const chokes: Chokes<Hat> = { closed: ["open"], pedal: ["open"] };

test("a closing hi-hat silences an open one that is still ringing", () => {
  const ringing = [
    { sample: "open" as const, timeMs: 100 },
    { sample: "snare" as const, timeMs: 100 },
  ];

  assert.deepEqual(chokedBy(ringing, chokes, "closed", 500), [ringing[0]]);
  assert.deepEqual(chokedBy(ringing, chokes, "pedal", 500), [ringing[0]]);
});

test("other sounds leave the open hi-hat ringing", () => {
  const ringing = [{ sample: "open" as const, timeMs: 100 }];

  assert.deepEqual(chokedBy(ringing, chokes, "snare", 500), []);
  assert.deepEqual(chokedBy(ringing, chokes, "open", 500), []);
});

test("an open hi-hat on the same beat or later is left alone", () => {
  const ringing = [
    { sample: "open" as const, timeMs: 500 },
    { sample: "open" as const, timeMs: 900 },
  ];

  assert.deepEqual(chokedBy(ringing, chokes, "closed", 500), []);
});

test("only sounds named in a choke list can be choked", () => {
  assert.equal(canBeChoked(chokes, "open"), true);
  assert.equal(canBeChoked(chokes, "closed"), false);
  assert.equal(canBeChoked({}, "open"), false);
});
