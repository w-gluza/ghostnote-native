import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { NoteValuePicker } from "@/features/rudiments/components/NoteValuePicker/NoteValuePicker";
import { fraction, multiply } from "@/features/rudiments/domain/fraction";
import { newId } from "@/features/rudiments/domain/ids";
import {
  availableRudiments,
  defaultBpm,
  findRudiment,
  resolvePattern,
} from "@/features/rudiments/domain/library";
import {
  findRoutine,
  saveRoutine,
} from "@/features/routines/stores/saved-routines";
import { evenStep, scaleToStep } from "@/features/rudiments/domain/timeline";
import {
  formatDuration,
  MAX_ROUNDS,
  parseDuration,
  parseTempo,
} from "@/features/routines/domain/routine-form";
import {
  exerciseMinutes,
  NEW_ROUND_SECONDS,
  newExercise,
  newRound,
  routineMinutes,
} from "@/features/routines/domain/routine-builder";
import type {
  RoutineExercise,
  RoutineRound,
} from "@/features/routines/domain/types";
import type { Rudiment } from "@/features/rudiments/domain/types";
import { colors } from "@/theme/colors";
import { textVariants, typography } from "@/theme/typography";

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
  exercise: RoutineExercise;
  onChange: (change: Partial<RoutineExercise>) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const rudiment = findRudiment(exercise.pattern.rudimentId);
  const pattern = resolvePattern(exercise.pattern);
  const step = pattern ? evenStep(pattern) : undefined;
  const strokeStep = step ? multiply(step, exercise.rhythmicScale) : undefined;
  const minutes = exerciseMinutes(exercise);
  const changeRound = (id: string, change: Partial<RoutineRound>) =>
    onChange({
      rounds: exercise.rounds.map((round) =>
        round.id === id ? { ...round, ...change } : round,
      ),
    });
  const addRound = () => {
    const last = exercise.rounds[exercise.rounds.length - 1];
    onChange({
      rounds: [
        ...exercise.rounds,
        newRound(
          last?.tempo.bpm ?? (rudiment ? defaultBpm(rudiment) : 80),
          last?.durationSeconds ?? NEW_ROUND_SECONDS,
        ),
      ],
    });
  };
  const removeRound = (id: string) =>
    onChange({ rounds: exercise.rounds.filter((round) => round.id !== id) });

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
          <AppText variant="bodySmall">Edit Routine</AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={onClose}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <AppText variant="bodyStrong" tone="accent">
            Done
          </AppText>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <AppText
          variant="title"
          accessibilityRole="header"
          style={styles.title}
        >
          {rudiment?.name}
        </AppText>
        <View style={styles.subtitleRow}>
          <AppText variant="bodySmall" tone="secondary">
            {rudiment?.category} · Lvl {rudiment?.level}
          </AppText>
          {pattern && strokeStep ? (
            <NoteValuePicker
              subdivision={
                strokeStep.numerator === 1 ? strokeStep.denominator : 0
              }
              onChange={(value) =>
                onChange({
                  rhythmicScale: scaleToStep(pattern, fraction(1, value)),
                })
              }
            />
          ) : null}
        </View>

        <View style={styles.sectionHeader}>
          <AppText
            variant="overline"
            tone="secondary"
            accessibilityRole="header"
          >
            ROUNDS
          </AppText>
          <AppText variant="caption" tone="secondary">
            {minutes} min total
          </AppText>
        </View>

        <View style={styles.columns}>
          <AppText
            variant="overline"
            tone="secondary"
            style={styles.roundColumn}
          >
            ROUND
          </AppText>
          <AppText
            variant="overline"
            tone="secondary"
            style={styles.fieldColumn}
          >
            TEMPO
          </AppText>
          <AppText
            variant="overline"
            tone="secondary"
            style={styles.fieldColumn}
          >
            DURATION
          </AppText>
          {exercise.rounds.length > 1 ? (
            <View style={styles.removeColumn} />
          ) : null}
        </View>

        {exercise.rounds.map((round, index) => (
          <View key={round.id} style={styles.roundRow}>
            <View style={styles.roundColumn}>
              <View style={styles.roundBadge}>
                <AppText variant="label" tone="violet" tabular>
                  {index + 1}
                </AppText>
              </View>
            </View>
            <View style={styles.fieldColumn}>
              <RoundField
                label={`Round ${index + 1} tempo in beats per minute`}
                value={round.tempo.bpm}
                format={String}
                parse={parseTempo}
                keyboardType="number-pad"
                onChange={(bpm) =>
                  changeRound(round.id, { tempo: { ...round.tempo, bpm } })
                }
              />
            </View>
            <View style={styles.fieldColumn}>
              <RoundField
                label={`Round ${index + 1} duration, minutes and seconds`}
                value={round.durationSeconds}
                format={formatDuration}
                parse={parseDuration}
                keyboardType="numbers-and-punctuation"
                onChange={(durationSeconds) =>
                  changeRound(round.id, { durationSeconds })
                }
              />
            </View>
            {exercise.rounds.length > 1 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove round ${index + 1}`}
                hitSlop={8}
                onPress={() => removeRound(round.id)}
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
            <AppText variant="bodyStrong" tone="accent">
              Add round
            </AppText>
          </Pressable>
        ) : null}

        <View style={styles.total}>
          <AppText variant="body" tone="secondary">
            Total duration
          </AppText>
          <AppText variant="heading" tabular>
            {minutes} min
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={onRemove}
          style={({ pressed }) => [styles.remove, pressed && styles.pressed]}
        >
          <AppText variant="bodySmall" tone="secondary">
            Remove from routine
          </AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

type RoutineEditorProps = {
  onDelete: (routineId: string) => boolean;
};

export default function RoutineEditorScreen({ onDelete }: RoutineEditorProps) {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const source = id ? findRoutine(id) : undefined;
  const [name, setName] = useState(source?.name ?? "");
  const [exercises, setExercises] = useState<RoutineExercise[]>(
    source?.exercises ?? [],
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const canSave = name.trim().length > 0 && exercises.length > 0;
  const open = exercises.find((exercise) => exercise.id === openId);

  const add = (rudiment: Rudiment) => {
    setExercises((current) => [...current, newExercise(rudiment)]);
    setIsAdding(false);
  };
  const [saveFailed, setSaveFailed] = useState(false);
  const save = () => {
    const isSaved = saveRoutine({
      id: source ? source.id : newId("routine"),
      name: name.trim(),
      exercises,
    });
    if (isSaved) {
      router.back();
    } else {
      setSaveFailed(true);
    }
  };

  const canDelete = source !== undefined;
  const [deleteFailed, setDeleteFailed] = useState(false);
  const confirmDelete = () => {
    if (!source) {
      return;
    }
    Alert.alert(
      `Delete "${source.name}"?`,
      "The routine is removed. Practice you already did with it stays in Insights.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const isDeleted = onDelete(source.id);
            if (isDeleted) {
              router.dismissTo("/routines");
            } else {
              setDeleteFailed(true);
            }
          },
        },
      ],
    );
  };

  if (open) {
    return (
      <ExerciseEditor
        key={open.id}
        exercise={open}
        onChange={(change) =>
          setExercises((current) =>
            current.map((exercise) =>
              exercise.id === open.id ? { ...exercise, ...change } : exercise,
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
          <AppText variant="body" tone="secondary">
            Cancel
          </AppText>
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
          <AppText variant="bodyStrong" tone="accent">
            Save
          </AppText>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <AppText
          variant="title"
          accessibilityRole="header"
          style={styles.title}
        >
          {source ? "Edit Routine" : "New Routine"}
        </AppText>
        {saveFailed ? (
          <AppText
            variant="bodySmall"
            accessibilityRole="alert"
            style={styles.saveFailed}
          >
            This routine could not be saved. Your changes are still here - try
            again.
          </AppText>
        ) : null}

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
          <AppText
            variant="overline"
            tone="secondary"
            accessibilityRole="header"
          >
            EXERCISES
          </AppText>
          <AppText variant="caption" tone="secondary">
            {routineMinutes({ exercises })} min
          </AppText>
        </View>

        {exercises.map((exercise, index) => {
          const rudiment = findRudiment(exercise.pattern.rudimentId);
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
              <AppText
                variant="body"
                tone="violet"
                tabular
                style={styles.position}
              >
                {String(index + 1).padStart(2, "0")}
              </AppText>
              <View style={styles.rowText}>
                <AppText variant="bodyStrong" numberOfLines={1}>
                  {rudiment.name}
                </AppText>
                <AppText variant="bodySmall" tone="secondary" tabular>
                  {detail}
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
        })}

        {availableRudiments.length > 0 ? (
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
            <AppText variant="bodyStrong" tone="accent">
              Add rudiment
            </AppText>
          </Pressable>
        ) : null}

        {isAdding
          ? availableRudiments.map((rudiment) => (
              <Pressable
                key={rudiment.id}
                accessibilityRole="button"
                accessibilityLabel={`Add ${rudiment.name}`}
                onPress={() => add(rudiment)}
                style={({ pressed }) => [
                  styles.choice,
                  pressed && styles.pressed,
                ]}
              >
                <AppText variant="bodyStrong">{rudiment.name}</AppText>
                <AppText variant="bodySmall" tone="secondary" tabular>
                  {rudiment.category} · Lvl {rudiment.level}
                </AppText>
              </Pressable>
            ))
          : null}

        {canDelete ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={12}
            onPress={confirmDelete}
            style={({ pressed }) => [styles.remove, pressed && styles.pressed]}
          >
            <AppText variant="bodySmall" tone="secondary">
              Delete routine
            </AppText>
          </Pressable>
        ) : null}
        {deleteFailed ? (
          <AppText
            variant="bodySmall"
            accessibilityRole="alert"
            style={styles.deleteFailed}
          >
            This routine could not be deleted. Try again.
          </AppText>
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
  bar: {
    paddingTop: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  content: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  deleteFailed: {
    marginTop: 12,
    textAlign: "center",
  },
  saveFailed: {
    marginTop: 12,
  },
  title: {
    paddingTop: 6,
  },
  subtitleRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  input: {
    marginTop: 16,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    ...textVariants.body,
    color: colors.text.primary,
    backgroundColor: colors.surface,
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontSize: typography.fontSize.title,
  },
  rowText: {
    flex: 1,
    gap: 8,
  },
  add: {
    marginTop: 24,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  choice: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 4,
    backgroundColor: colors.surface,
  },
  columns: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
    ...textVariants.body,
    color: colors.text.primary,
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
  remove: {
    marginTop: 32,
    alignSelf: "center",
  },
  off: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },
});
