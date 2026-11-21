import { useEffect, useMemo, useState } from "react";
import {
  AudioContext,
  AudioManager,
  type AudioBufferSourceNode,
} from "react-native-audio-api";

import { hitsOf, type HitLevel } from "../domain/hits";
import type { TimelineStroke } from "../domain/timeline";

type Samples = { tap: number; accent: number };

const clickSamples: Samples = {
  tap: require("@/assets/sounds/click.wav"),
  accent: require("@/assets/sounds/click-accent.wav"),
};
const padSamples: Samples = {
  tap: require("@/assets/sounds/pad-tap.wav"),
  accent: require("@/assets/sounds/pad-accent.wav"),
};

const GAIN: Record<HitLevel, number> = { full: 1, soft: 0.4, grace: 0.22 };

export const SOUND_FAILED_MESSAGE =
  "The click sound could not be loaded, so playback is silent. Close and reopen the app to try again.";

type Pending = { source: AudioBufferSourceNode; timeMs: number };

export type ClickSound = {
  now: () => number;
  play: (sample: keyof Samples, level: HitLevel, timeMs: number) => void;
  cancel: () => void;
};

export type StrokeSound = {
  now: () => number;
  schedule: (stroke: TimelineStroke, timeMs: number, gapMs: number) => void;
  cancel: () => void;
};

function useSampler(samples: Samples) {
  const [sound, setSound] = useState<ClickSound>();
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    let isActive = true;
    let pending: Pending[] = [];

    AudioManager.setSystemOptions({
      ios: { category: "playback", options: ["mixWithOthers"] },
    });
    const context = new AudioContext();
    const quiet = (level: "soft" | "grace") => {
      const node = context.createGain();
      node.gain.value = GAIN[level];
      node.connect(context.destination);
      return node;
    };
    const output = {
      full: context.destination,
      soft: quiet("soft"),
      grace: quiet("grace"),
    };
    const now = () => context.currentTime * 1000;

    Promise.all([
      context.decodeAudioData(samples.tap),
      context.decodeAudioData(samples.accent),
      context.resume(),
    ])
      .then(([tap, accent]) => {
        if (!isActive) {
          return;
        }
        setSound({
          now,
          play: (sample, level, timeMs) => {
            const source = context.createBufferSource();
            source.buffer = sample === "accent" ? accent : tap;
            source.connect(output[level]);
            source.start(Math.max(timeMs, now()) / 1000);
            pending = pending.filter((item) => item.timeMs > now());
            pending.push({ source, timeMs });
          },
          cancel: () => {
            const current = now();
            pending
              .filter((item) => item.timeMs > current)
              .forEach((item) => item.source.stop());
            pending = [];
          },
        });
      })
      .catch(() => {
        if (isActive) {
          setHasFailed(true);
        }
      });

    return () => {
      isActive = false;
      context.close().catch(() => {});
    };
  }, [samples]);

  return { sound, hasFailed };
}

export function useClickSound() {
  return useSampler(clickSamples);
}

export function useStrokeSound() {
  const { sound: click, hasFailed } = useSampler(padSamples);

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

  return { sound, hasFailed };
}
