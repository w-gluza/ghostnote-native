import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "@/components/Button/Button";
import { IconButton } from "@/components/IconButton/IconButton";
import { WeekProgress } from "@/features/practice/components/WeekProgress/WeekProgress";
import { divider, spacing } from "@/theme/layout";

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
        {clock}
        <WeekProgress
          done={done}
          goal={goal}
          unit="rounds"
          description={`${done} of ${goal} rounds done`}
          showMarks={hasMarks}
          showCount={!hasMarks}
        />
      </View>
      {done > 0 ? (
        <IconButton
          icon="arrow.uturn.backward"
          accessibilityLabel="Undo last round"
          onPress={onUndo}
        />
      ) : null}
      <Button variant="tonal" disabled={isComplete} onPress={onFinish}>
        Log Round
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    marginBottom: -spacing.sm,
    ...divider.top,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  progress: {
    flex: 1,
    alignItems: "flex-start",
    gap: spacing.sm,
  },
});
