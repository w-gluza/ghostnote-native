import { Stack, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { useSavedRoutines } from "@/features/routines/stores/saved-routines";
import { isRecommended } from "@/features/routines/domain/starter-routines";
import {
  routineLevel,
  routineMinutes,
} from "@/features/routines/domain/routine-builder";
import type { Routine } from "@/features/routines/domain/types";
import { Button } from "@/components/Button/Button";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${routine.name}, ${recommended ? "recommended, " : ""}${minutes} minutes, ${routine.exercises.length} rudiments, level ${routineLevel(routine)}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.divided,
        pressed && styles.pressed,
      ]}
    >
      <AppText variant="body" tone="violet" tabular style={styles.position}>
        {String(position).padStart(2, "0")}
      </AppText>
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
      <SymbolView
        name="chevron.right"
        size={13}
        weight="medium"
        tintColor={colors.text.secondary}
      />
    </Pressable>
  );
}

export default function RoutinesScreen() {
  const router = useRouter();
  const savedRoutines = useSavedRoutines();
  const create = () => router.push("/routine-editor");

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "",
          headerBackTitle: "Practice",
          headerShadowVisible: false,
          headerTintColor: colors.text.primary,
          headerStyle: { backgroundColor: colors.background },
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <View style={styles.heading}>
          <PageTitle>Saved Routines</PageTitle>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create new routine"
            onPress={create}
            style={({ pressed }) => [styles.add, pressed && styles.pressed]}
          >
            <SymbolView
              name="plus"
              size={18}
              weight="medium"
              tintColor={colors.text.primary}
            />
          </Pressable>
        </View>
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
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  add: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  count: {
    marginTop: 12,
    marginBottom: 8,
  },
  row: {
    paddingVertical: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  divided: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  position: {
    width: 32,
    fontSize: typography.fontSize.title,
  },
  rowText: {
    flex: 1,
    gap: 10,
  },
  recommended: {
    marginBottom: -4,
  },
  empty: {
    marginTop: 32,
    alignItems: "center",
    gap: 24,
  },
  emptyText: {
    lineHeight: 24,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});
