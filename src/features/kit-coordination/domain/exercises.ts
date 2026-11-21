export type KitVoice = "ride" | "snare" | "kick" | "hihat-pedal";

export type KitExercise = {
  id: string;
  name: string;
  voices: KitVoice[];
};

const VOICE_NAMES: Record<KitVoice, string> = {
  ride: "Ride",
  snare: "Snare",
  kick: "Kick",
  "hihat-pedal": "Hi-hat pedal",
};

export const plannedKitExercises: KitExercise[] = [
  {
    id: "four-way-coordination",
    name: "Four-Way Coordination",
    voices: ["ride", "snare", "kick", "hihat-pedal"],
  },
];

export function voicesLabel(voices: KitVoice[]) {
  return voices.map((voice) => VOICE_NAMES[voice]).join(" · ");
}
