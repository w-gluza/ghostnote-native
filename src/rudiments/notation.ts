import { add, fraction, ZERO } from "./fraction.ts";
import type {
  Fraction,
  Hand,
  OnsetStroke,
  RudimentPattern,
  Stroke,
  StrokeGroup,
} from "./types";

const TOKEN = /^(\()?(>|\.)?(z)?([lr]*)([RL])(?::(\d+)(?:\/(\d+))?)?(\))?$/;

type PatternSource = {
  id: string;
  label: string;
  version: number;
  subdivision: number;
  sticking: string;
};

export function parsePattern(source: PatternSource): RudimentPattern {
  const strokes: Stroke[] = [];
  const groups: StrokeGroup[] = [];
  const phrases = source.sticking.split("|").map((phrase) => phrase.trim());
  let position: Fraction = ZERO;
  let onsetCount = 0;
  let diddle: string[] | null = null;

  for (const phrase of phrases) {
    const phraseIds: string[] = [];

    for (const token of phrase.split(/\s+/)) {
      const match = TOKEN.exec(token);
      if (!match) {
        throw new Error(`Unreadable stroke "${token}" in ${source.id}`);
      }
      const [, opens, mark, bounce, grace, hand, units, parts, closes] = match;
      onsetCount += 1;
      const id = `s${onsetCount}`;

      [...(grace ?? "")].forEach((letter, index) => {
        strokes.push({
          id: `${id}g${index + 1}`,
          kind: "grace",
          hand: letter.toUpperCase() as Hand,
          beforeStrokeId: id,
          order: index,
        });
      });

      const onset: OnsetStroke = {
        id,
        kind: "onset",
        hand: hand as Hand,
        at: position,
      };
      if (mark) {
        onset.dynamics = mark === ">" ? "accent" : "ghost";
      }
      if (bounce) {
        onset.technique = "multiple-bounce";
      }
      strokes.push(onset);
      phraseIds.push(id);

      if (opens) {
        if (diddle) {
          throw new Error(`Nested diddle at "${token}" in ${source.id}`);
        }
        diddle = [];
      }
      diddle?.push(id);
      if (closes) {
        if (!diddle) {
          throw new Error(`Unopened diddle at "${token}" in ${source.id}`);
        }
        groups.push({
          id: `d${groups.filter((group) => group.kind === "diddle").length + 1}`,
          kind: "diddle",
          strokeIds: diddle,
        });
        diddle = null;
      }

      position = add(
        position,
        fraction(Number(units ?? 1), Number(parts ?? 1) * source.subdivision),
      );
    }

    if (diddle) {
      throw new Error(`Diddle crosses a phrase in ${source.id}`);
    }
    groups.push({
      id: `p${groups.filter((group) => group.kind === "phrase").length + 1}`,
      kind: "phrase",
      strokeIds: phraseIds,
    });
  }

  return {
    id: source.id,
    label: source.label,
    version: source.version,
    cycleDuration: position,
    strokes,
    groups,
  };
}
