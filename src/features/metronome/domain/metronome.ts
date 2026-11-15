import {
  fraction,
  multiply,
  toNumber,
  type Fraction,
} from "../../rudiments/domain/fraction.ts";

export type BeatKind = "accent" | "normal" | "skipped";
export type ClickKind = "accent" | "normal" | "soft" | "silent";

export type Meter = { beats: number; noteValue: 4 | 8 };

export type MetronomeSettings = {
  bpm: number;
  meter: Meter;
  subdivision: number;
  beats: BeatKind[];
};

export type Click = { beat: number; beatIndex: number; kind: ClickKind };

export const MIN_BPM = 40;
export const MAX_BPM = 240;

export const METERS: Meter[] = [
  { beats: 2, noteValue: 4 },
  { beats: 3, noteValue: 4 },
  { beats: 4, noteValue: 4 },
  { beats: 5, noteValue: 4 },
  { beats: 6, noteValue: 8 },
];

const QUARTER_SUBDIVISIONS = [
  { clicks: 1, name: "Quarter notes" },
  { clicks: 2, name: "Eighth notes" },
  { clicks: 3, name: "Triplets" },
  { clicks: 4, name: "Sixteenth notes" },
];

const EIGHTH_SUBDIVISIONS = [
  { clicks: 1, name: "Eighth notes" },
  { clicks: 2, name: "Sixteenth notes" },
];

const KINDS: BeatKind[] = ["normal", "accent", "skipped"];

export function clampBpm(bpm: number) {
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(bpm)));
}

export function meterLabel(meter: Meter) {
  return `${meter.beats}/${meter.noteValue}`;
}

export function sameMeter(a: Meter, b: Meter) {
  return a.beats === b.beats && a.noteValue === b.noteValue;
}

export function beatUnit(meter: Meter): Fraction {
  return fraction(4, meter.noteValue);
}

export function pulseOf(meter: Meter): Fraction {
  const isCompound = meter.noteValue === 8 && meter.beats % 3 === 0;
  return isCompound ? fraction(3, 2) : beatUnit(meter);
}

export function subdivisionsFor(meter: Meter) {
  return meter.noteValue === 8 ? EIGHTH_SUBDIVISIONS : QUARTER_SUBDIVISIONS;
}

export function subdivisionName(settings: MetronomeSettings) {
  return (
    subdivisionsFor(settings.meter).find(
      (option) => option.clicks === settings.subdivision,
    )?.name ?? ""
  );
}

export function defaultBeats(meter: Meter): BeatKind[] {
  return Array.from({ length: meter.beats }, (_, index) =>
    index === 0 ? "accent" : "normal",
  );
}

export const defaultSettings: MetronomeSettings = {
  bpm: 120,
  meter: { beats: 4, noteValue: 4 },
  subdivision: 1,
  beats: defaultBeats({ beats: 4, noteValue: 4 }),
};

export function withMeter(
  settings: MetronomeSettings,
  meter: Meter,
): MetronomeSettings {
  const isOffered = subdivisionsFor(meter).some(
    (option) => option.clicks === settings.subdivision,
  );
  return {
    ...settings,
    meter,
    subdivision: isOffered ? settings.subdivision : 1,
    beats: defaultBeats(meter),
  };
}

export function withNextBeatKind(
  settings: MetronomeSettings,
  beatIndex: number,
): MetronomeSettings {
  return {
    ...settings,
    beats: settings.beats.map((kind, index) =>
      index === beatIndex
        ? (KINDS[(KINDS.indexOf(kind) + 1) % KINDS.length] ?? "normal")
        : kind,
    ),
  };
}

export function buildClicks(settings: MetronomeSettings) {
  const unit = beatUnit(settings.meter);
  const strokes: Click[] = settings.beats.flatMap((beatKind, beatIndex) => {
    const kind: ClickKind = beatKind === "skipped" ? "silent" : beatKind;
    return Array.from({ length: settings.subdivision }, (_, part): Click => {
      const position = multiply(
        unit,
        fraction(beatIndex * settings.subdivision + part, settings.subdivision),
      );
      const sounding: ClickKind =
        part === 0 || kind === "silent" ? kind : "soft";
      return {
        beat: toNumber(position),
        beatIndex,
        kind: sounding,
      };
    });
  });
  return {
    cycleBeats: toNumber(multiply(unit, fraction(settings.beats.length))),
    strokes,
  };
}

export function tempoOf(settings: MetronomeSettings) {
  return { bpm: settings.bpm, pulseQuarterUnits: pulseOf(settings.meter) };
}

export function isMetronomeSettings(
  value: unknown,
): value is MetronomeSettings {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const { bpm, meter, subdivision, beats } = value as Record<string, unknown>;
  const known =
    typeof meter === "object" && meter !== null
      ? METERS.find((option) => sameMeter(option, meter as Meter))
      : undefined;
  return (
    typeof bpm === "number" &&
    bpm === clampBpm(bpm) &&
    known !== undefined &&
    subdivisionsFor(known).some((option) => option.clicks === subdivision) &&
    Array.isArray(beats) &&
    beats.length === known.beats &&
    beats.every((kind) => KINDS.includes(kind as BeatKind))
  );
}
