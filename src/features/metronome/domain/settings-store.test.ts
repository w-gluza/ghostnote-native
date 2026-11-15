import assert from "node:assert/strict";
import { test } from "node:test";

import { defaultSettings } from "./metronome.ts";
import {
  createMetronomeSettingsStore,
  SETTINGS_KEY,
} from "./settings-store.ts";

function memory() {
  const data = new Map<string, unknown>();
  return {
    isFailing: false,
    saves: 0,
    load: (key: string) => data.get(key),
    save(key: string, value: unknown) {
      if (this.isFailing) {
        return false;
      }
      this.saves += 1;
      data.set(key, value);
      return true;
    },
  };
}

test("the metronome starts from the default settings when nothing valid is stored", () => {
  const storage = memory();
  assert.deepEqual(
    createMetronomeSettingsStore(storage).settings(),
    defaultSettings,
  );
  storage.save(SETTINGS_KEY, { bpm: "fast" });
  assert.deepEqual(
    createMetronomeSettingsStore(storage).settings(),
    defaultSettings,
  );
});

test("a changed setting is announced, saved once and restored by the next store", () => {
  const storage = memory();
  const store = createMetronomeSettingsStore(storage);
  let announced = 0;
  store.subscribe(() => {
    announced += 1;
  });
  const bpm = defaultSettings.bpm + 7;
  assert.equal(
    store.change((current) => ({ ...current, bpm })),
    true,
  );
  assert.equal(store.settings().bpm, bpm);
  assert.equal(announced, 1);
  assert.equal(storage.saves, 1);
  assert.equal(createMetronomeSettingsStore(storage).settings().bpm, bpm);
});

test("each change builds on the one before it", () => {
  const store = createMetronomeSettingsStore(memory());
  store.change((current) => ({ ...current, bpm: current.bpm + 1 }));
  store.change((current) => ({ ...current, bpm: current.bpm + 1 }));
  assert.equal(store.settings().bpm, defaultSettings.bpm + 2);
});

test("a setting that could not be saved still applies and reports the failure", () => {
  const storage = memory();
  const store = createMetronomeSettingsStore(storage);
  storage.isFailing = true;
  const bpm = defaultSettings.bpm + 3;
  assert.equal(
    store.change((current) => ({ ...current, bpm })),
    false,
  );
  assert.equal(store.settings().bpm, bpm);
});
