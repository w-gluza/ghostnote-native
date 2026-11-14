import { compare, isReduced, ZERO } from "./fraction.ts";
import type { Fraction, Rudiment, RudimentPattern, Tempo } from "./types";

const DYNAMICS = ["normal", "ghost", "accent"];
const HANDS = ["R", "L"];
const STROKE_KINDS = ["onset", "grace"];
const GROUP_KINDS = ["phrase", "diddle"];

function isPositive(value: Fraction) {
  return isReduced(value) && compare(value, ZERO) > 0;
}

export function validateTempo(tempo: Tempo): string[] {
  const problems: string[] = [];
  if (!Number.isFinite(tempo.bpm) || tempo.bpm <= 0) {
    problems.push("tempo needs a finite, positive bpm");
  }
  if (!isPositive(tempo.pulseQuarterUnits)) {
    problems.push("tempo needs a positive, reduced pulse");
  }
  return problems;
}

export function validatePattern(pattern: RudimentPattern): string[] {
  const problems: string[] = [];
  const say = (problem: string) => problems.push(`${pattern.id}: ${problem}`);

  if (!Number.isInteger(pattern.version) || pattern.version < 1) {
    say("version must be a whole number from 1");
  }
  if (!isPositive(pattern.cycleDuration)) {
    say("cycle must be a positive, reduced fraction");
  }

  if (!Array.isArray(pattern.strokes)) {
    say("strokes must be a list");
    return problems;
  }
  if (pattern.groups !== undefined && !Array.isArray(pattern.groups)) {
    say("groups must be a list");
    return problems;
  }

  const ids = new Set<string>();
  const onsetIds = new Set<string>();
  for (const stroke of pattern.strokes) {
    if (typeof stroke.id !== "string" || stroke.id.length === 0) {
      say("every stroke needs an id");
    }
    if (!HANDS.includes(stroke.hand)) {
      say(`${stroke.id} has an unknown hand`);
    }
    if (!STROKE_KINDS.includes(stroke.kind)) {
      say(`${stroke.id} has an unknown kind`);
    }
    if (ids.has(stroke.id)) {
      say(`stroke id ${stroke.id} is used twice`);
    }
    ids.add(stroke.id);
    if (stroke.kind === "onset") {
      onsetIds.add(stroke.id);
    }
  }
  if (onsetIds.size === 0) {
    say("needs at least one onset");
  }

  const graceOrders = new Map<string, Set<number>>();
  for (const stroke of pattern.strokes) {
    if (stroke.kind === "onset") {
      if (!stroke.at || !isReduced(stroke.at)) {
        say(`${stroke.id} position is not a reduced fraction`);
      } else if (
        compare(stroke.at, ZERO) < 0 ||
        compare(stroke.at, pattern.cycleDuration) >= 0
      ) {
        say(`${stroke.id} sits outside the cycle`);
      }
      if (
        stroke.dynamics !== undefined &&
        !DYNAMICS.includes(stroke.dynamics)
      ) {
        say(`${stroke.id} has unknown dynamics`);
      }
      if (
        stroke.technique !== undefined &&
        stroke.technique !== "multiple-bounce"
      ) {
        say(`${stroke.id} has an unknown technique`);
      }
      continue;
    }
    if (stroke.kind !== "grace") {
      continue;
    }

    if (!onsetIds.has(stroke.beforeStrokeId)) {
      say(`grace ${stroke.id} does not lead into an onset of this pattern`);
    }
    if (!Number.isInteger(stroke.order) || stroke.order < 0) {
      say(`grace ${stroke.id} needs a whole, non-negative order`);
    }
    const orders = graceOrders.get(stroke.beforeStrokeId) ?? new Set<number>();
    if (orders.has(stroke.order)) {
      say(`grace ${stroke.id} repeats an order before its onset`);
    }
    orders.add(stroke.order);
    graceOrders.set(stroke.beforeStrokeId, orders);
  }

  const groupIds = new Set<string>();
  for (const group of pattern.groups ?? []) {
    if (groupIds.has(group.id)) {
      say(`group id ${group.id} is used twice`);
    }
    groupIds.add(group.id);
    if (typeof group.id !== "string" || group.id.length === 0) {
      say("every group needs an id");
    }
    if (!GROUP_KINDS.includes(group.kind)) {
      say(`group ${group.id} has an unknown kind`);
    }
    if (!Array.isArray(group.strokeIds) || group.strokeIds.length === 0) {
      say(`group ${group.id} is empty`);
      continue;
    }
    for (const strokeId of group.strokeIds) {
      if (!ids.has(strokeId)) {
        say(`group ${group.id} names a missing stroke ${strokeId}`);
      }
    }
  }

  return problems;
}

export function validateRudiment(rudiment: Rudiment): string[] {
  const problems: string[] = [];
  if (rudiment.patterns.length === 0) {
    problems.push(`${rudiment.id}: needs at least one pattern`);
  }
  const keys = new Set<string>();
  for (const pattern of rudiment.patterns) {
    const key = `${pattern.id}@${pattern.version}`;
    if (keys.has(key)) {
      problems.push(`${rudiment.id}: pattern ${key} is defined twice`);
    }
    keys.add(key);
    problems.push(
      ...validatePattern(pattern).map((problem) => `${rudiment.id}/${problem}`),
    );
  }
  const hasDefault = rudiment.patterns.some(
    (pattern) =>
      pattern.id === rudiment.defaultPattern?.patternId &&
      pattern.version === rudiment.defaultPattern?.patternVersion,
  );
  if (!hasDefault) {
    problems.push(`${rudiment.id}: default pattern is not one of its patterns`);
  }
  if (rudiment.defaultTempo) {
    problems.push(
      ...validateTempo(rudiment.defaultTempo).map(
        (problem) => `${rudiment.id}: ${problem}`,
      ),
    );
  }
  return problems;
}
