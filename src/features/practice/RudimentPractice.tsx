import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { NoteValuePicker } from "@/features/rudiments/components/NoteValuePicker/NoteValuePicker";
import { STAGE_HEIGHT } from "@/features/rudiments/components/PadAnimation/PadAnimation";
import { RoundClock } from "@/features/practice/components/RoundClock/RoundClock";
import { RudimentPlayer } from "@/features/rudiments/components/RudimentPlayer/RudimentPlayer";
import { ScreenHeader } from "@/components/ScreenHeader/ScreenHeader";
import { WeekProgress } from "@/features/practice/components/WeekProgress/WeekProgress";
import { fraction, multiply, ONE } from "@/features/rudiments/domain/fraction";
import {
  defaultBpm,
  defaultPattern,
  findRudiment,
  resolvePattern,
  defaultPatternReference,
} from "@/features/rudiments/domain/library";
import {
  activeSession,
  completeRound,
  finishFree,
  pauseRound,
  rescaleFree,
  rescaleRound,
  trackFree,
  trackRound,
  undoRound,
  useActiveSession,
} from "@/features/practice/hooks/practice-session";
import {
  isRoutineComplete,
  nextRound,
  roundsDone,
} from "@/features/practice/domain/session";
import { useRoutine } from "@/features/practice/hooks/saved-routines";
import {
  buildTimeline,
  evenStep,
  scaleToStep,
} from "@/features/rudiments/domain/timeline";
import { quarterTempo } from "@/features/rudiments/domain/timing";
import type { Fraction, Tempo } from "@/features/rudiments/domain/types";
import { useStrokeSound } from "@/features/rudiments/hooks/use-stroke-sound";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

const MIN_PAD_SCALE = 0.6;

export default function RudimentScreen() {
  const {
    id,
    routine,
    exercise: exerciseId,
  } = useLocalSearchParams<{
    id: string;
    routine?: string;
    exercise?: string;
  }>();
  const rudiment = findRudiment(id);
  const router = useRouter();
  const sound = useStrokeSound();
  const openedRoutine = useRoutine(routine);
  const activeRoutine = routine ? openedRoutine : undefined;
  const exercise = activeRoutine?.exercises.find(
    (item) => item.id === exerciseId,
  );
  const session = useActiveSession(activeRoutine?.id ?? "");
  const roundGoal = exercise?.rounds.length ?? 0;
  const done = exercise ? roundsDone(session, exercise) : 0;
  const round = exercise ? nextRound(session, exercise) : undefined;
  const isComplete = exercise ? round === undefined : false;
  const pattern = exercise
    ? resolvePattern(exercise.pattern)
    : rudiment
      ? defaultPattern(rudiment)
      : undefined;
  const [rhythmicScale, setRhythmicScale] = useState(
    () =>
      exercise?.rhythmicScale ?? (pattern ? scaleToStep(pattern, ONE) : ONE),
  );
  const initialTempo =
    round?.tempo ??
    exercise?.rounds[roundGoal - 1]?.tempo ??
    quarterTempo(rudiment ? defaultBpm(rudiment) : 80);
  const freePattern = round
    ? undefined
    : (exercise?.pattern ??
      (rudiment ? defaultPatternReference(rudiment) : undefined));
  const freeRudimentId = freePattern?.rudimentId;
  const track = (isPlaying: boolean, tempo: Tempo) => {
    if (activeRoutine && exercise && round) {
      trackRound(
        activeRoutine,
        exercise,
        round,
        { isPlaying, tempo, rhythmicScale },
        Date.now(),
      );
    } else if (freePattern) {
      trackFree(freePattern, { isPlaying, tempo, rhythmicScale }, Date.now());
    }
  };
  const changeScale = (scale: Fraction) => {
    setRhythmicScale(scale);
    if (activeRoutine && exercise && round) {
      rescaleRound(activeRoutine.id, exercise.id, round.id, scale, Date.now());
    } else if (freeRudimentId) {
      rescaleFree(freeRudimentId, scale, Date.now());
    }
  };
  useEffect(() => {
    if (!freeRudimentId) {
      return;
    }
    return () => {
      finishFree(freeRudimentId, Date.now());
    };
  }, [freeRudimentId]);
  const trackedRoutineId = activeRoutine?.id;
  const trackedExerciseId = exercise?.id;
  const trackedRoundId = round?.id;
  useEffect(() => {
    if (!trackedRoutineId || !trackedExerciseId || !trackedRoundId) {
      return;
    }
    return () => {
      pauseRound(
        trackedRoutineId,
        trackedExerciseId,
        trackedRoundId,
        Date.now(),
      );
    };
  }, [trackedRoutineId, trackedExerciseId, trackedRoundId]);
  const finishRound = () => {
    if (!exercise || !activeRoutine || !round) {
      return;
    }
    completeRound(activeRoutine, exercise, round, Date.now());
    const isLastOfExercise = done + 1 >= roundGoal;
    if (isRoutineComplete(activeSession(activeRoutine.id), activeRoutine)) {
      router.replace({
        pathname: "/summary",
        params: { routine: activeRoutine.id },
      });
    } else if (isLastOfExercise) {
      router.back();
    }
  };
  const undo = () => {
    if (!exercise || !activeRoutine) {
      return;
    }
    undoRound(activeRoutine.id, exercise.id, Date.now());
  };
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [padScale, setPadScale] = useState(1);
  const fitPad = (viewport: number, content: number) => {
    if (viewport === 0 || content === 0) {
      return;
    }
    const naturalHeight = content + (1 - padScale) * STAGE_HEIGHT;
    const overflow = Math.max(0, naturalHeight - viewport);
    const fitted = Math.max(MIN_PAD_SCALE, 1 - overflow / STAGE_HEIGHT);
    if (Math.abs(fitted - padScale) > 0.01) {
      setPadScale(fitted);
    }
  };
  const step = pattern ? evenStep(pattern) : undefined;
  const strokeStep = step ? multiply(step, rhythmicScale) : undefined;
  const subdivision =
    strokeStep && strokeStep.numerator === 1 ? strokeStep.denominator : 0;
  const timeline = pattern ? buildTimeline(pattern, rhythmicScale) : undefined;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
      <ScreenHeader onBack={router.back} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onLayout={(event) => {
          const viewport = event.nativeEvent.layout.height;
          setViewportHeight(viewport);
          fitPad(viewport, contentHeight);
        }}
        onContentSizeChange={(_, content) => {
          setContentHeight(content);
          fitPad(viewportHeight, content);
        }}
      >
        {rudiment && timeline ? (
          <>
            <Text accessibilityRole="header" style={styles.title}>
              {rudiment.name}
            </Text>
            <View style={styles.settings}>
              <Text
                accessibilityLabel="Time signature, 4 4"
                style={styles.signature}
              >
                4/4
              </Text>
              <View style={styles.separator} />
              <Text numberOfLines={1} style={styles.detail}>
                {rudiment.category} · Lvl {rudiment.level}
              </Text>
              {pattern && step ? (
                <NoteValuePicker
                  subdivision={subdivision}
                  onChange={(value) =>
                    changeScale(scaleToStep(pattern, fraction(1, value)))
                  }
                />
              ) : null}
            </View>
            <RudimentPlayer
              key={`${rudiment.id}-${round?.id ?? ""}`}
              timeline={timeline}
              initialTempo={initialTempo}
              onActivity={track}
              sound={sound}
              padScale={padScale}
            >
              {exercise && activeRoutine && round ? (
                <RoundClock
                  key={round.id}
                  routineId={activeRoutine.id}
                  exerciseId={exercise.id}
                  roundId={round.id}
                  position={done + 1}
                  targetSeconds={round.durationSeconds}
                />
              ) : null}
            </RudimentPlayer>
          </>
        ) : (
          <Text style={styles.meta}>This rudiment has no player yet.</Text>
        )}
      </ScrollView>
      {exercise && activeRoutine ? (
        <View style={styles.rounds}>
          <WeekProgress
            done={done}
            goal={roundGoal}
            unit="rounds"
            description={`${done} of ${roundGoal} rounds done`}
          />
          {done > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Undo last round"
              hitSlop={12}
              onPress={undo}
              style={({ pressed }) => [styles.undo, pressed && styles.pressed]}
            >
              <Text style={styles.undoLabel}>Undo</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={isComplete}
            onPress={finishRound}
            style={({ pressed }) => [
              styles.roundDone,
              isComplete && styles.roundDoneOff,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.roundDoneLabel}>
              {isComplete ? "All rounds done" : "Round done"}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
    marginTop: 16,
  },
  content: {
    paddingBottom: 8,
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.heading,
    lineHeight: 34,
    paddingTop: 6,
    marginBottom: 12,
  },
  settings: {
    marginBottom: 16,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
  },
  signature: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.title,
  },
  rounds: {
    marginTop: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  undo: {
    marginRight: "auto",
  },
  undoLabel: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.label,
  },
  roundDone: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  roundDoneOff: {
    opacity: 0.5,
  },
  roundDoneLabel: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.label,
  },
  pressed: {
    opacity: 0.7,
  },
  separator: {
    width: StyleSheet.hairlineWidth,
    height: 22,
    backgroundColor: colors.disabled,
  },
  detail: {
    flex: 1,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
  },
  meta: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
  },
});
