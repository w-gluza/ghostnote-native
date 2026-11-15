import { useEffect, useMemo, useState } from "react";
import {
  AudioContext,
  AudioManager,
  type AudioBufferSourceNode,
} from "react-native-audio-api";

import type { TimelineStroke } from "../domain/timeline";

const tapSource = require("@/assets/sounds/click.wav");
const accentSource = require("@/assets/sounds/click-accent.wav");

const SOFT_GAIN = 0.4;

type Pending = { source: AudioBufferSourceNode; timeMs: number };

export type ClickSound = {
  now: () => number;
  play: (
    sample: "tap" | "accent",
    level: "full" | "soft",
    timeMs: number,
  ) => void;
  cancel: () => void;
};

export type StrokeSound = {
  now: () => number;
  schedule: (stroke: TimelineStroke, timeMs: number) => void;
  cancel: () => void;
};

export function useClickSound() {
  const [sound, setSound] = useState<ClickSound>();

  useEffect(() => {
    let isActive = true;
    let pending: Pending[] = [];

    AudioManager.setSystemOptions({
      ios: { category: "playback", options: ["mixWithOthers"] },
    });
    const context = new AudioContext();
    const soft = context.createGain();
    soft.gain.value = SOFT_GAIN;
    soft.connect(context.destination);
    const now = () => context.currentTime * 1000;

    Promise.all([
      context.decodeAudioData(tapSource),
      context.decodeAudioData(accentSource),
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
            source.connect(level === "soft" ? soft : context.destination);
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
      .catch(() => {});

    return () => {
      isActive = false;
      context.close().catch(() => {});
    };
  }, []);

  return sound;
}

export function useStrokeSound() {
  const click = useClickSound();

  return useMemo<StrokeSound | undefined>(
    () =>
      click
        ? {
            now: click.now,
            schedule: (stroke, timeMs) =>
              click.play(stroke.accent ? "accent" : "tap", "full", timeMs),
            cancel: click.cancel,
          }
        : undefined,
    [click],
  );
}
