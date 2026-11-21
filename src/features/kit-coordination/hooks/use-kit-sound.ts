import { useSampler } from "@/features/rudiments/hooks/use-stroke-sound";

const kitSamples = {
  36: require("@/assets/sounds/kit-kick.wav"),
  38: require("@/assets/sounds/snare-accent.wav"),
  44: require("@/assets/sounds/kit-hihat-pedal.wav"),
  51: require("@/assets/sounds/kit-ride.wav"),
} as const;

export type KitSampleNote = keyof typeof kitSamples;

export function hasKitSample(note: number): note is KitSampleNote {
  return note in kitSamples;
}

export function useKitSound() {
  return useSampler<`${KitSampleNote}`>(kitSamples);
}
