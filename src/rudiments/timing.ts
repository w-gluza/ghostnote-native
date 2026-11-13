import type { Hand, RudimentPattern } from "./types";

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

export function msPerBeat(bpm: number) {
  return 60000 / bpm;
}

export function strokeBeats(pattern: RudimentPattern) {
  let units = 0;
  return pattern.strokes.map((stroke) => {
    const beat = units / pattern.subdivision;
    units += stroke.length ?? 1;
    return beat;
  });
}

export function loopBeats(pattern: RudimentPattern) {
  const units = pattern.strokes.reduce(
    (total, stroke) => total + (stroke.length ?? 1),
    0,
  );
  return units / pattern.subdivision;
}

export function beatOfOrdinal(pattern: RudimentPattern, ordinal: number) {
  const count = pattern.strokes.length;
  const cycle = Math.floor(ordinal / count);
  const beats = strokeBeats(pattern);
  return cycle * loopBeats(pattern) + (beats[ordinal % count] ?? 0);
}

export function gapBeforeOrdinal(pattern: RudimentPattern, ordinal: number) {
  const count = pattern.strokes.length;
  const previous = pattern.strokes[(ordinal - 1 + count) % count];
  return (previous?.length ?? 1) / pattern.subdivision;
}

export function leadMs(gapMs: number) {
  return Math.min(MAX_LEAD_MS, gapMs * LEAD_SHARE);
}

export function nextIndexOfHand(pattern: RudimentPattern, index: number) {
  const count = pattern.strokes.length;
  const hand = pattern.strokes[index]?.hand;
  for (let step = 1; step <= count; step += 1) {
    const candidate = (index + step) % count;
    if (pattern.strokes[candidate]?.hand === hand) {
      return candidate;
    }
  }
  return index;
}

export function beatsUntilSameHand(pattern: RudimentPattern, index: number) {
  const target = nextIndexOfHand(pattern, index);
  const count = pattern.strokes.length;
  let beats = 0;
  let cursor = index;
  do {
    cursor = (cursor + 1) % count;
    beats += gapBeforeOrdinal(pattern, cursor);
  } while (cursor !== target);
  return beats;
}

export function scheduleStrokes(
  pattern: RudimentPattern,
  bpm: number,
  count: number,
): ScheduledStroke[] {
  const beat = msPerBeat(bpm);
  return Array.from({ length: count }, (_, ordinal) => {
    const index = ordinal % pattern.strokes.length;
    const stroke = pattern.strokes[index];
    return {
      index,
      hand: stroke?.hand ?? "R",
      accent: stroke?.accent ?? false,
      timeMs: beatOfOrdinal(pattern, ordinal) * beat,
    };
  });
}
