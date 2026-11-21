export type MidiNote = 36 | 38 | 42 | 44 | 45 | 47 | 48 | 49 | 51;

export type Velocity = 127 | 100 | 64 | 30;

const NOTE_NAMES: Record<MidiNote, string> = {
  49: "Crash",
  51: "Ride",
  42: "Hi-hat",
  44: "Hi-hat pedal",
  48: "High tom",
  47: "Mid tom",
  38: "Snare",
  45: "Floor tom",
  36: "Kick",
};

const VELOCITY_NAMES: Record<Velocity, string> = {
  127: "Accent",
  100: "Normal",
  64: "Ghost",
  30: "Very soft",
};

export function midiNoteName(note: MidiNote) {
  return NOTE_NAMES[note];
}

export function velocityName(velocity: Velocity) {
  return VELOCITY_NAMES[velocity];
}

export function velocityLevel(velocity: Velocity) {
  if (velocity >= 100) {
    return "full";
  }
  return velocity >= 64 ? "soft" : "grace";
}
