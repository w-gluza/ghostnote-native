import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { useState } from "react";

import { AppText } from "@/components/AppText/AppText";
import { InlineMessage } from "@/components/InlineMessage/InlineMessage";
import { IconButton } from "@/components/IconButton/IconButton";
import { Button } from "@/components/Button/Button";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { NoteValuePicker } from "@/features/rudiments/components/NoteValuePicker/NoteValuePicker";
import { fraction, multiply } from "@/features/rudiments/domain/fraction";
import { findEntry } from "@/features/library/domain/catalogue";
import { resolvePattern } from "@/features/rudiments/domain/library";
import { evenStep, scaleToStep } from "@/features/rudiments/domain/timeline";
import { MAX_BPM, MIN_BPM } from "@/features/rudiments/domain/timing";
import {
  formatDuration,
  MAX_ROUND_SECONDS,
  MAX_ROUNDS,
  MIN_ROUND_SECONDS,
  parseDuration,
  parseTempo,
} from "@/features/routines/domain/routine-form";
import {
  exerciseMinutes,
  NEW_ROUND_SECONDS,
  newRound,
} from "@/features/routines/domain/routine-builder";
import type {
  RoutineExercise,
  RoutineRound,
} from "@/features/routines/domain/types";
import { colors } from "@/theme/colors";
import { divider, layoutStyles, spacing } from "@/theme/layout";
import { editorStyles } from "@/features/routines/editorStyles";
import { RoundField } from "@/features/routines/components/RoundField/RoundField";

export function ExerciseEditor({
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
  const { fontScale } = useWindowDimensions();
  const roundColumn = { width: ROUND_COLUMN_WIDTH * fontScale };
  const entry = findEntry(exercise.pattern.rudimentId);
  const pattern = resolvePattern(exercise.pattern);
  const step = pattern ? evenStep(pattern) : undefined;
  const strokeStep = step ? multiply(step, exercise.rhythmicScale) : undefined;
  const minutes = exerciseMinutes(exercise);
  const [wasRejected, setWasRejected] = useState(false);
  const changeRound = (id: string, change: Partial<RoutineRound>) => {
    setWasRejected(false);
    onChange({
      rounds: exercise.rounds.map((round) =>
        round.id === id ? { ...round, ...change } : round,
      ),
    });
  };
  const addRound = () => {
    const last = exercise.rounds[exercise.rounds.length - 1];
    onChange({
      rounds: [
        ...exercise.rounds,
        newRound(
          last?.tempo.bpm ?? entry?.defaultBpm ?? 80,
          last?.durationSeconds ?? NEW_ROUND_SECONDS,
        ),
      ],
    });
  };
  const removeRound = (id: string) =>
    onChange({ rounds: exercise.rounds.filter((round) => round.id !== id) });

  return (
    <View style={layoutStyles.screen}>
      <View style={editorStyles.bar}>
        <Button
          variant="text"
          icon="chevron.left"
          accessibilityLabel="Back to Edit Routine"
          onPress={onClose}
        >
          Edit Routine
        </Button>
      </View>

      <ScrollView
        contentContainerStyle={editorStyles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        <PageTitle>{entry?.name}</PageTitle>
        <View style={styles.subtitleRow}>
          <AppText
            variant="body"
            tone="secondary"
            accessibilityLabel={`${entry?.category}, level ${entry?.level}`}
          >
            {entry?.category} · Lvl {entry?.level}
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

        <SectionHeader
          title="ROUNDS"
          trailing={`${minutes} min total`}
          style={editorStyles.sectionHeader}
        />

        <View style={styles.columns}>
          <AppText variant="overline" tone="secondary" style={roundColumn}>
            ROUND
          </AppText>
          <AppText
            variant="overline"
            tone="secondary"
            style={styles.fieldColumn}
          >
            TEMPO{"\n"}
            {MIN_BPM}-{MAX_BPM} BPM
          </AppText>
          <AppText
            variant="overline"
            tone="secondary"
            style={styles.fieldColumn}
          >
            DURATION{"\n"}
            {formatDuration(MIN_ROUND_SECONDS)}-
            {formatDuration(MAX_ROUND_SECONDS)} MIN:SEC
          </AppText>
          {exercise.rounds.length > 1 ? (
            <View style={styles.removeColumn} />
          ) : null}
        </View>

        {exercise.rounds.map((round, index) => (
          <View key={round.id} style={styles.roundRow}>
            <View style={roundColumn}>
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
                onReject={() => setWasRejected(true)}
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
                onReject={() => setWasRejected(true)}
                onChange={(durationSeconds) =>
                  changeRound(round.id, { durationSeconds })
                }
              />
            </View>
            {exercise.rounds.length > 1 ? (
              <IconButton
                icon="minus.circle"
                accessibilityLabel={`Remove round ${index + 1}`}
                tone="muted"
                weight="regular"
                hitSlop={10}
                style={styles.removeColumn}
                onPress={() => removeRound(round.id)}
              />
            ) : null}
          </View>
        ))}

        {wasRejected ? (
          <InlineMessage style={styles.rejected}>
            That value is outside the range shown above, so the previous one was
            kept.
          </InlineMessage>
        ) : null}

        {exercise.rounds.length < MAX_ROUNDS ? (
          <Button
            variant="text"
            tone="accent"
            icon="plus"
            style={editorStyles.add}
            onPress={addRound}
          >
            Add Round
          </Button>
        ) : null}

        <View style={styles.total}>
          <AppText variant="body" tone="secondary">
            Total duration
          </AppText>
          <AppText variant="heading" tabular>
            {minutes} min
          </AppText>
        </View>

        <Button
          variant="text"
          tone="muted"
          style={editorStyles.remove}
          onPress={onRemove}
        >
          Remove from Routine
        </Button>
      </ScrollView>
    </View>
  );
}

const ROUND_COLUMN_WIDTH = 64;

const styles = StyleSheet.create({
  subtitleRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  columns: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  fieldColumn: {
    flex: 1,
  },
  removeColumn: {
    width: 24,
    minWidth: 24,
  },
  roundRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  roundBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  rejected: {
    marginTop: spacing.md,
  },
  total: {
    marginTop: spacing.lg,
    paddingTop: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...divider.top,
  },
});
