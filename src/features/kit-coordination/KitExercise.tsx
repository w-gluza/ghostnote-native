import { Stack, useIsFocused, useLocalSearchParams } from "expo-router";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { AppState, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/AppText/AppText";
import { InlineMessage } from "@/components/InlineMessage/InlineMessage";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { PlayButton } from "@/components/PlayButton/PlayButton";
import { Stat } from "@/components/Stat/Stat";
import { TempoStepper } from "@/components/TempoStepper/TempoStepper";
import { RhythmGrid } from "@/features/kit-coordination/components/RhythmGrid/RhythmGrid";
import {
  findKitExercise,
  notesOf,
  sessionReference,
  stageChips,
} from "@/features/kit-coordination/domain/exercises";
import { velocityLevel } from "@/features/kit-coordination/domain/midi-map";
import { buildKitTimeline } from "@/features/kit-coordination/domain/timeline";
import type { KitExercise } from "@/features/kit-coordination/domain/types";
import {
  hasKitSample,
  useKitSound,
} from "@/features/kit-coordination/hooks/use-kit-sound";
import {
  finishFree,
  trackFree,
} from "@/features/practice/stores/practice-session";
import { FilterChips } from "@/features/rudiments/components/FilterChips/FilterChips";
import { ONE } from "@/features/rudiments/domain/fraction";
import { clampBpm, MAX_BPM, MIN_BPM } from "@/features/rudiments/domain/timing";
import { useRudimentPlayback } from "@/features/rudiments/hooks/use-rudiment-playback";
import { layout, layoutStyles, spacing } from "@/theme/layout";
import { nativeHeader } from "@/theme/navigation";

const BPM_STEP = 5;

function KitPlayer({ exercise }: { exercise: KitExercise }) {
  const { pattern, stages } = exercise;
  const chips = stageChips(exercise);
  const [stageIndex, setStageIndex] = useState(0);
  const stage = stages[stageIndex] ?? stages[0];
  const notes = useMemo(() => stage?.notes ?? [], [stage]);
  const timeline = useMemo(
    () => buildKitTimeline(pattern, notesOf(pattern)),
    [pattern],
  );
  const [bpm, setBpm] = useState(clampBpm(exercise.defaultTempo.bpm));
  const tempo = { ...exercise.defaultTempo, bpm };
  const { sound, problem: soundProblem } = useKitSound();

  const reference = sessionReference(exercise);
  const track = (isPlaying: boolean, playedBpm: number) =>
    trackFree(
      reference,
      {
        isPlaying,
        tempo: { ...exercise.defaultTempo, bpm: playedBpm },
        rhythmicScale: ONE,
      },
      Date.now(),
      { kind: exercise.kind, name: exercise.name },
    );
  const isTracking = useRef(false);
  const stopTracking = () => {
    if (isTracking.current) {
      isTracking.current = false;
      track(false, bpm);
    }
  };

  const playback = useRudimentPlayback({
    timeline,
    tempo,
    clock: sound?.now,
    restartOnPlay: true,
    onSchedule: (index, timeMs) => {
      timeline.strokes[index]?.events.forEach((event) => {
        if (notes.includes(event.note) && hasKitSample(event.note)) {
          sound?.play(`${event.note}`, velocityLevel(event.velocity), timeMs);
        }
      });
    },
    onCancel: sound?.cancel,
    onStroke: () => {
      if (!isTracking.current) {
        isTracking.current = true;
        track(true, bpm);
      }
    },
  });

  useEffect(() => {
    const exerciseId = exercise.id;
    return () => {
      finishFree(exerciseId, Date.now());
    };
  }, [exercise.id]);

  const togglePlayback = () => {
    stopTracking();
    playback.toggle();
  };
  const changeBpm = (value: number) => {
    const next = clampBpm(value);
    setBpm(next);
    if (isTracking.current) {
      track(true, next);
    }
  };

  const leaveForeground = useEffectEvent(() => {
    stopTracking();
    playback.pause();
  });
  const isFocused = useIsFocused();
  useEffect(() => {
    if (!isFocused) {
      leaveForeground();
    }
  }, [isFocused]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        leaveForeground();
      }
    });
    return () => subscription.remove();
  }, []);

  const playingColumn =
    playback.isPlaying && playback.activeIndex !== null
      ? (timeline.strokes[playback.activeIndex]?.column ?? null)
      : null;

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageTitle>{exercise.name}</PageTitle>

        <View style={styles.stages}>
          <FilterChips
            options={chips}
            selected={chips[stageIndex] ?? ""}
            onSelect={(chip) => setStageIndex(Math.max(0, chips.indexOf(chip)))}
          />
        </View>

        <AppText variant="overline" tone="secondary" style={styles.overline}>
          STAGE {stageIndex + 1} OF {stages.length} · LVL {exercise.level}
        </AppText>
        <AppText variant="heading" accessibilityRole="header">
          {stage?.title}
        </AppText>
        <AppText variant="body" tone="secondary" style={styles.instruction}>
          {stage?.instruction}
        </AppText>

        {soundProblem ? (
          <InlineMessage style={styles.problem}>{soundProblem}</InlineMessage>
        ) : null}

        <RhythmGrid
          pattern={pattern}
          active={notes}
          playingColumn={playingColumn}
        />
      </ScrollView>
      <View style={styles.controls}>
        <TempoStepper
          canDecrease={bpm > MIN_BPM}
          canIncrease={bpm < MAX_BPM}
          onDecrease={() => changeBpm(bpm - BPM_STEP)}
          onIncrease={() => changeBpm(bpm + BPM_STEP)}
        >
          <Stat
            value={bpm}
            label="BPM"
            accessibilityLabel={`${bpm} beats per minute`}
            style={styles.readout}
          />
        </TempoStepper>
        <PlayButton isPlaying={playback.isPlaying} onPress={togglePlayback} />
      </View>
    </>
  );
}

export default function KitExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = findKitExercise(id);

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[layoutStyles.screen, styles.screen]}
    >
      <Stack.Screen
        options={{ ...nativeHeader, headerBackTitle: "Kit Coordination" }}
      />
      {exercise ? (
        <KitPlayer exercise={exercise} />
      ) : (
        <AppText variant="bodySmall" tone="secondary">
          This exercise could not be found.
        </AppText>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: layout.screenInset,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  stages: {
    marginTop: spacing.lg,
  },
  overline: {
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  instruction: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  problem: {
    marginBottom: spacing.xl,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.md,
  },
  readout: {
    minWidth: 72,
  },
});
