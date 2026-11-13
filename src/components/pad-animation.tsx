import { Animated, StyleSheet, Text, View } from "react-native";

import type { Hand } from "@/rudiments/types";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

export type StickMotion = {
  lift: Animated.Value;
  ripple: Animated.Value;
};

type PadAnimationProps = {
  left: StickMotion;
  right: StickMotion;
  activeHand: Hand | null;
  label: string;
};

const STAGE_WIDTH = 280;
const STAGE_HEIGHT = 300;
const PAD_SIZE = 200;
const STICK_LENGTH = 197;
const STICK_WIDTH = 8;
const TIP_SIZE = 12;
const RIPPLE_SIZE = 40;
const CONTACT_ANGLE = 24;
const LIFT_ANGLE = 9;
const BUTT_INSET = 40;
const CONTACT_Y = 120;
const CONTACT_OFFSET = 20;

export const TAP_LIFT = 1;
export const ACCENT_LIFT = 2;

function Stick({
  hand,
  motion,
  isActive,
}: {
  hand: Hand;
  motion: StickMotion;
  isActive: boolean;
}) {
  const direction = hand === "L" ? 1 : -1;
  const rotate = motion.lift.interpolate({
    inputRange: [0, ACCENT_LIFT],
    outputRange: [
      `${direction * CONTACT_ANGLE}deg`,
      `${direction * (CONTACT_ANGLE - LIFT_ANGLE * ACCENT_LIFT)}deg`,
    ],
  });
  const tone = isActive ? styles.active : styles.resting;

  return (
    <Animated.View
      style={[
        styles.stick,
        hand === "L" ? styles.stickLeft : styles.stickRight,
        { transform: [{ rotate }] },
      ]}
    >
      <View style={[styles.tip, tone]} />
      <View style={[styles.shaft, tone]} />
    </Animated.View>
  );
}

function Ripple({ hand, motion }: { hand: Hand; motion: StickMotion }) {
  const scale = motion.ripple.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1.8],
  });
  const opacity = motion.ripple.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [0, 0.9, 0],
  });

  return (
    <Animated.View
      style={[
        styles.ripple,
        hand === "L" ? styles.rippleLeft : styles.rippleRight,
        { opacity, transform: [{ scale }] },
      ]}
    />
  );
}

export function PadAnimation({
  left,
  right,
  activeHand,
  label,
}: PadAnimationProps) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label}>
      <View style={styles.stage}>
        <View style={styles.pad}>
          <View style={styles.padRing} />
        </View>
        <Ripple hand="L" motion={left} />
        <Ripple hand="R" motion={right} />
        <Stick hand="L" motion={left} isActive={activeHand === "L"} />
        <Stick hand="R" motion={right} isActive={activeHand === "R"} />
      </View>
      <View style={styles.hands}>
        <Text style={[styles.hand, activeHand === "L" && styles.handActive]}>
          L
        </Text>
        <Text style={[styles.hand, activeHand === "R" && styles.handActive]}>
          R
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
  },
  pad: {
    position: "absolute",
    top: 10,
    left: (STAGE_WIDTH - PAD_SIZE) / 2,
    width: PAD_SIZE,
    height: PAD_SIZE,
    borderRadius: PAD_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padRing: {
    width: PAD_SIZE - 28,
    height: PAD_SIZE - 28,
    borderRadius: (PAD_SIZE - 28) / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  stick: {
    position: "absolute",
    top: STAGE_HEIGHT - STICK_LENGTH,
    width: TIP_SIZE,
    height: STICK_LENGTH,
    alignItems: "center",
    transformOrigin: "50% 100%",
  },
  stickLeft: {
    left: BUTT_INSET - TIP_SIZE / 2,
  },
  stickRight: {
    left: STAGE_WIDTH - BUTT_INSET - TIP_SIZE / 2,
  },
  tip: {
    width: TIP_SIZE,
    height: TIP_SIZE,
    borderRadius: TIP_SIZE / 2,
  },
  shaft: {
    flex: 1,
    width: STICK_WIDTH,
    marginTop: -TIP_SIZE / 2,
    borderRadius: STICK_WIDTH / 2,
  },
  resting: {
    backgroundColor: colors.text.primary,
  },
  active: {
    backgroundColor: colors.accent,
  },
  ripple: {
    position: "absolute",
    top: CONTACT_Y - RIPPLE_SIZE / 2,
    width: RIPPLE_SIZE,
    height: RIPPLE_SIZE,
    borderRadius: RIPPLE_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  rippleLeft: {
    left: STAGE_WIDTH / 2 - CONTACT_OFFSET - RIPPLE_SIZE / 2,
  },
  rippleRight: {
    left: STAGE_WIDTH / 2 + CONTACT_OFFSET - RIPPLE_SIZE / 2,
  },
  hands: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: BUTT_INSET - 6,
  },
  hand: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.label,
  },
  handActive: {
    color: colors.accent,
  },
});
