import { useSampler, type SampleSet } from "@/playback/use-sampler";

const clickSamples: SampleSet<"tap" | "accent"> = {
  tap: require("@/assets/sounds/click/tap.wav"),
  accent: require("@/assets/sounds/click/accent.wav"),
};

export function useClickSound() {
  return useSampler(clickSamples);
}
