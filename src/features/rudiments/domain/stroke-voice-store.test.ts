import assert from "node:assert/strict";
import { test } from "node:test";

import { createStrokeVoiceStore, VOICE_KEY } from "./stroke-voice-store.ts";

function memory() {
  const data = new Map<string, unknown>();
  return {
    isFailing: false,
    load: (key: string) => data.get(key),
    save(key: string, value: unknown) {
      if (this.isFailing) {
        return false;
      }
      data.set(key, value);
      return true;
    },
  };
}

test("strokes sound like a practice pad until another sound is chosen", () => {
  assert.equal(createStrokeVoiceStore(memory()).strokeVoice(), "pad");
});

test("a chosen stroke sound is kept and announced", () => {
  const storage = memory();
  const store = createStrokeVoiceStore(storage);
  let announced = 0;
  store.subscribe(() => {
    announced += 1;
  });
  assert.equal(store.setStrokeVoice("snare"), true);
  assert.equal(store.strokeVoice(), "snare");
  assert.equal(announced, 1);
  assert.equal(storage.load(VOICE_KEY), "snare");
  assert.equal(createStrokeVoiceStore(storage).strokeVoice(), "snare");
});

test("choosing the same sound again still counts as a new selection", () => {
  const store = createStrokeVoiceStore(memory());
  let announced = 0;
  store.subscribe(() => {
    announced += 1;
  });
  store.setStrokeVoice("snare");
  store.setStrokeVoice("snare");
  assert.equal(store.strokeVoice(), "snare");
  assert.equal(store.selections(), 2);
  assert.equal(announced, 2);
});

test("an unknown stored sound falls back to the practice pad", () => {
  const storage = memory();
  storage.save(VOICE_KEY, "cowbell");
  assert.equal(createStrokeVoiceStore(storage).strokeVoice(), "pad");
});

test("a stroke sound that could not be saved reports failure and keeps the old one", () => {
  const storage = memory();
  const store = createStrokeVoiceStore(storage);
  storage.isFailing = true;
  assert.equal(store.setStrokeVoice("snare"), false);
  assert.equal(store.strokeVoice(), "pad");
});
