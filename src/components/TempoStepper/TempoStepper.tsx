import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { IconButton } from "@/components/IconButton/IconButton";
import { spacing } from "@/theme/layout";

export const PLAIN_STEP_SIZE = 36;

type TempoStepperProps = {
  variant?: "plain" | "tonal";
  children: ReactNode;
  canDecrease: boolean;
  canIncrease: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onHoldDecrease?: () => void;
  onHoldIncrease?: () => void;
  onHoldEnd?: () => void;
};

export function TempoStepper({
  variant = "tonal",
  children,
  canDecrease,
  canIncrease,
  onDecrease,
  onIncrease,
  onHoldDecrease,
  onHoldIncrease,
  onHoldEnd,
}: TempoStepperProps) {
  const isPlain = variant === "plain";
  const look = isPlain
    ? ({ size: 28, weight: "light", hitSlop: 8 } as const)
    : ({ variant: "tonal" } as const);

  return (
    <View style={[styles.stepper, styles[variant]]}>
      <IconButton
        {...look}
        icon="minus"
        accessibilityLabel="Decrease tempo"
        disabled={!canDecrease}
        style={isPlain && [styles.plainStep, styles.plainStart]}
        onPress={onDecrease}
        onLongPress={onHoldDecrease}
        onPressOut={onHoldEnd}
      />
      {children}
      <IconButton
        {...look}
        icon="plus"
        accessibilityLabel="Increase tempo"
        disabled={!canIncrease}
        style={isPlain && [styles.plainStep, styles.plainEnd]}
        onPress={onIncrease}
        onLongPress={onHoldIncrease}
        onPressOut={onHoldEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: "row",
    alignItems: "center",
  },
  plain: {
    justifyContent: "space-between",
  },
  tonal: {
    gap: spacing.xl,
  },
  plainStep: {
    minWidth: PLAIN_STEP_SIZE,
    minHeight: PLAIN_STEP_SIZE,
    width: PLAIN_STEP_SIZE,
    height: PLAIN_STEP_SIZE,
  },
  plainStart: {
    alignItems: "flex-start",
  },
  plainEnd: {
    alignItems: "flex-end",
  },
});
