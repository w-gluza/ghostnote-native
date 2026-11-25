import { useMemo } from "react";

import { useSampler, type SampleSet } from "@/playback/use-sampler";

import { hitsOf } from "../domain/hits";
import type { StrokeVoice } from "../domain/stroke-voice-store";
import type { TimelineStroke } from "../domain/timeline";
import {
  useStrokeVoice,
  useStrokeVoiceSelections,
} from "../stores/stroke-voice";

const strokeSamples: Record<StrokeVoice, SampleSet<"tap" | "accent">> = {
  pad: {
    tap: require("@/assets/sounds/pad/tap.wav"),
    accent: require("@/assets/sounds/pad/accent.wav"),
  },
  snare: {
    tap: require("@/assets/sounds/kit/snare/tap.wav"),
    accent: require("@/assets/sounds/kit/snare/accent.wav"),
  },
};

export type StrokeSound = {
  now: () => number;
  schedule: (stroke: TimelineStroke, timeMs: number, gapMs: number) => void;
  cancel: () => void;
};

export function useStrokeSound() {
  const voice = useStrokeVoice();
  const selections = useStrokeVoiceSelections();
  const { sound: click, problem } = useSampler(
    strokeSamples[voice],
    selections,
  );

  const sound = useMemo<StrokeSound | undefined>(
    () =>
      click
        ? {
            now: click.now,
            schedule: (stroke, timeMs, gapMs) =>
              hitsOf(stroke, gapMs).forEach((hit) =>
                click.play(hit.sample, hit.level, timeMs + hit.offsetMs),
              ),
            cancel: click.cancel,
          }
        : undefined,
    [click],
  );

  return { sound, problem };
}
