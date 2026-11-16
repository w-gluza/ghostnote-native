import { useIsFocused } from "expo-router";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Animated,
  AppState,
  Easing,
  StyleSheet,
  useAnimatedValue,
  useWindowDimensions,
  View,
} from "react-native";

import { Stat } from "@/components/Stat/Stat";
import { TempoStepper } from "@/components/TempoStepper/TempoStepper";
import {
  ACCENT_LIFT,
  PadAnimation,
  TAP_LIFT,
  type StickMotion,
} from "@/features/rudiments/components/PadAnimation/PadAnimation";
import { PlayButton } from "@/components/PlayButton/PlayButton";
import { StickingPattern } from "@/features/rudiments/components/StickingPattern/StickingPattern";
import {
  beatsUntilSameHand,
  clampBpm,
  MAX_BPM,
  MIN_BPM,
  msPerQuarterUnit,
  nextIndexOfHand,
} from "@/features/rudiments/domain/timing";
import type { Timeline } from "@/features/rudiments/domain/timeline";
import type { Tempo } from "@/features/rudiments/domain/types";
import { useRudimentPlayback } from "@/features/rudiments/hooks/use-rudiment-playback";
import type { StrokeSound } from "@/features/rudiments/hooks/use-stroke-sound";
import { spacing } from "@/theme/layout";

type RudimentPlayerProps = {
  timeline: Timeline;
  initialTempo: Tempo;
  onActivity?: (isPlaying: boolean, tempo: Tempo) => void;
  sound?: StrokeSound;
  padScale?: number;
  children?: ReactNode;
};

const BPM_STEP = 5;
const COMPACT_HEIGHT = 850;
const MAX_RETURN_MS = 500;
const RETURN_SHARE = 0.55;
const RIPPLE_MS = 280;

export function RudimentPlayer({
  timeline,
  initialTempo,
  onActivity,
  sound,
  padScale = 1,
  children,
}: RudimentPlayerProps) {
  const { height } = useWindowDimensions();
  const isCompact = height < COMPACT_HEIGHT;
  const [bpm, setBpm] = useState(clampBpm(initialTempo.bpm));
  const tempo: Tempo = {
    bpm,
    pulseQuarterUnits: initialTempo.pulseQuarterUnits,
  };

  const left: StickMotion = {
    lift: useAnimatedValue(TAP_LIFT),
    ripple: useAnimatedValue(1),
  };
  const right: StickMotion = {
    lift: useAnimatedValue(TAP_LIFT),
    ripple: useAnimatedValue(1),
  };
  const motionOf = (index: number) =>
    timeline.strokes[index]?.hand === "L" ? left : right;

  const isHeard = useRef(false);

  const playback = useRudimentPlayback({
    timeline,
    tempo,
    clock: sound?.now,
    onSchedule: (index, timeMs) => {
      const stroke = timeline.strokes[index];
      if (stroke) {
        sound?.schedule(stroke, timeMs);
      }
    },
    onCancel: sound?.cancel,
    onApproach: (index, msUntilStroke) => {
      Animated.timing(motionOf(index).lift, {
        toValue: 0,
        duration: msUntilStroke,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start();
    },
    onStroke: (index) => {
      const stroke = timeline.strokes[index];
      if (!stroke) {
        return;
      }
      if (!isHeard.current) {
        isHeard.current = true;
        onActivity?.(true, tempo);
      }
      const motion = motionOf(index);
      const nextOfHand = timeline.strokes[nextIndexOfHand(timeline, index)];
      const sameHandGapMs =
        beatsUntilSameHand(timeline, index) * msPerQuarterUnit(tempo);

      motion.ripple.setValue(0);
      Animated.parallel([
        Animated.timing(motion.ripple, {
          toValue: 1,
          duration: RIPPLE_MS,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(motion.lift, {
          toValue: nextOfHand?.accent ? ACCENT_LIFT : TAP_LIFT,
          duration: Math.min(MAX_RETURN_MS, sameHandGapMs * RETURN_SHARE),
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    },
  });

  const changeBpm = (value: number) => {
    const next = clampBpm(value);
    setBpm(next);
    onActivity?.(isHeard.current, { ...tempo, bpm: next });
  };
  const togglePlayback = () => {
    if (playback.isPlaying) {
      isHeard.current = false;
      onActivity?.(false, tempo);
    }
    playback.toggle();
  };

  const leaveForeground = useEffectEvent(() => {
    if (playback.isPlaying) {
      isHeard.current = false;
      onActivity?.(false, tempo);
      playback.pause();
    }
  });
  const isFocused = useIsFocused();
  useEffect(() => {
    if (!isFocused) {
      leaveForeground();
    }
  }, [isFocused]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        leaveForeground();
      }
    });
    return () => subscription.remove();
  }, []);

  const activeStroke =
    playback.activeIndex === null
      ? null
      : timeline.strokes[playback.activeIndex];
  const sticking = timeline.strokes.map((stroke) => stroke.hand).join(" ");

  return (
    <View style={[styles.player, isCompact && styles.playerCompact]}>
      <PadAnimation
        left={left}
        right={right}
        activeHand={playback.isPlaying ? (activeStroke?.hand ?? null) : null}
        label={`Practice pad animation, sticking ${sticking}`}
        scale={padScale}
      />

      <StickingPattern
        timeline={timeline}
        activeIndex={playback.isPlaying ? playback.activeIndex : null}
      />

      <TempoStepper
        canDecrease={bpm > MIN_BPM}
        canIncrease={bpm < MAX_BPM}
        onDecrease={() => changeBpm(bpm - BPM_STEP)}
        onIncrease={() => changeBpm(bpm + BPM_STEP)}
      >
        <Stat
          value={bpm}
          label="BPM"
          accessibilityLabel={`${bpm} beats per minute`}
          style={styles.readout}
        />
      </TempoStepper>

      <PlayButton isPlaying={playback.isPlaying} onPress={togglePlayback} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  player: {
    alignItems: "center",
    gap: spacing.xl,
  },
  playerCompact: {
    gap: spacing.lg,
  },
  readout: {
    minWidth: 72,
  },
});
