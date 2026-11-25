import assert from "node:assert/strict";
import { test } from "node:test";

import { fraction, ONE } from "../../../playback/fraction.ts";
import { msPerQuarterUnit } from "../../../playback/timing.ts";
import {
  buildClicks,
  clampBpm,
  clickSound,
  defaultSettings,
  isMetronomeSettings,
  meterFromLabel,
  METERS,
  playingBeat,
  pulseOf,
  subdivisionName,
  tempoOf,
  withMeter,
  withNextBeatKind,
  type MetronomeSettings,
} from "./metronome.ts";

const sixEight = { beats: 6, noteValue: 8 } as const;

test("four four at 120 clicks every half second with the first beat accented", () => {
  const loop = buildClicks(defaultSettings);
  const unit = msPerQuarterUnit(tempoOf(defaultSettings));
  assert.deepEqual(
    loop.strokes.map((click) => click.beat * unit),
    [0, 500, 1000, 1500],
  );
  assert.deepEqual(
    loop.strokes.map((click) => click.kind),
    ["accent", "normal", "normal", "normal"],
  );
  assert.equal(loop.cycleBeats * unit, 2000);
});

test("subdivisions add soft clicks between the beats", () => {
  const loop = buildClicks({ ...defaultSettings, subdivision: 3 });
  assert.equal(loop.strokes.length, 12);
  assert.deepEqual(
    loop.strokes.slice(0, 4).map((click) => [click.beatIndex, click.kind]),
    [
      [0, "accent"],
      [0, "soft"],
      [0, "soft"],
      [1, "normal"],
    ],
  );
  assert.ok(Math.abs((loop.strokes[1]?.beat ?? 0) - 1 / 3) < 1e-9);
});

test("a skipped beat is silent together with its subdivisions", () => {
  const settings: MetronomeSettings = {
    ...defaultSettings,
    subdivision: 2,
    beats: ["accent", "skipped", "normal", "normal"],
  };
  assert.deepEqual(
    buildClicks(settings).strokes.map((click) => click.kind),
    ["accent", "soft", "silent", "silent", "normal", "soft", "normal", "soft"],
  );
});

test("six eight counts the tempo in dotted quarters", () => {
  const settings = withMeter({ ...defaultSettings, bpm: 60 }, sixEight);
  assert.deepEqual(pulseOf(sixEight), fraction(3, 2));
  assert.deepEqual(pulseOf(defaultSettings.meter), ONE);
  const unit = msPerQuarterUnit(tempoOf(settings));
  const loop = buildClicks(settings);
  assert.equal(loop.strokes.length, 6);
  assert.ok(Math.abs((loop.strokes[3]?.beat ?? 0) * unit - 1000) < 1e-9);
  assert.ok(Math.abs(loop.cycleBeats * unit - 2000) < 1e-9);
});

test("changing the time signature resets the beats and an unavailable subdivision", () => {
  const edited: MetronomeSettings = {
    ...defaultSettings,
    subdivision: 4,
    beats: ["skipped", "accent", "normal", "normal"],
  };
  const changed = withMeter(edited, sixEight);
  assert.deepEqual(changed.beats, [
    "accent",
    "normal",
    "normal",
    "normal",
    "normal",
    "normal",
  ]);
  assert.equal(changed.subdivision, 1);
  assert.equal(subdivisionName(changed), "Eighth notes");
  assert.equal(
    withMeter({ ...edited, subdivision: 2 }, sixEight).subdivision,
    2,
  );
  assert.equal(
    subdivisionName({ ...defaultSettings, subdivision: 3 }),
    "Triplets",
  );
});

test("tapping a beat cycles normal, accent, skipped", () => {
  let settings = defaultSettings;
  const kinds = [];
  for (let tap = 0; tap < 3; tap += 1) {
    settings = withNextBeatKind(settings, 1);
    kinds.push(settings.beats[1]);
  }
  assert.deepEqual(kinds, ["accent", "skipped", "normal"]);
  assert.equal(settings.beats[0], "accent");
});

test("tempo stays within the metronome range", () => {
  assert.equal(clampBpm(10), 40);
  assert.equal(clampBpm(999), 240);
  assert.equal(clampBpm(120.4), 120);
});

test("stored settings are accepted only when every part is valid", () => {
  assert.ok(isMetronomeSettings(defaultSettings));
  for (const meter of METERS) {
    assert.ok(isMetronomeSettings(withMeter(defaultSettings, meter)));
  }
  const broken = [
    null,
    "120",
    { ...defaultSettings, bpm: 500 },
    { ...defaultSettings, meter: { beats: 7, noteValue: 8 } },
    { ...defaultSettings, subdivision: 5 },
    { ...defaultSettings, beats: ["accent"] },
    { ...defaultSettings, beats: ["accent", "loud", "normal", "normal"] },
    { ...withMeter(defaultSettings, sixEight), subdivision: 3 },
  ];
  for (const stored of broken) {
    assert.equal(isMetronomeSettings(stored), false);
  }
});

test("a time signature label finds its meter and an unknown label finds none", () => {
  assert.deepEqual(meterFromLabel("6/8"), sixEight);
  assert.deepEqual(meterFromLabel("4/4"), defaultSettings.meter);
  assert.equal(meterFromLabel("7/8"), undefined);
});

test("accents play the accent sample, beats the tap and subdivisions a soft tap", () => {
  assert.deepEqual(clickSound({ beat: 0, beatIndex: 0, kind: "accent" }), {
    sample: "accent",
    level: "full",
  });
  assert.deepEqual(clickSound({ beat: 1, beatIndex: 1, kind: "normal" }), {
    sample: "tap",
    level: "full",
  });
  assert.deepEqual(clickSound({ beat: 0.5, beatIndex: 0, kind: "soft" }), {
    sample: "tap",
    level: "soft",
  });
});

test("silent and missing clicks play nothing", () => {
  assert.equal(
    clickSound({ beat: 1, beatIndex: 1, kind: "silent" }),
    undefined,
  );
  assert.equal(clickSound(undefined), undefined);
});

test("the playing beat counts from one, follows subdivisions and is zero when nothing plays", () => {
  const clicks = buildClicks({ ...defaultSettings, subdivision: 2 }).strokes;
  assert.equal(playingBeat(clicks, 0), 1);
  assert.equal(playingBeat(clicks, 1), 1);
  assert.equal(playingBeat(clicks, 2), 2);
  assert.equal(playingBeat(clicks, 7), 4);
  assert.equal(playingBeat(clicks, null), 0);
  assert.equal(playingBeat(clicks, 99), 0);
});
