import { useEffect, useState } from "react";
import {
  AudioContext,
  AudioManager,
  type AudioBufferSourceNode,
} from "react-native-audio-api";

import type { TimelineStroke } from "./timeline";

export type StrokeSound = {
  now: () => number;
  schedule: (stroke: TimelineStroke, timeMs: number) => void;
  cancel: () => void;
};

const tapSource = require("@/assets/sounds/click.wav");
const accentSource = require("@/assets/sounds/click-accent.wav");

type Pending = { source: AudioBufferSourceNode; timeMs: number };

export function useStrokeSound() {
  const [sound, setSound] = useState<StrokeSound>();

  useEffect(() => {
    let isActive = true;
    let pending: Pending[] = [];

    AudioManager.setSystemOptions({
      ios: { category: "playback", options: ["mixWithOthers"] },
    });
    const context = new AudioContext();
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
          schedule: (stroke, timeMs) => {
            const source = context.createBufferSource();
            source.buffer = stroke.accent ? accent : tap;
            source.connect(context.destination);
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
