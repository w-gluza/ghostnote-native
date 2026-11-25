import {
  beatOfOrdinal,
  gapBeforeOrdinal,
  msPerQuarterUnit,
  type Tempo,
} from "../../../playback/timing.ts";
import type { Timeline } from "./timeline";
import type { Hand } from "./types";

export type ScheduledStroke = {
  index: number;
  hand: Hand;
  accent: boolean;
  timeMs: number;
};

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
