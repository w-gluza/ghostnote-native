import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  availableRudiments,
  defaultBpm,
  findRudiment,
} from "@/rudiments/library";
import { findRoutine, saveRoutine } from "@/rudiments/saved-routines";
import { clampBpm } from "@/rudiments/timing";
import {
  exerciseMinutes,
  routineMinutes,
  todaysRoutine,
  type Exercise,
  type Round,
} from "@/rudiments/todays-routine";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

const MAX_ROUNDS = 10;
const MIN_ROUND_SECONDS = 10;
const MAX_ROUND_SECONDS = 30 * 60;
const NEW_ROUND_SECONDS = 120;

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function parseDuration(text: string) {
  const match = /^(\d{1,2})(?::(\d{1,2}))?$/.exec(text.trim());
  if (!match) {
    return undefined;
  }
  const seconds = Number(match[1]) * 60 + Number(match[2] ?? 0);
  return seconds >= MIN_ROUND_SECONDS && seconds <= MAX_ROUND_SECONDS
    ? seconds
    : undefined;
}

function parseTempo(text: string) {
  const bpm = Number(text.trim());
  return Number.isInteger(bpm) && bpm === clampBpm(bpm) ? bpm : undefined;
}

function RoundField({
  label,
  value,
  format,
  parse,
  keyboardType,
  onChange,
}: {
  label: string;
  value: number;
  format: (value: number) => string;
  parse: (text: string) => number | undefined;
  keyboardType: "number-pad" | "numbers-and-punctuation";
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(format(value));

  return (
    <View style={styles.field}>
      <TextInput
        accessibilityLabel={label}
        value={draft}
        onChangeText={(text) => {
          setDraft(text);
          const parsed = parse(text);
          if (parsed !== undefined) {
            onChange(parsed);
          }
        }}
        onEndEditing={() => setDraft(format(value))}
        keyboardType={keyboardType}
        keyboardAppearance="dark"
        selectionColor={colors.accent}
        selectTextOnFocus
        maxLength={5}
        style={styles.fieldInput}
      />
    </View>
  );
}

function ExerciseEditor({
  exercise,
  onChange,
  onRemove,
  onClose,
}: {
  exercise: Exercise;
  onChange: (rounds: Round[]) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const rudiment = findRudiment(exercise.id);
  const [roundKeys, setRoundKeys] = useState(() =>
    exercise.rounds.map((_, index) => index),
  );
  const minutes = exerciseMinutes(exercise);
  const changeRound = (index: number, change: Partial<Round>) =>
    onChange(
      exercise.rounds.map((round, position) =>
        position === index ? { ...round, ...change } : round,
      ),
    );
  const addRound = () => {
    const last = exercise.rounds[exercise.rounds.length - 1];
    onChange([
      ...exercise.rounds,
      {
        bpm: last?.bpm ?? (rudiment ? defaultBpm(rudiment) : 80),
        seconds: last?.seconds ?? NEW_ROUND_SECONDS,
      },
    ]);
    setRoundKeys((keys) => [...keys, Math.max(-1, ...keys) + 1]);
  };
  const removeRound = (index: number) => {
    onChange(exercise.rounds.filter((_, position) => position !== index));
    setRoundKeys((keys) => keys.filter((_, position) => position !== index));
  };

  return (
    <View style={styles.screen}>
      <View style={styles.bar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Edit Routine"
          hitSlop={12}
          onPress={onClose}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <SymbolView
            name="chevron.left"
            size={16}
            weight="medium"
            tintColor={colors.text.primary}
          />
          <Text style={styles.backLabel}>Edit Routine</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={onClose}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.save}>Done</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text accessibilityRole="header" style={styles.title}>
          {rudiment?.name}
        </Text>
        <Text style={styles.subtitle}>
          {rudiment?.category} · Lvl {rudiment?.level}
        </Text>

        <View style={styles.sectionHeader}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            ROUNDS
          </Text>
          <Text style={styles.sectionCount}>{minutes} min total</Text>
        </View>

        <View style={styles.columns}>
          <Text style={[styles.column, styles.roundColumn]}>ROUND</Text>
          <Text style={[styles.column, styles.fieldColumn]}>TEMPO</Text>
          <Text style={[styles.column, styles.fieldColumn]}>DURATION</Text>
          {exercise.rounds.length > 1 ? (
            <View style={styles.removeColumn} />
          ) : null}
        </View>

        {exercise.rounds.map((round, index) => (
          <View key={roundKeys[index] ?? index} style={styles.roundRow}>
            <View style={styles.roundColumn}>
              <View style={styles.roundBadge}>
                <Text style={styles.roundNumber}>{index + 1}</Text>
              </View>
            </View>
            <View style={styles.fieldColumn}>
              <RoundField
                label={`Round ${index + 1} tempo in beats per minute`}
                value={round.bpm}
                format={String}
                parse={parseTempo}
                keyboardType="number-pad"
                onChange={(bpm) => changeRound(index, { bpm })}
              />
            </View>
            <View style={styles.fieldColumn}>
              <RoundField
                label={`Round ${index + 1} duration, minutes and seconds`}
                value={round.seconds}
                format={formatDuration}
                parse={parseDuration}
                keyboardType="numbers-and-punctuation"
                onChange={(seconds) => changeRound(index, { seconds })}
              />
            </View>
            {exercise.rounds.length > 1 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove round ${index + 1}`}
                hitSlop={8}
                onPress={() => removeRound(index)}
                style={({ pressed }) => [
                  styles.removeColumn,
                  pressed && styles.pressed,
                ]}
              >
                <SymbolView
                  name="minus.circle"
                  size={20}
                  weight="regular"
                  tintColor={colors.text.secondary}
                />
              </Pressable>
            ) : null}
          </View>
        ))}

        {exercise.rounds.length < MAX_ROUNDS ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={12}
            onPress={addRound}
            style={({ pressed }) => [styles.add, pressed && styles.pressed]}
          >
            <SymbolView
              name="plus"
              size={14}
              weight="medium"
              tintColor={colors.accent}
            />
            <Text style={styles.addLabel}>Add round</Text>
          </Pressable>
        ) : null}

        <View style={styles.total}>
          <Text style={styles.totalLabel}>Total duration</Text>
          <Text style={styles.totalValue}>{minutes} min</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={onRemove}
          style={({ pressed }) => [styles.remove, pressed && styles.pressed]}
        >
          <Text style={styles.removeLabel}>Remove from routine</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

export default function RoutineEditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const source = id ? findRoutine(id) : undefined;
  const isCopy = source?.id === todaysRoutine.id;
  const [name, setName] = useState(source?.name ?? "");
  const [exercises, setExercises] = useState<Exercise[]>(
    source?.exercises ?? [],
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const available = availableRudiments.filter(
    (rudiment) => !exercises.some((exercise) => exercise.id === rudiment.id),
  );
  const canSave = name.trim().length > 0 && exercises.length > 0;
  const open = exercises.find((exercise) => exercise.id === openId);

  const add = (rudimentId: string, bpm: number) => {
    setExercises((current) => [
      ...current,
      {
        id: rudimentId,
        rounds: Array.from({ length: 3 }, () => ({
          bpm,
          seconds: NEW_ROUND_SECONDS,
        })),
      },
    ]);
    setIsAdding(false);
  };
  const save = () => {
    saveRoutine({
      id: source && !isCopy ? source.id : `routine-${Date.now()}`,
      name: name.trim(),
      level: Math.max(
        ...exercises.map((exercise) => findRudiment(exercise.id)?.level ?? 1),
      ),
      exercises,
    });
    router.back();
  };

  if (open) {
    return (
      <ExerciseEditor
        key={open.id}
        exercise={open}
        onChange={(rounds) =>
          setExercises((current) =>
            current.map((exercise) =>
              exercise.id === open.id ? { ...exercise, rounds } : exercise,
            ),
          )
        }
        onRemove={() => {
          setExercises((current) =>
            current.filter((exercise) => exercise.id !== open.id),
          );
          setOpenId(null);
        }}
        onClose={() => setOpenId(null)}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.bar}>
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => router.back()}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!canSave}
          hitSlop={12}
          onPress={save}
          style={({ pressed }) => [
            !canSave && styles.off,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.save}>{isCopy ? "Save copy" : "Save"}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text accessibilityRole="header" style={styles.title}>
          {source ? "Edit Routine" : "New Routine"}
        </Text>

        <TextInput
          accessibilityLabel="Routine name"
          value={name}
          onChangeText={setName}
          placeholder="Routine name"
          placeholderTextColor={colors.text.secondary}
          selectionColor={colors.accent}
          keyboardAppearance="dark"
          returnKeyType="done"
          maxLength={40}
          style={styles.input}
        />

        <View style={styles.sectionHeader}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            EXERCISES
          </Text>
          <Text style={styles.sectionCount}>
            {routineMinutes({ exercises })} min
          </Text>
        </View>

        {exercises.map((exercise, index) => {
          const rudiment = findRudiment(exercise.id);
          if (!rudiment) {
            return null;
          }
          const rounds = exercise.rounds.length;
          const detail = `${rounds} ${rounds === 1 ? "round" : "rounds"} · ${exerciseMinutes(exercise)} min`;
          return (
            <Pressable
              key={exercise.id}
              accessibilityRole="button"
              accessibilityLabel={`${rudiment.name}, ${detail}`}
              onPress={() => setOpenId(exercise.id)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <Text style={styles.position}>
                {String(index + 1).padStart(2, "0")}
              </Text>
              <View style={styles.rowText}>
                <Text numberOfLines={1} style={styles.name}>
                  {rudiment.name}
                </Text>
                <Text style={styles.meta}>{detail}</Text>
              </View>
              <SymbolView
                name="chevron.right"
                size={13}
                weight="medium"
                tintColor={colors.text.secondary}
              />
            </Pressable>
          );
        })}

        {available.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: isAdding }}
            hitSlop={12}
            onPress={() => setIsAdding((adding) => !adding)}
            style={({ pressed }) => [styles.add, pressed && styles.pressed]}
          >
            <SymbolView
              name="plus"
              size={14}
              weight="medium"
              tintColor={colors.accent}
            />
            <Text style={styles.addLabel}>Add rudiment</Text>
          </Pressable>
        ) : null}

        {isAdding
          ? available.map((rudiment) => (
              <Pressable
                key={rudiment.id}
                accessibilityRole="button"
                accessibilityLabel={`Add ${rudiment.name}`}
                onPress={() => add(rudiment.id, defaultBpm(rudiment))}
                style={({ pressed }) => [
                  styles.choice,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.choiceName}>{rudiment.name}</Text>
                <Text style={styles.meta}>
                  {rudiment.category} · Lvl {rudiment.level}
                </Text>
              </Pressable>
            ))
          : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bar: {
    paddingTop: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cancel: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
  },
  save: {
    color: colors.accent,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.body,
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backLabel: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
  },
  content: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.heading,
    lineHeight: 34,
    paddingTop: 6,
  },
  subtitle: {
    marginTop: 8,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
  },
  input: {
    marginTop: 16,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
    backgroundColor: colors.surface,
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
    letterSpacing: 0.5,
  },
  sectionCount: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.caption,
  },
  row: {
    paddingVertical: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  position: {
    width: 28,
    color: colors.violet,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.title,
    fontVariant: ["tabular-nums"],
  },
  rowText: {
    flex: 1,
    gap: 8,
  },
  name: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.body,
  },
  meta: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
    fontVariant: ["tabular-nums"],
  },
  add: {
    marginTop: 24,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addLabel: {
    color: colors.accent,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.body,
  },
  choice: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 4,
    backgroundColor: colors.surface,
  },
  choiceName: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.body,
  },
  columns: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  column: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
    letterSpacing: 0.5,
  },
  roundColumn: {
    width: 64,
  },
  fieldColumn: {
    flex: 1,
  },
  removeColumn: {
    width: 24,
    alignItems: "center",
  },
  roundRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  roundBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  roundNumber: {
    color: colors.violet,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.label,
    fontVariant: ["tabular-nums"],
  },
  field: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  fieldInput: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
    fontVariant: ["tabular-nums"],
  },
  total: {
    marginTop: 32,
    paddingTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  totalLabel: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
  },
  totalValue: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.title,
    fontVariant: ["tabular-nums"],
  },
  remove: {
    marginTop: 32,
    alignSelf: "center",
  },
  removeLabel: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
  },
  off: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },
});
