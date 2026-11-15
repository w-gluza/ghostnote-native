import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  useAnimatedValue,
} from "react-native";

import {
  PadAnimation,
  type StickMotion,
  TAP_LIFT,
} from "@/features/rudiments/components/PadAnimation/PadAnimation";
import { colors } from "@/theme/colors";

const HOLD_MS = 200;
const STROKE_GAP_MS = 190;
const APPROACH_MS = 90;
const RETURN_MS = 170;
const RIPPLE_MS = 320;
const FADE_MS = 250;

function hit(motion: StickMotion) {
  return Animated.sequence([
    Animated.timing(motion.lift, {
      toValue: 0,
      duration: APPROACH_MS,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }),
    Animated.timing(motion.ripple, {
      toValue: 0,
      duration: 0,
      useNativeDriver: true,
    }),
    Animated.parallel([
      Animated.timing(motion.ripple, {
        toValue: 1,
        duration: RIPPLE_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(motion.lift, {
        toValue: TAP_LIFT,
        duration: RETURN_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]),
  ]);
}

export function LaunchPad() {
  const [isDone, setIsDone] = useState(false);
  const opacity = useAnimatedValue(1);
  const leftLift = useAnimatedValue(TAP_LIFT);
  const leftRipple = useAnimatedValue(1);
  const rightLift = useAnimatedValue(TAP_LIFT);
  const rightRipple = useAnimatedValue(1);
  const left: StickMotion = { lift: leftLift, ripple: leftRipple };
  const right: StickMotion = { lift: rightLift, ripple: rightRipple };

  useEffect(() => {
    let animation: Animated.CompositeAnimation | undefined;
    let isCancelled = false;
    const fade = Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_MS,
      useNativeDriver: true,
    });

    AccessibilityInfo.isReduceMotionEnabled().then((reducesMotion) => {
      if (isCancelled) {
        return;
      }
      const leftMotion = { lift: leftLift, ripple: leftRipple };
      const rightMotion = { lift: rightLift, ripple: rightRipple };
      animation = reducesMotion
        ? Animated.sequence([Animated.delay(HOLD_MS), fade])
        : Animated.sequence([
            Animated.delay(HOLD_MS),
            Animated.stagger(STROKE_GAP_MS, [
              hit(rightMotion),
              hit(leftMotion),
              hit(rightMotion),
              hit(leftMotion),
            ]),
            fade,
          ]);
      animation.start(() => setIsDone(true));
    });

    return () => {
      isCancelled = true;
      animation?.stop();
    };
  }, [opacity, leftLift, leftRipple, rightLift, rightRipple]);

  if (isDone) {
    return null;
  }

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.cover, { opacity }]}
    >
      <PadAnimation
        left={left}
        right={right}
        activeHand={null}
        label=""
        showsHands={false}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cover: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
