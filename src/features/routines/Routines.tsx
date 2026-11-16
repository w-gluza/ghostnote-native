import { Stack, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { RowText } from "@/components/RowText/RowText";
import { NumberedRow } from "@/components/NumberedRow/NumberedRow";
import { IconButton } from "@/components/IconButton/IconButton";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { useSavedRoutines } from "@/features/routines/stores/saved-routines";
import { usePracticeRoutine } from "@/features/practice/stores/practice-choice";
import { isRecommended } from "@/features/routines/domain/starter-routines";
import {
  exercisesLabel,
  routineLevel,
  routineMinutes,
} from "@/features/routines/domain/routine-builder";
import type { Routine } from "@/features/routines/domain/types";
import { Button } from "@/components/Button/Button";
import { colors } from "@/theme/colors";
import { nativeHeader } from "@/theme/navigation";
import { divider, layoutStyles, spacing } from "@/theme/layout";

function RoutineRow({
  routine,
  isInUse,
  position,
  isLast,
  onPress,
}: {
  routine: Routine;
  isInUse: boolean;
  position: number;
  isLast: boolean;
  onPress: () => void;
}) {
  const minutes = routineMinutes(routine);
  const exercises = exercisesLabel(routine.exercises.length);
  const labels = [
    isInUse ? "IN USE" : undefined,
    isRecommended(routine) ? "RECOMMENDED" : undefined,
  ].filter((label) => label !== undefined);

  return (
    <NumberedRow
      position={position}
      accessibilityLabel={`${[routine.name, ...labels.map((label) => label.toLowerCase())].join(", ")}, ${minutes} minutes, ${exercises}, level ${routineLevel(routine)}`}
      isLast={isLast}
      onPress={onPress}
    >
      <RowText
        label={labels.join(" · ") || undefined}
        title={routine.name}
        detail={`${minutes} min · ${exercises} · Lvl ${routineLevel(routine)}`}
      />
    </NumberedRow>
  );
}

export default function RoutinesScreen() {
  const router = useRouter();
  const savedRoutines = useSavedRoutines();
  const practiceRoutine = usePracticeRoutine();
  const create = () => router.push("/routine-editor");

  return (
    <View style={layoutStyles.screen}>
      <Stack.Screen
        options={{
          ...nativeHeader,
          headerBackTitle: "Practice",
          headerRight: () => (
            <IconButton
              icon="plus"
              accessibilityLabel="Create new routine"
              onPress={create}
            />
          ),
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={layoutStyles.content}
      >
        <PageTitle>Saved Routines</PageTitle>
        <View style={styles.summary}>
          <SymbolView
            name="checkmark"
            size={14}
            weight="medium"
            tintColor={colors.text.secondary}
          />
          <AppText variant="bodySmall" tone="secondary">
            {practiceRoutine.name} · Used for Practice
          </AppText>
        </View>

        <SectionHeader
          title="YOUR ROUTINES"
          trailing={
            savedRoutines.length === 1
              ? "1 routine"
              : `${savedRoutines.length} routines`
          }
          style={styles.sectionHeader}
        />

        {savedRoutines.map((routine, index) => (
          <RoutineRow
            key={routine.id}
            routine={routine}
            isInUse={routine.id === practiceRoutine.id}
            position={index + 1}
            isLast={index === savedRoutines.length - 1}
            onPress={() =>
              router.push({ pathname: "/routine", params: { id: routine.id } })
            }
          />
        ))}

        {savedRoutines.length === 0 ? (
          <EmptyState action={<Button onPress={create}>Create Routine</Button>}>
            No saved routines yet. Build one from the rudiments you want to
            practise.
          </EmptyState>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    marginTop: spacing.sm,
    paddingBottom: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    ...divider.bottom,
  },
  sectionHeader: {
    marginTop: spacing.section,
  },
});
