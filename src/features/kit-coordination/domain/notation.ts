import { fraction, ONE } from "../../../playback/fraction.ts";
import type { MidiNote, Velocity } from "./midi-map.ts";
import type { KitEvent, KitPattern, Limb } from "./types";

export const RIDE = 51;
export const SNARE = 38;
export const KICK = 36;
export const HIHAT = 42;
export const HIHAT_PEDAL = 44;
export const OPEN_HIHAT = 46;
export const RACK_TOM = 48;
export const FLOOR_TOM = 45;
export const NORMAL: Velocity = 100;
export const GHOST: Velocity = 64;

export const EIGHTHS = 2;
export const TRIPLETS = 3;
export const SIXTEENTHS = 4;
export const ALL_EIGHTHS = [0, 1, 2, 3, 4, 5, 6, 7];

export function part(
  note: MidiNote,
  limb: Limb,
  steps: number[],
  stepsPerBeat: number,
  velocity = NORMAL,
) {
  return steps.map((step): KitEvent => ({
    id: `${note}-${step}`,
    note,
    velocity,
    limb,
    at: fraction(step, stepsPerBeat),
  }));
}

export function pattern(
  beats: number,
  stepsPerBeat: number,
  events: KitEvent[],
): KitPattern {
  return {
    id: "standard",
    version: 1,
    timeSignature: { beats, unit: 4 },
    stepsPerBeat,
    cycleDuration: fraction(beats),
    events,
  };
}

export function tempo(bpm: number) {
  return { bpm, pulseQuarterUnits: ONE };
}
