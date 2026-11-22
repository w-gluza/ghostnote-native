import type { Chokes } from "@/features/rudiments/domain/choke";
import { useSampler } from "@/features/rudiments/hooks/use-stroke-sound";

const kitSamples = {
  36: require("@/assets/sounds/kit-kick.wav"),
  38: require("@/assets/sounds/snare-accent.wav"),
  42: require("@/assets/sounds/kit-hihat-closed.wav"),
  44: require("@/assets/sounds/kit-hihat-pedal.wav"),
  45: require("@/assets/sounds/kit-floor-tom.wav"),
  46: require("@/assets/sounds/kit-hihat-open.wav"),
  48: require("@/assets/sounds/kit-rack-tom.wav"),
  51: require("@/assets/sounds/kit-ride.wav"),
} as const;

export type KitSampleNote = keyof typeof kitSamples;

export function hasKitSample(note: number): note is KitSampleNote {
  return note in kitSamples;
}

const hihatChokes: Chokes<`${KitSampleNote}`> = {
  42: ["46"],
  44: ["46"],
};

export function useKitSound() {
  return useSampler<`${KitSampleNote}`>(kitSamples, 0, hihatChokes);
}
