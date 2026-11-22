import { useLocalSearchParams, usePreventRemove, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { TextField } from "@/components/TextField/TextField";
import { AppText } from "@/components/AppText/AppText";
import { RowText } from "@/components/RowText/RowText";
import { NumberedRow } from "@/components/NumberedRow/NumberedRow";
import { InlineMessage } from "@/components/InlineMessage/InlineMessage";
import { Button } from "@/components/Button/Button";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { newId } from "@/features/rudiments/domain/ids";
import {
  catalogueSections,
  findEntry,
} from "@/features/library/domain/catalogue";
import {
  findRoutine,
  saveRoutine,
} from "@/features/routines/stores/saved-routines";
import {
  exerciseMinutes,
  newExerciseFor,
  routineMinutes,
} from "@/features/routines/domain/routine-builder";
import { hasRoutineChanged } from "@/features/routines/domain/routine-form";
import type { RoutineExercise } from "@/features/routines/domain/types";
import { colors } from "@/theme/colors";
import { divider, layout, layoutStyles, spacing } from "@/theme/layout";
import { editorStyles } from "@/features/routines/editorStyles";
import { ExerciseEditor } from "@/features/routines/components/ExerciseEditor/ExerciseEditor";

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
  const hasUnsavedChanges = hasRoutineChanged(
    { name: source?.name ?? "", exercises: source?.exercises ?? [] },
    { name, exercises },
  );
  const [isLeaving, setIsLeaving] = useState(false);
  const stopGuarding = usePreventRemove(
    hasUnsavedChanges && !isLeaving,
    ({ repeat }) => {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Discard Changes", "Keep Editing"],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
          userInterfaceStyle: "dark",
        },
        (chosen) => {
          if (chosen === 0) {
            setIsLeaving(true);
            repeat();
          }
        },
      );
    },
  );
  const allowLeaving = () => {
    setIsLeaving(true);
    stopGuarding();
  };
  const open = exercises.find((exercise) => exercise.id === openId);

  const add = (id: string) => {
    const added = newExerciseFor(id);
    if (added) {
      setExercises((current) => [...current, added]);
    }
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
      allowLeaving();
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
              allowLeaving();
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
    <View style={layoutStyles.screen}>
      <View style={editorStyles.bar}>
        <Button variant="text" tone="muted" onPress={() => router.back()}>
          Cancel
        </Button>
        <Button variant="text" tone="accent" disabled={!canSave} onPress={save}>
          Save
        </Button>
      </View>

      <ScrollView
        contentContainerStyle={editorStyles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        <PageTitle>{source ? "Edit Routine" : "New Routine"}</PageTitle>
        {canSave ? null : (
          <AppText variant="bodySmall" tone="secondary" style={styles.hint}>
            Add a name and at least one exercise to save.
          </AppText>
        )}
        {saveFailed ? (
          <InlineMessage style={styles.saveFailed}>
            This routine could not be saved. Your changes are still here - try
            again.
          </InlineMessage>
        ) : null}

        <TextField
          accessibilityLabel="Routine name"
          value={name}
          onChangeText={setName}
          placeholder="Routine name"
          returnKeyType="done"
          maxLength={40}
          style={styles.input}
        />

        <SectionHeader
          title="EXERCISES"
          trailing={`${routineMinutes({ exercises })} min`}
          style={editorStyles.sectionHeader}
        />

        {exercises.map((exercise, index) => {
          const entry = findEntry(exercise.pattern.rudimentId);
          if (!entry) {
            return null;
          }
          const rounds = exercise.rounds.length;
          const detail = `${rounds} ${rounds === 1 ? "round" : "rounds"} · ${exerciseMinutes(exercise)} min`;
          return (
            <NumberedRow
              key={exercise.id}
              position={index + 1}
              accessibilityLabel={`${entry.name}, ${detail}`}
              onPress={() => setOpenId(exercise.id)}
            >
              <RowText title={entry.name} titleLines={1} detail={detail} />
            </NumberedRow>
          );
        })}

        <Button
          variant="text"
          tone="accent"
          icon="plus"
          accessibilityState={{ expanded: isAdding }}
          style={editorStyles.add}
          onPress={() => setIsAdding((adding) => !adding)}
        >
          Add Exercise
        </Button>

        {isAdding
          ? catalogueSections.map((section) => (
              <View key={section.title}>
                <AppText
                  variant="overline"
                  tone="secondary"
                  accessibilityRole="header"
                  style={styles.choiceSection}
                >
                  {section.title.toUpperCase()}
                </AppText>
                {section.entries.map((entry) => (
                  <Pressable
                    key={entry.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${entry.name}, ${entry.category}, level ${entry.level}`}
                    onPress={() => add(entry.id)}
                    style={({ pressed }) => [
                      styles.choice,
                      pressed && layoutStyles.pressed,
                    ]}
                  >
                    <RowText
                      label={`${entry.category} · Lvl ${entry.level}`.toUpperCase()}
                      title={entry.name}
                      style={styles.choiceText}
                    />
                    <SymbolView
                      name="plus"
                      size={13}
                      weight="medium"
                      tintColor={colors.accent}
                    />
                  </Pressable>
                ))}
              </View>
            ))
          : null}

        {canDelete ? (
          <Button
            variant="text"
            tone="muted"
            style={editorStyles.remove}
            onPress={confirmDelete}
          >
            Delete Routine
          </Button>
        ) : null}
        {deleteFailed ? (
          <InlineMessage style={styles.deleteFailed}>
            This routine could not be deleted. Try again.
          </InlineMessage>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  deleteFailed: {
    marginTop: spacing.md,
    textAlign: "center",
  },
  hint: {
    marginTop: spacing.sm,
  },
  saveFailed: {
    marginTop: spacing.md,
  },
  input: {
    marginTop: spacing.lg,
    minHeight: 52,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: layout.radius.panel,
    backgroundColor: colors.surface,
  },
  choiceSection: {
    marginTop: spacing.xl,
  },
  choice: {
    paddingVertical: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    ...divider.bottom,
  },
  choiceText: {
    flex: 1,
  },
});
