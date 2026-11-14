import { Stack, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useSavedRoutines } from "@/rudiments/saved-routines";
import { routineMinutes, type Routine } from "@/rudiments/todays-routine";
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

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${routine.name}, ${minutes} minutes, ${routine.exercises.length} rudiments, level ${routine.level}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.divided,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.position}>{String(position).padStart(2, "0")}</Text>
      <View style={styles.rowText}>
        <Text style={styles.name}>{routine.name}</Text>
        <Text style={styles.meta}>
          {minutes} min · {routine.exercises.length} rudiments · Lvl{" "}
          {routine.level}
        </Text>
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
          <Text accessibilityRole="header" style={styles.title}>
            Saved Routines
          </Text>
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
        <Text style={styles.count}>YOUR ROUTINES · {savedRoutines.length}</Text>

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
            <Text style={styles.emptyText}>
              No saved routines yet. Build one from the rudiments you want to
              practise.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={create}
              style={({ pressed }) => [
                styles.create,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.createLabel}>Create routine</Text>
            </Pressable>
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
  title: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.heading,
    lineHeight: 34,
    paddingTop: 6,
  },
  count: {
    marginTop: 12,
    marginBottom: 8,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
    letterSpacing: 0.5,
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
    color: colors.violet,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.title,
    fontVariant: ["tabular-nums"],
  },
  rowText: {
    flex: 1,
    gap: 10,
  },
  name: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.title,
  },
  meta: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
  },
  empty: {
    marginTop: 32,
    alignItems: "center",
    gap: 24,
  },
  emptyText: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
    lineHeight: 24,
    textAlign: "center",
  },
  create: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  createLabel: {
    color: colors.text.onAccent,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
  },
  pressed: {
    opacity: 0.7,
  },
});
