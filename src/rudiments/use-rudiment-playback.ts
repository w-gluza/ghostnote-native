import { useEffect, useRef, useState } from "react";

import { beatOfOrdinal, gapBeforeOrdinal, leadMs, msPerBeat } from "./timing";
import type { RudimentPattern } from "./types";

type PlaybackOptions = {
  pattern: RudimentPattern;
  bpm: number;
  clock?: () => number;
  onSchedule?: (index: number, timeMs: number) => void;
  onCancel?: () => void;
  onApproach?: (index: number, msUntilStroke: number) => void;
  onStroke?: (index: number) => void;
};

const LOOKAHEAD_MS = 150;
const TICK_MS = 25;
const START_DELAY_MS = 250;

const systemClock = () => performance.now();

export function useRudimentPlayback({
  pattern,
  bpm,
  clock = systemClock,
  onSchedule,
  onCancel,
  onApproach,
  onStroke,
}: PlaybackOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const nextOrdinal = useRef(0);
  const handlers = useRef({ onSchedule, onCancel, onApproach, onStroke });

  useEffect(() => {
    handlers.current = { onSchedule, onCancel, onApproach, onStroke };
  });

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const beat = msPerBeat(bpm);
    const anchorTime = clock() + START_DELAY_MS;
    const anchorBeat = beatOfOrdinal(pattern, nextOrdinal.current);
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let scheduledOrdinal = nextOrdinal.current;

    const later = (delayMs: number, run: () => void) => {
      const timer = setTimeout(
        () => {
          timers.delete(timer);
          run();
        },
        Math.max(0, delayMs),
      );
      timers.add(timer);
    };

    const scheduleDue = () => {
      for (;;) {
        const ordinal = scheduledOrdinal;
        const index = ordinal % pattern.strokes.length;
        const onset =
          anchorTime + (beatOfOrdinal(pattern, ordinal) - anchorBeat) * beat;
        const now = clock();
        if (onset > now + LOOKAHEAD_MS) {
          return;
        }

        handlers.current.onSchedule?.(index, onset);

        const heardIn = onset - now;
        const lead = leadMs(gapBeforeOrdinal(pattern, ordinal) * beat);
        later(heardIn - lead, () => {
          handlers.current.onApproach?.(index, Math.min(lead, heardIn));
        });
        later(heardIn, () => {
          nextOrdinal.current = ordinal + 1;
          setActiveIndex(index);
          handlers.current.onStroke?.(index);
        });

        scheduledOrdinal = ordinal + 1;
      }
    };

    scheduleDue();
    const ticker = setInterval(scheduleDue, TICK_MS);

    return () => {
      clearInterval(ticker);
      timers.forEach(clearTimeout);
      handlers.current.onCancel?.();
    };
  }, [isPlaying, bpm, pattern, clock]);

  return {
    isPlaying,
    activeIndex,
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    toggle: () => setIsPlaying((playing) => !playing),
  };
}
