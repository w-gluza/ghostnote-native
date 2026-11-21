import { useEffect, useMemo, useRef, useState } from "react";
import {
  AudioContext,
  AudioManager,
  type AudioBuffer,
  type AudioBufferSourceNode,
} from "react-native-audio-api";

import { hitsOf, type HitLevel } from "../domain/hits";
import type { StrokeVoice } from "../domain/stroke-voice-store";
import type { TimelineStroke } from "../domain/timeline";
import {
  useStrokeVoice,
  useStrokeVoiceSelections,
} from "../stores/stroke-voice";

type Samples = { tap: number; accent: number };

const clickSamples: Samples = {
  tap: require("@/assets/sounds/click.wav"),
  accent: require("@/assets/sounds/click-accent.wav"),
};
const strokeSamples: Record<StrokeVoice, Samples> = {
  pad: {
    tap: require("@/assets/sounds/pad-tap.wav"),
    accent: require("@/assets/sounds/pad-accent.wav"),
  },
  snare: {
    tap: require("@/assets/sounds/snare-tap.wav"),
    accent: require("@/assets/sounds/snare-accent.wav"),
  },
};

const GAIN: Record<HitLevel, number> = { full: 1, soft: 0.4, grace: 0.22 };

const SOUND_FAILED_MESSAGE =
  "The click sound could not be loaded, so playback is silent. Close and reopen the app to try again.";
const SOUND_SWITCH_FAILED_MESSAGE =
  "The new sound could not be loaded, so the previous one is still playing. Choose it again to retry.";

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

type Buffers = Record<keyof Samples, AudioBuffer>;

type Engine = {
  context: AudioContext;
  sound: ClickSound;
  use: (buffers: Buffers) => void;
};

function createEngine(): Engine {
  let pending: Pending[] = [];
  let buffers: Buffers | undefined;

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

  return {
    context,
    use: (next) => {
      buffers = next;
    },
    sound: {
      now,
      play: (sample, level, timeMs) => {
        if (!buffers || context.state === "closed") {
          return;
        }
        const source = context.createBufferSource();
        source.buffer = buffers[sample];
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
    },
  };
}

function useSampler(samples: Samples, attempt = 0) {
  const engine = useRef<Engine>(undefined);
  const [sound, setSound] = useState<ClickSound>();
  const [failed, setFailed] = useState<Samples>();

  useEffect(() => {
    const created = createEngine();
    engine.current = created;
    return () => {
      engine.current = undefined;
      created.context.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const current = engine.current;
    if (!current) {
      return;
    }
    let isActive = true;

    Promise.all([
      current.context.decodeAudioData(samples.tap),
      current.context.decodeAudioData(samples.accent),
      current.context.resume(),
    ])
      .then(([tap, accent]) => {
        if (isActive) {
          current.use({ tap, accent });
          setSound(current.sound);
          setFailed(undefined);
        }
      })
      .catch(() => {
        if (isActive) {
          setFailed(samples);
        }
      });

    return () => {
      isActive = false;
    };
  }, [samples, attempt]);

  const hasFailed = failed === samples;
  const working = sound ? SOUND_SWITCH_FAILED_MESSAGE : SOUND_FAILED_MESSAGE;
  return { sound, problem: hasFailed ? working : undefined };
}

export function useClickSound() {
  return useSampler(clickSamples);
}

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
