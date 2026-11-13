import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  useAnimatedValue,
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
  msPerBeat,
  nextIndexOfHand,
} from "@/rudiments/timing";
import type { RudimentPattern, StrokeSound } from "@/rudiments/types";
import { useRudimentPlayback } from "@/rudiments/use-rudiment-playback";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

type RudimentPlayerProps = {
  pattern: RudimentPattern;
  initialBpm: number;
  sound?: StrokeSound;
};

const BPM_STEP = 5;
const MAX_RETURN_MS = 500;
const RETURN_SHARE = 0.55;
const RIPPLE_MS = 280;

export function RudimentPlayer({
  pattern,
  initialBpm,
  sound,
}: RudimentPlayerProps) {
  const [bpm, setBpm] = useState(clampBpm(initialBpm));

  const left: StickMotion = {
    lift: useAnimatedValue(TAP_LIFT),
    ripple: useAnimatedValue(1),
  };
  const right: StickMotion = {
    lift: useAnimatedValue(TAP_LIFT),
    ripple: useAnimatedValue(1),
  };
  const motionOf = (index: number) =>
    pattern.strokes[index]?.hand === "L" ? left : right;

  const playback = useRudimentPlayback({
    pattern,
    bpm: bpm,
    clock: sound?.now,
    onSchedule: (index, timeMs) => {
      const stroke = pattern.strokes[index];
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
      const stroke = pattern.strokes[index];
      if (!stroke) {
        return;
      }
      const motion = motionOf(index);
      const nextOfHand = pattern.strokes[nextIndexOfHand(pattern, index)];
      const sameHandGapMs = beatsUntilSameHand(pattern, index) * msPerBeat(bpm);

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

  const activeStroke =
    playback.activeIndex === null
      ? null
      : pattern.strokes[playback.activeIndex];
  const sticking = pattern.strokes.map((stroke) => stroke.hand).join(" ");

  return (
    <View style={styles.player}>
      <PadAnimation
        left={left}
        right={right}
        activeHand={playback.isPlaying ? (activeStroke?.hand ?? null) : null}
        label={`Practice pad animation, sticking ${sticking}`}
      />

      <StickingPattern
        pattern={pattern}
        activeIndex={playback.isPlaying ? playback.activeIndex : null}
      />

      <View style={styles.tempo}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Decrease tempo"
          disabled={bpm <= MIN_BPM}
          onPress={() => setBpm((value) => clampBpm(value - BPM_STEP))}
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
          onPress={() => setBpm((value) => clampBpm(value + BPM_STEP))}
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

      <PlayButton isPlaying={playback.isPlaying} onPress={playback.toggle} />
    </View>
  );
}

const styles = StyleSheet.create({
  player: {
    alignItems: "center",
    gap: 24,
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
