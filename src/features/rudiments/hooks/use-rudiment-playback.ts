import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useEffect, useId, useRef, useState } from "react";

import {
  beatOfOrdinal,
  gapBeforeOrdinal,
  leadMs,
  msPerQuarterUnit,
  onsetAt,
  retimed,
  type Anchor,
  type Loop,
} from "../domain/timing";
import type { Tempo } from "../domain/types";

type PlaybackOptions = {
  timeline: Loop;
  tempo: Tempo;
  clock?: () => number;
  restartOnPlay?: boolean;
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
  timeline,
  tempo,
  clock = systemClock,
  restartOnPlay = false,
  onSchedule,
  onCancel,
  onApproach,
  onStroke,
}: PlaybackOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const nextOrdinal = useRef(0);
  const playedTimeline = useRef(timeline);
  const unitMs = msPerQuarterUnit(tempo);
  const unit = useRef(unitMs);
  const handlers = useRef({ onSchedule, onCancel, onApproach, onStroke });

  useEffect(() => {
    unit.current = unitMs;
    handlers.current = { onSchedule, onCancel, onApproach, onStroke };
  });

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    if (restartOnPlay || playedTimeline.current !== timeline) {
      nextOrdinal.current = 0;
    }
    playedTimeline.current = timeline;

    const firstOrdinal = nextOrdinal.current;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let scheduledOrdinal = firstOrdinal;
    let anchor: Anchor = {
      time: clock() + START_DELAY_MS,
      beat: beatOfOrdinal(timeline, firstOrdinal),
      unitMs: unit.current,
    };

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
      if (unit.current !== anchor.unitMs) {
        anchor =
          scheduledOrdinal > firstOrdinal
            ? retimed(anchor, timeline, scheduledOrdinal - 1, unit.current)
            : { ...anchor, unitMs: unit.current };
      }

      for (;;) {
        const ordinal = scheduledOrdinal;
        const index = ordinal % timeline.strokes.length;
        const onset = onsetAt(anchor, timeline, ordinal);
        const now = clock();
        if (onset > now + LOOKAHEAD_MS) {
          return;
        }

        handlers.current.onSchedule?.(index, onset);

        const heardIn = onset - now;
        const lead = leadMs(
          gapBeforeOrdinal(timeline, ordinal) * anchor.unitMs,
        );
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
  }, [isPlaying, timeline, clock, restartOnPlay]);

  const keepAwakeTag = useId();
  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    activateKeepAwakeAsync(keepAwakeTag).catch(() => undefined);
    return () => {
      deactivateKeepAwake(keepAwakeTag).catch(() => undefined);
    };
  }, [isPlaying, keepAwakeTag]);

  return {
    isPlaying,
    activeIndex,
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    toggle: () => setIsPlaying((playing) => !playing),
  };
}
