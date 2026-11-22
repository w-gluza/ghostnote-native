import assert from "node:assert/strict";
import { test } from "node:test";

import { PREVIEW_STROKE_LIMIT, stickingPreview } from "./sticking-preview.ts";

const phrase = (text: string) => text.split("");

test("keeps a short sticking whole", () => {
  const phrases = [phrase("RRR"), phrase("LLL")];

  assert.deepEqual(stickingPreview(phrases), { phrases, isShortened: false });
});

test("keeps a sticking that is exactly at the limit", () => {
  const phrases = [phrase("RLRR"), phrase("LRLL")];

  assert.deepEqual(stickingPreview(phrases), { phrases, isShortened: false });
});

test("drops the phrases that do not fit, never half a phrase", () => {
  const phrases = [
    phrase("RLRL"),
    phrase("RLRR"),
    phrase("LRLR"),
    phrase("LRLL"),
  ];

  assert.deepEqual(stickingPreview(phrases), {
    phrases: phrases.slice(0, 2),
    isShortened: true,
  });
});

test("cuts a first phrase that is longer than the limit", () => {
  const long = phrase("RRLLRRLLRRLLRRLLR");
  const preview = stickingPreview([long, phrase("LLRRLLRRLLRRLLRRL")]);

  assert.deepEqual(preview, {
    phrases: [long.slice(0, PREVIEW_STROKE_LIMIT)],
    isShortened: true,
  });
});

test("follows a custom limit", () => {
  const preview = stickingPreview([phrase("RLRR"), phrase("LRLL")], 4);

  assert.deepEqual(preview, { phrases: [phrase("RLRR")], isShortened: true });
});
