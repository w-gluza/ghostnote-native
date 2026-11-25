import {
  compare,
  isReduced,
  ZERO,
  type Fraction,
} from "../../../playback/fraction.ts";
import type { PatternReference } from "./types";

const DYNAMICS = ["normal", "ghost", "accent"];
const HANDS = ["R", "L"];
const GROUP_KINDS = ["phrase", "diddle"];

type Fields = Record<string, unknown>;

export function isFields(value: unknown): value is Fields {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isName(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isFraction(value: unknown): value is Fraction {
  return (
    isFields(value) &&
    typeof value.numerator === "number" &&
    typeof value.denominator === "number" &&
    isReduced(value as Fraction)
  );
}

export function isPositive(value: unknown): value is Fraction {
  return isFraction(value) && compare(value, ZERO) > 0;
}

export function isPatternReference(value: unknown): value is PatternReference {
  return (
    isFields(value) &&
    isName(value.rudimentId) &&
    isName(value.patternId) &&
    typeof value.patternVersion === "number" &&
    Number.isInteger(value.patternVersion)
  );
}

export function validateTempo(tempo: unknown): string[] {
  if (!isFields(tempo)) {
    return ["tempo must be an object"];
  }
  const problems: string[] = [];
  if (
    typeof tempo.bpm !== "number" ||
    !Number.isFinite(tempo.bpm) ||
    tempo.bpm <= 0
  ) {
    problems.push("tempo needs a finite, positive bpm");
  }
  if (!isPositive(tempo.pulseQuarterUnits)) {
    problems.push("tempo needs a positive, reduced pulse");
  }
  return problems;
}

export function validatePattern(pattern: unknown): string[] {
  if (!isFields(pattern)) {
    return ["pattern must be an object"];
  }
  const problems: string[] = [];
  const name = isName(pattern.id) ? pattern.id : "pattern";
  const say = (problem: string) => problems.push(`${name}: ${problem}`);

  if (!isName(pattern.id)) {
    say("needs an id");
  }
  if (!isName(pattern.label)) {
    say("needs a label");
  }
  if (
    typeof pattern.version !== "number" ||
    !Number.isInteger(pattern.version) ||
    pattern.version < 1
  ) {
    say("version must be a whole number from 1");
  }
  const cycle = isPositive(pattern.cycleDuration)
    ? pattern.cycleDuration
    : undefined;
  if (!cycle) {
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

  const strokes: Fields[] = [];
  for (const stroke of pattern.strokes as unknown[]) {
    if (isFields(stroke) && isName(stroke.id)) {
      strokes.push(stroke);
    } else {
      say("every stroke must be an object with an id");
    }
  }

  const ids = new Set<unknown>();
  const onsetIds = new Set<unknown>();
  for (const stroke of strokes) {
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

  const graceOrders = new Map<unknown, Set<unknown>>();
  for (const stroke of strokes) {
    if (!HANDS.includes(stroke.hand as string)) {
      say(`${stroke.id} has an unknown hand`);
    }

    if (stroke.kind === "onset") {
      if (!isFraction(stroke.at)) {
        say(`${stroke.id} position is not a reduced fraction`);
      } else if (
        compare(stroke.at, ZERO) < 0 ||
        (cycle && compare(stroke.at, cycle) >= 0)
      ) {
        say(`${stroke.id} sits outside the cycle`);
      }
      if (
        stroke.dynamics !== undefined &&
        !DYNAMICS.includes(stroke.dynamics as string)
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
      say(`${stroke.id} has an unknown kind`);
      continue;
    }

    if (!onsetIds.has(stroke.beforeStrokeId)) {
      say(`grace ${stroke.id} does not lead into an onset of this pattern`);
    }
    if (
      typeof stroke.order !== "number" ||
      !Number.isInteger(stroke.order) ||
      stroke.order < 0
    ) {
      say(`grace ${stroke.id} needs a whole, non-negative order`);
    }
    const orders = graceOrders.get(stroke.beforeStrokeId) ?? new Set();
    if (orders.has(stroke.order)) {
      say(`grace ${stroke.id} repeats an order before its onset`);
    }
    orders.add(stroke.order);
    graceOrders.set(stroke.beforeStrokeId, orders);
  }

  const groupIds = new Set<unknown>();
  for (const group of (pattern.groups ?? []) as unknown[]) {
    if (!isFields(group) || !isName(group.id)) {
      say("every group must be an object with an id");
      continue;
    }
    if (groupIds.has(group.id)) {
      say(`group id ${group.id} is used twice`);
    }
    groupIds.add(group.id);
    if (!GROUP_KINDS.includes(group.kind as string)) {
      say(`group ${group.id} has an unknown kind`);
    }
    if (!Array.isArray(group.strokeIds) || group.strokeIds.length === 0) {
      say(`group ${group.id} is empty`);
      continue;
    }
    for (const strokeId of group.strokeIds as unknown[]) {
      if (!ids.has(strokeId)) {
        say(`group ${group.id} names a missing stroke ${String(strokeId)}`);
      }
    }
  }

  return problems;
}

export function validateRudiment(rudiment: unknown): string[] {
  if (!isFields(rudiment)) {
    return ["rudiment must be an object"];
  }
  const name = isName(rudiment.id) ? rudiment.id : "rudiment";
  const problems: string[] = [];
  if (!isName(rudiment.id)) {
    problems.push(`${name}: needs an id`);
  }
  if (!isName(rudiment.name)) {
    problems.push(`${name}: needs a name`);
  }
  if (!Array.isArray(rudiment.patterns) || rudiment.patterns.length === 0) {
    problems.push(`${name}: needs at least one pattern`);
    return problems;
  }

  const keys = new Set<string>();
  for (const pattern of rudiment.patterns as unknown[]) {
    if (isFields(pattern)) {
      const key = `${String(pattern.id)}@${String(pattern.version)}`;
      if (keys.has(key)) {
        problems.push(`${name}: pattern ${key} is defined twice`);
      }
      keys.add(key);
    }
    problems.push(
      ...validatePattern(pattern).map((problem) => `${name}/${problem}`),
    );
  }

  const chosen = rudiment.defaultPattern;
  const hasDefault =
    isFields(chosen) &&
    keys.has(`${String(chosen.patternId)}@${String(chosen.patternVersion)}`);
  if (!hasDefault) {
    problems.push(`${name}: default pattern is not one of its patterns`);
  }
  if (rudiment.defaultTempo !== undefined) {
    problems.push(
      ...validateTempo(rudiment.defaultTempo).map(
        (problem) => `${name}: ${problem}`,
      ),
    );
  }
  return problems;
}
