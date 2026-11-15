import { Animated, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import type { Hand } from "@/features/rudiments/domain/types";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/layout";

export type StickMotion = {
  lift: Animated.Value;
  ripple: Animated.Value;
};

type PadAnimationProps = {
  left: StickMotion;
  right: StickMotion;
  activeHand: Hand | null;
  label: string;
  scale?: number;
  showsHands?: boolean;
};

const STAGE_WIDTH = 280;
export const STAGE_HEIGHT = 300;
const PAD_SIZE = 200;
const STICK_LENGTH = 197;
const STICK_WIDTH = 8;
const TIP_WIDTH = 10;
const TIP_STRETCH = 1.45;
const PAD_RING_INSET = 16;
const NECK_WIDTH = 4;
const TAPER_LENGTH = 62;
const TAPER_OVERLAP = 2;
const OUTLINE_WIDTH = 1;
const RIPPLE_SIZE = 40;
const CONTACT_ANGLE = 24;
const LIFT_ANGLE = 9;
const BUTT_INSET = 40;
const CONTACT_Y = 120;
const CONTACT_OFFSET = 20;

export const TAP_LIFT = 1;
export const ACCENT_LIFT = 2;

function StickShape({ color, grow }: { color: string; grow: number }) {
  const tipWidth = TIP_WIDTH + grow * 2;
  const shaftWidth = STICK_WIDTH + grow * 2;
  const taperSide = (STICK_WIDTH - NECK_WIDTH) / 2;

  return (
    <View
      style={[
        styles.shape,
        { top: -grow, bottom: -grow, left: -grow, right: -grow },
      ]}
    >
      <View
        style={{
          width: tipWidth,
          height: tipWidth,
          borderRadius: tipWidth / 2,
          backgroundColor: color,
          transform: [
            { scaleY: (TIP_WIDTH * TIP_STRETCH + grow * 2) / tipWidth },
          ],
        }}
      />
      <View
        style={{
          width: shaftWidth,
          height: TAPER_LENGTH,
          marginTop: -(TAPER_OVERLAP + grow),
          borderBottomWidth: TAPER_LENGTH,
          borderLeftWidth: taperSide,
          borderRightWidth: taperSide,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: color,
        }}
      />
      <View
        style={{
          flex: 1,
          width: shaftWidth,
          borderBottomLeftRadius: shaftWidth / 2,
          borderBottomRightRadius: shaftWidth / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

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
  const color = isActive ? colors.accent : colors.text.primary;

  return (
    <Animated.View
      style={[
        styles.stick,
        hand === "L" ? styles.stickLeft : styles.stickRight,
        { transform: [{ rotate }] },
      ]}
    >
      <StickShape color={colors.surface} grow={OUTLINE_WIDTH} />
      <StickShape color={color} grow={0} />
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
    outputRange: [0, 0.6, 0],
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
  scale = 1,
  showsHands = true,
}: PadAnimationProps) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label}>
      <View
        style={{ width: STAGE_WIDTH * scale, height: STAGE_HEIGHT * scale }}
      >
        <View style={[styles.stage, { transform: [{ scale }] }]}>
          <View style={styles.pad}>
            <View style={styles.padRing} />
          </View>
          <Ripple hand="L" motion={left} />
          <Ripple hand="R" motion={right} />
          <Stick hand="L" motion={left} isActive={activeHand === "L"} />
          <Stick hand="R" motion={right} isActive={activeHand === "R"} />
        </View>
      </View>
      {showsHands ? (
        <View
          style={[
            styles.hands,
            { paddingHorizontal: (BUTT_INSET - 6) * scale },
          ]}
        >
          <AppText
            variant="label"
            tone={activeHand === "L" ? "accent" : "secondary"}
          >
            L
          </AppText>
          <AppText
            variant="label"
            tone={activeHand === "R" ? "accent" : "secondary"}
          >
            R
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    transformOrigin: "0% 0%",
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
    width: PAD_SIZE - PAD_RING_INSET,
    height: PAD_SIZE - PAD_RING_INSET,
    borderRadius: (PAD_SIZE - PAD_RING_INSET) / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  stick: {
    position: "absolute",
    top: STAGE_HEIGHT - STICK_LENGTH,
    width: TIP_WIDTH,
    height: STICK_LENGTH,
    transformOrigin: "50% 100%",
  },
  stickLeft: {
    left: BUTT_INSET - TIP_WIDTH / 2,
  },
  stickRight: {
    left: STAGE_WIDTH - BUTT_INSET - TIP_WIDTH / 2,
  },
  shape: {
    position: "absolute",
    alignItems: "center",
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
    marginTop: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
