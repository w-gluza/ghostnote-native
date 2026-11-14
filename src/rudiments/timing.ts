import { ONE, toNumber } from "./fraction.ts";
import type { Timeline } from "./timeline";
import type { Hand, Tempo } from "./types";

export const MIN_BPM = 40;
export const MAX_BPM = 200;

const MAX_LEAD_MS = 220;
const LEAD_SHARE = 0.45;

export type ScheduledStroke = {
  index: number;
  hand: Hand;
  accent: boolean;
  timeMs: number;
};

export function clampBpm(bpm: number) {
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(bpm)));
}

export function quarterTempo(bpm: number): Tempo {
  return { bpm, pulseQuarterUnits: ONE };
}

export function msPerQuarterUnit(tempo: Tempo) {
  return 60000 / (tempo.bpm * toNumber(tempo.pulseQuarterUnits));
}

export type Loop = { cycleBeats: number; strokes: { beat: number }[] };

export function beatOfOrdinal(timeline: Loop, ordinal: number) {
  const count = timeline.strokes.length;
  const cycle = Math.floor(ordinal / count);
  const index = ordinal - cycle * count;
  return cycle * timeline.cycleBeats + (timeline.strokes[index]?.beat ?? 0);
}

export function gapBeforeOrdinal(timeline: Loop, ordinal: number) {
  return (
    beatOfOrdinal(timeline, ordinal) - beatOfOrdinal(timeline, ordinal - 1)
  );
}

export type Anchor = { time: number; beat: number; unitMs: number };

export function onsetAt(anchor: Anchor, timeline: Loop, ordinal: number) {
  return (
    anchor.time +
    (beatOfOrdinal(timeline, ordinal) - anchor.beat) * anchor.unitMs
  );
}

export function retimed(
  anchor: Anchor,
  timeline: Loop,
  lastOrdinal: number,
  unitMs: number,
): Anchor {
  return {
    time: onsetAt(anchor, timeline, lastOrdinal),
    beat: beatOfOrdinal(timeline, lastOrdinal),
    unitMs,
  };
}

export function leadMs(gapMs: number) {
  return Math.min(MAX_LEAD_MS, gapMs * LEAD_SHARE);
}

export function nextIndexOfHand(timeline: Timeline, index: number) {
  const count = timeline.strokes.length;
  const hand = timeline.strokes[index]?.hand;
  for (let step = 1; step <= count; step += 1) {
    const candidate = (index + step) % count;
    if (timeline.strokes[candidate]?.hand === hand) {
      return candidate;
    }
  }
  return index;
}

export function beatsUntilSameHand(timeline: Timeline, index: number) {
  const target = nextIndexOfHand(timeline, index);
  const count = timeline.strokes.length;
  let beats = 0;
  let cursor = index;
  do {
    cursor = (cursor + 1) % count;
    beats += gapBeforeOrdinal(timeline, cursor);
  } while (cursor !== target);
  return beats;
}

export function scheduleStrokes(
  timeline: Timeline,
  tempo: Tempo,
  count: number,
): ScheduledStroke[] {
  const beat = msPerQuarterUnit(tempo);
  return Array.from({ length: count }, (_, ordinal) => {
    const index = ordinal % timeline.strokes.length;
    const stroke = timeline.strokes[index];
    return {
      index,
      hand: stroke?.hand ?? "R",
      accent: stroke?.accent ?? false,
      timeMs: beatOfOrdinal(timeline, ordinal) * beat,
    };
  });
}
