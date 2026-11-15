import { Stack, useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { NumberedRow } from "@/components/NumberedRow/NumberedRow";
import { IconButton } from "@/components/IconButton/IconButton";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { useSavedRoutines } from "@/features/routines/stores/saved-routines";
import { isRecommended } from "@/features/routines/domain/starter-routines";
import {
  routineLevel,
  routineMinutes,
} from "@/features/routines/domain/routine-builder";
import type { Routine } from "@/features/routines/domain/types";
import { Button } from "@/components/Button/Button";
import { nativeHeader } from "@/theme/navigation";
import { layoutStyles, spacing } from "@/theme/layout";

function RoutineRow({
  routine,
  position,
  isLast,
  onPress,
}: {
  routine: Routine;
  position: number;
  isLast: boolean;
  onPress: () => void;
}) {
  const minutes = routineMinutes(routine);
  const recommended = isRecommended(routine);

  return (
    <NumberedRow
      position={position}
      accessibilityLabel={`${routine.name}, ${recommended ? "recommended, " : ""}${minutes} minutes, ${routine.exercises.length} rudiments, level ${routineLevel(routine)}`}
      isLast={isLast}
      onPress={onPress}
    >
      <View style={styles.rowText}>
        {recommended ? (
          <AppText
            variant="overline"
            tone="secondary"
            style={styles.recommended}
          >
            RECOMMENDED
          </AppText>
        ) : null}
        <AppText variant="heading">{routine.name}</AppText>
        <AppText variant="bodySmall" tone="secondary">
          {minutes} min · {routine.exercises.length} rudiments · Lvl{" "}
          {routineLevel(routine)}
        </AppText>
      </View>
    </NumberedRow>
  );
}

export default function RoutinesScreen() {
  const router = useRouter();
  const savedRoutines = useSavedRoutines();
  const create = () => router.push("/routine-editor");

  return (
    <View style={layoutStyles.screen}>
      <Stack.Screen
        options={{
          ...nativeHeader,
          headerBackTitle: "Practice",
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={layoutStyles.content}
      >
        <PageTitle
          trailing={
            <IconButton
              icon="plus"
              accessibilityLabel="Create new routine"
              variant="tonal"
              size={18}
              onPress={create}
            />
          }
        >
          Saved Routines
        </PageTitle>
        <AppText variant="overline" tone="secondary" style={styles.count}>
          YOUR ROUTINES · {savedRoutines.length}
        </AppText>

        {savedRoutines.map((routine, index) => (
          <RoutineRow
            key={routine.id}
            routine={routine}
            position={index + 1}
            isLast={index === savedRoutines.length - 1}
            onPress={() =>
              router.push({ pathname: "/routine", params: { id: routine.id } })
            }
          />
        ))}

        {savedRoutines.length === 0 ? (
          <View style={styles.empty}>
            <AppText variant="body" tone="secondary" style={styles.emptyText}>
              No saved routines yet. Build one from the rudiments you want to
              practise.
            </AppText>
            <Button onPress={create}>Create routine</Button>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  count: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  rowText: {
    gap: spacing.sm,
  },
  recommended: {
    marginBottom: -4,
  },
  empty: {
    marginTop: spacing.xxl,
    alignItems: "center",
    gap: spacing.xl,
  },
  emptyText: {
    lineHeight: 24,
    textAlign: "center",
  },
});
