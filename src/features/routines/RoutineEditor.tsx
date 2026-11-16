import { useLocalSearchParams, usePreventRemove, useRouter } from "expo-router";
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
  availableRudiments,
  findRudiment,
} from "@/features/rudiments/domain/library";
import {
  findRoutine,
  saveRoutine,
} from "@/features/routines/stores/saved-routines";
import {
  exerciseMinutes,
  newExercise,
  routineMinutes,
} from "@/features/routines/domain/routine-builder";
import { hasRoutineChanged } from "@/features/routines/domain/routine-form";
import type { RoutineExercise } from "@/features/routines/domain/types";
import type { Rudiment } from "@/features/rudiments/domain/types";
import { colors } from "@/theme/colors";
import { layout, layoutStyles, spacing } from "@/theme/layout";
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
  const allowLeaving = usePreventRemove(hasUnsavedChanges, ({ repeat }) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Discard Changes", "Keep Editing"],
        destructiveButtonIndex: 0,
        cancelButtonIndex: 1,
        userInterfaceStyle: "dark",
      },
      (chosen) => {
        if (chosen === 0) {
          repeat();
        }
      },
    );
  });
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
            Add a name and at least one rudiment to save.
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
          const rudiment = findRudiment(exercise.pattern.rudimentId);
          if (!rudiment) {
            return null;
          }
          const rounds = exercise.rounds.length;
          const detail = `${rounds} ${rounds === 1 ? "round" : "rounds"} · ${exerciseMinutes(exercise)} min`;
          return (
            <NumberedRow
              key={exercise.id}
              position={index + 1}
              accessibilityLabel={`${rudiment.name}, ${detail}`}
              onPress={() => setOpenId(exercise.id)}
            >
              <RowText title={rudiment.name} titleLines={1} detail={detail} />
            </NumberedRow>
          );
        })}

        {availableRudiments.length > 0 ? (
          <Button
            variant="text"
            tone="accent"
            icon="plus"
            accessibilityState={{ expanded: isAdding }}
            style={editorStyles.add}
            onPress={() => setIsAdding((adding) => !adding)}
          >
            Add rudiment
          </Button>
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
                  pressed && layoutStyles.pressed,
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
          <Button
            variant="text"
            tone="muted"
            style={editorStyles.remove}
            onPress={confirmDelete}
          >
            Delete routine
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
  choice: {
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: layout.radius.panel,
    gap: spacing.xs,
    backgroundColor: colors.surface,
  },
});
