import { useEffect, useMemo, useRef, useState } from "react";
import {
  AudioContext,
  AudioManager,
  type AudioBuffer,
  type AudioBufferSourceNode,
  type GainNode,
} from "react-native-audio-api";

import { canBeChoked, chokedBy, type Chokes } from "../domain/choke";
import { hitsOf, type HitLevel } from "../domain/hits";
import type { StrokeVoice } from "../domain/stroke-voice-store";
import type { TimelineStroke } from "../domain/timeline";
import {
  useStrokeVoice,
  useStrokeVoiceSelections,
} from "../stores/stroke-voice";

type SampleSet<Name extends string> = Record<Name, number>;

type Samples = SampleSet<"tap" | "accent">;

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
const CHOKE_FADE_MS = 30;

const NO_CHOKES = {};

const SOUND_FAILED_MESSAGE =
  "The click sound could not be loaded, so playback is silent. Close and reopen the app to try again.";
const SOUND_SWITCH_FAILED_MESSAGE =
  "The new sound could not be loaded, so the previous one is still playing. Choose it again to retry.";

type Pending = { source: AudioBufferSourceNode; timeMs: number };

type Ringing<Name extends string> = Pending & { sample: Name; fader: GainNode };

export type SampleSound<Name extends string> = {
  now: () => number;
  play: (sample: Name, level: HitLevel, timeMs: number) => void;
  cancel: () => void;
};

export type ClickSound = SampleSound<"tap" | "accent">;

export type StrokeSound = {
  now: () => number;
  schedule: (stroke: TimelineStroke, timeMs: number, gapMs: number) => void;
  cancel: () => void;
};

type Buffers = Partial<Record<string, AudioBuffer>>;

type Engine<Name extends string> = {
  context: AudioContext;
  sound: SampleSound<Name>;
  use: (buffers: Buffers, chokes: Chokes<Name>) => void;
};

function createEngine<Name extends string>(): Engine<Name> {
  let pending: Pending[] = [];
  let buffers: Buffers | undefined;
  let chokes: Chokes<Name> = {};
  let ringing: Ringing<Name>[] = [];

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
    use: (next, nextChokes) => {
      buffers = next;
      chokes = nextChokes;
    },
    sound: {
      now,
      play: (sample, level, timeMs) => {
        const buffer = buffers?.[sample];
        if (!buffer || context.state === "closed") {
          return;
        }
        const startMs = Math.max(timeMs, now());
        chokedBy(ringing, chokes, sample, startMs).forEach((item) => {
          item.fader.gain.setValueAtTime(1, startMs / 1000);
          item.fader.gain.linearRampToValueAtTime(
            0,
            (startMs + CHOKE_FADE_MS) / 1000,
          );
          item.source.stop((startMs + CHOKE_FADE_MS) / 1000);
        });

        const source = context.createBufferSource();
        source.buffer = buffer;
        if (canBeChoked(chokes, sample)) {
          const fader = context.createGain();
          source.connect(fader);
          fader.connect(output[level]);
          ringing = ringing.filter(
            (item) => item.timeMs + buffer.duration * 1000 > now(),
          );
          ringing.push({ source, timeMs: startMs, sample, fader });
        } else {
          source.connect(output[level]);
        }
        source.start(startMs / 1000);
        pending = pending.filter((item) => item.timeMs > now());
        pending.push({ source, timeMs });
      },
      cancel: () => {
        const current = now();
        pending
          .filter((item) => item.timeMs > current)
          .forEach((item) => item.source.stop());
        pending = [];
        ringing = ringing.filter((item) => item.timeMs <= current);
      },
    },
  };
}

export function useSampler<Name extends string>(
  samples: SampleSet<Name>,
  attempt = 0,
  chokes: Chokes<Name> = NO_CHOKES,
) {
  const engine = useRef<Engine<Name>>(undefined);
  const [sound, setSound] = useState<SampleSound<Name>>();
  const [failed, setFailed] = useState<SampleSet<Name>>();

  useEffect(() => {
    const created = createEngine<Name>();
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

    const names = Object.keys(samples) as Name[];
    Promise.all([
      Promise.all(
        names.map((name) => current.context.decodeAudioData(samples[name])),
      ),
      current.context.resume(),
    ])
      .then(([decoded]) => {
        if (isActive) {
          current.use(
            Object.fromEntries(
              names.map((name, index) => [name, decoded[index]]),
            ),
            chokes,
          );
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
  }, [samples, attempt, chokes]);

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
