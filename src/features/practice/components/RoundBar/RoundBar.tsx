import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "@/components/Button/Button";
import { IconButton } from "@/components/IconButton/IconButton";
import { WeekProgress } from "@/features/practice/components/WeekProgress/WeekProgress";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/layout";

type RoundBarProps = {
  done: number;
  goal: number;
  onUndo: () => void;
  onFinish: () => void;
  clock?: ReactNode;
};

const MAX_ROUND_MARKS = 5;

export function RoundBar({
  done,
  goal,
  onUndo,
  onFinish,
  clock,
}: RoundBarProps) {
  const isComplete = done >= goal;
  const hasMarks = goal <= MAX_ROUND_MARKS;

  return (
    <View style={styles.bar}>
      <View style={styles.progress}>
        <WeekProgress
          done={done}
          goal={goal}
          unit=""
          description={`${done} of ${goal} rounds done`}
          showMarks={hasMarks}
          showCount={!hasMarks}
        />
        {clock}
      </View>
      {done > 0 ? (
        <IconButton
          icon="arrow.uturn.backward"
          accessibilityLabel="Undo last round"
          onPress={onUndo}
        />
      ) : null}
      <Button
        variant="tonal"
        disabled={isComplete}
        style={styles.log}
        onPress={onFinish}
      >
        Log Round
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  progress: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  log: {
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.disabled,
    backgroundColor: "transparent",
  },
});
