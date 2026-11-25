import type { Fraction } from "../../../playback/fraction";
import type { Tempo } from "../../../playback/timing";
import type { MidiNote, Velocity } from "./midi-map";

export type Limb = "right-hand" | "left-hand" | "right-foot" | "left-foot";

export type KitEvent = {
  id: string;
  note: MidiNote;
  velocity: Velocity;
  limb: Limb;
  at: Fraction;
};

export type KitPattern = {
  id: string;
  version: number;
  timeSignature: { beats: number; unit: number };
  stepsPerBeat: number;
  cycleDuration: Fraction;
  events: KitEvent[];
};

export type KitStage = {
  id: string;
  title: string;
  notes: MidiNote[];
};

export type KitExercise = {
  id: string;
  kind: "coordination";
  name: string;
  level: number;
  defaultTempo: Tempo;
  pattern: KitPattern;
  stages: KitStage[];
};
