import { useEffect, useEffectEvent, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  useAnimatedValue,
} from "react-native";

import {
  PadAnimation,
  type StickMotion,
  TAP_LIFT,
} from "@/features/rudiments/components/PadAnimation/PadAnimation";
import { colors } from "@/theme/colors";

const HOLD_MS = 100;
const STROKE_GAP_MS = 190;
const APPROACH_MS = 90;
const RETURN_MS = 170;
const RIPPLE_MS = 320;
const FADE_MS = 250;
const SECOND_HIT_MS = HOLD_MS + STROKE_GAP_MS + APPROACH_MS;
const LEAVE_AFTER_HIT_MS = 100;

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
  const [isLeaving, setIsLeaving] = useState(false);
  const opacity = useAnimatedValue(1);
  const leftLift = useAnimatedValue(TAP_LIFT);
  const leftRipple = useAnimatedValue(1);
  const rightLift = useAnimatedValue(TAP_LIFT);
  const rightRipple = useAnimatedValue(1);
  const left: StickMotion = { lift: leftLift, ripple: leftRipple };
  const right: StickMotion = { lift: rightLift, ripple: rightRipple };

  const leave = () => {
    if (isLeaving) {
      return;
    }
    setIsLeaving(true);
    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_MS,
      useNativeDriver: true,
    }).start(() => setIsDone(true));
  };
  const leaveWhenShown = useEffectEvent(leave);

  useEffect(() => {
    let strokes: Animated.CompositeAnimation | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let isCancelled = false;

    AccessibilityInfo.isReduceMotionEnabled().then((reducesMotion) => {
      if (isCancelled) {
        return;
      }
      if (reducesMotion) {
        timer = setTimeout(leaveWhenShown, HOLD_MS);
        return;
      }
      strokes = Animated.sequence([
        Animated.delay(HOLD_MS),
        Animated.stagger(STROKE_GAP_MS, [
          hit({ lift: rightLift, ripple: rightRipple }),
          hit({ lift: leftLift, ripple: leftRipple }),
        ]),
      ]);
      strokes.start();
      timer = setTimeout(leaveWhenShown, SECOND_HIT_MS + LEAVE_AFTER_HIT_MS);
    });

    return () => {
      isCancelled = true;
      strokes?.stop();
      clearTimeout(timer);
    };
  }, [leftLift, leftRipple, rightLift, rightRipple]);

  if (isDone) {
    return null;
  }

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents={isLeaving ? "none" : "auto"}
      style={[styles.cover, { opacity }]}
    >
      <Pressable onPress={leave} style={styles.skip}>
        <PadAnimation
          left={left}
          right={right}
          activeHand={null}
          label=""
          showsHands={false}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cover: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
  },
  skip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
