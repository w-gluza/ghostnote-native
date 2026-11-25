import {
  compare,
  divide,
  fraction,
  multiply,
  ONE,
  toNumber,
  type Fraction,
} from "../../../playback/fraction.ts";
import type { Hand, RudimentPattern } from "./types";

export type TimelineStroke = {
  id: string;
  hand: Hand;
  beat: number;
  accent: boolean;
  ghost: boolean;
  bounce: boolean;
  grace: Hand[];
};

export type Timeline = {
  cycleBeats: number;
  strokes: TimelineStroke[];
  phrases: number[][];
};

function onsetsInOrder(pattern: RudimentPattern) {
  return pattern.strokes
    .flatMap((stroke) => (stroke.kind === "onset" ? [stroke] : []))
    .map((stroke, order) => ({ stroke, order }))
    .sort((a, b) => compare(a.stroke.at, b.stroke.at) || a.order - b.order)
    .map(({ stroke }) => stroke);
}

export function buildTimeline(
  pattern: RudimentPattern,
  scale: Fraction = ONE,
): Timeline {
  const onsets = onsetsInOrder(pattern);
  const indexOf = new Map(onsets.map((stroke, index) => [stroke.id, index]));

  const strokes = onsets.map((stroke) => ({
    id: stroke.id,
    hand: stroke.hand,
    beat: toNumber(multiply(stroke.at, scale)),
    accent: stroke.dynamics === "accent",
    ghost: stroke.dynamics === "ghost",
    bounce: stroke.technique === "multiple-bounce",
    grace: pattern.strokes
      .flatMap((other) =>
        other.kind === "grace" && other.beforeStrokeId === stroke.id
          ? [other]
          : [],
      )
      .sort((a, b) => a.order - b.order)
      .map((other) => other.hand),
  }));

  const phrases = (pattern.groups ?? [])
    .filter((group) => group.kind === "phrase")
    .map((group) =>
      group.strokeIds
        .flatMap((id) => indexOf.get(id) ?? [])
        .sort((a, b) => a - b),
    )
    .filter((phrase) => phrase.length > 0)
    .sort((a, b) => (a[0] ?? 0) - (b[0] ?? 0));
  const grouped = new Set(phrases.flat());
  const loose = strokes.map((_, index) => index).filter((i) => !grouped.has(i));
  if (loose.length > 0) {
    phrases.push(loose);
  }

  return {
    cycleBeats: toNumber(multiply(pattern.cycleDuration, scale)),
    strokes,
    phrases,
  };
}

export function evenStep(pattern: RudimentPattern): Fraction | undefined {
  const onsets = onsetsInOrder(pattern);
  if (onsets.length === 0) {
    return undefined;
  }
  const step = divide(pattern.cycleDuration, fraction(onsets.length));
  const isEven = onsets.every(
    (stroke, index) =>
      compare(stroke.at, multiply(step, fraction(index))) === 0,
  );
  return isEven ? step : undefined;
}

export function scaleToStep(pattern: RudimentPattern, step: Fraction) {
  const current = evenStep(pattern);
  return current ? divide(step, current) : ONE;
}
