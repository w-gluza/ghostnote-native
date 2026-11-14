import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  AppState,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  useAnimatedValue,
  useWindowDimensions,
  View,
} from "react-native";

import {
  ACCENT_LIFT,
  PadAnimation,
  TAP_LIFT,
  type StickMotion,
} from "@/components/pad-animation";
import { PlayButton } from "@/components/play-button";
import { StickingPattern } from "@/components/sticking-pattern";
import {
  beatsUntilSameHand,
  clampBpm,
  MAX_BPM,
  MIN_BPM,
  msPerQuarterUnit,
  nextIndexOfHand,
} from "@/rudiments/timing";
import type { Timeline } from "@/rudiments/timeline";
import type { Tempo } from "@/rudiments/types";
import { useRudimentPlayback } from "@/rudiments/use-rudiment-playback";
import type { StrokeSound } from "@/rudiments/use-stroke-sound";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

type RudimentPlayerProps = {
  timeline: Timeline;
  initialTempo: Tempo;
  onActivity?: (isPlaying: boolean, tempo: Tempo) => void;
  sound?: StrokeSound;
  padScale?: number;
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

  const leaveForeground = useRef(() => {});
  useEffect(() => {
    leaveForeground.current = () => {
      if (playback.isPlaying) {
        isHeard.current = false;
        onActivity?.(false, tempo);
        playback.pause();
      }
    };
  });
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        leaveForeground.current();
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

      <View style={styles.tempo}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Decrease tempo"
          disabled={bpm <= MIN_BPM}
          onPress={() => changeBpm(bpm - BPM_STEP)}
          style={({ pressed }) => [styles.step, pressed && styles.pressed]}
        >
          <SymbolView
            name="minus"
            size={20}
            weight="medium"
            tintColor={colors.text.primary}
          />
        </Pressable>
        <View
          accessible
          accessibilityLabel={`${bpm} beats per minute`}
          style={styles.readout}
        >
          <Text style={styles.bpm}>{bpm}</Text>
          <Text style={styles.bpmLabel}>BPM</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Increase tempo"
          disabled={bpm >= MAX_BPM}
          onPress={() => changeBpm(bpm + BPM_STEP)}
          style={({ pressed }) => [styles.step, pressed && styles.pressed]}
        >
          <SymbolView
            name="plus"
            size={20}
            weight="medium"
            tintColor={colors.text.primary}
          />
        </Pressable>
      </View>

      <PlayButton isPlaying={playback.isPlaying} onPress={togglePlayback} />
    </View>
  );
}

const styles = StyleSheet.create({
  player: {
    alignItems: "center",
    gap: 24,
  },
  playerCompact: {
    gap: 16,
  },
  tempo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  step: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  readout: {
    minWidth: 72,
    alignItems: "center",
  },
  bpm: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.heading,
    fontVariant: ["tabular-nums"],
  },
  bpmLabel: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
});
