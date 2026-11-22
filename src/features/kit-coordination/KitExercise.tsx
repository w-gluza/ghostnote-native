import { Stack, useIsFocused, useLocalSearchParams } from "expo-router";
import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AppState,
  Image,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/AppText/AppText";
import { InlineMessage } from "@/components/InlineMessage/InlineMessage";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { PlaybackControls } from "@/components/PlaybackControls/PlaybackControls";
import { RhythmGrid } from "@/features/kit-coordination/components/RhythmGrid/RhythmGrid";
import {
  findKitExercise,
  kitSetup,
  notesOf,
  sessionReference,
  type KitSetup,
} from "@/features/kit-coordination/domain/exercises";
import { velocityLevel } from "@/features/kit-coordination/domain/midi-map";
import {
  buildKitTimeline,
  toggled,
} from "@/features/kit-coordination/domain/timeline";
import type { KitExercise } from "@/features/kit-coordination/domain/types";
import {
  hasKitSample,
  useKitSound,
} from "@/features/kit-coordination/hooks/use-kit-sound";
import { RoundBar } from "@/features/practice/components/RoundBar/RoundBar";
import { RoundClock } from "@/features/practice/components/RoundClock/RoundClock";
import { usePlayerHeader } from "@/features/practice/hooks/use-player-header";
import { useFinishRound } from "@/features/practice/hooks/use-finish-round";
import { useRoundPractice } from "@/features/practice/hooks/use-round-practice";
import {
  finishFree,
  trackFree,
} from "@/features/practice/stores/practice-session";
import { ONE } from "@/features/rudiments/domain/fraction";
import { clampBpm, MAX_BPM, MIN_BPM } from "@/features/rudiments/domain/timing";
import type { Tempo } from "@/features/rudiments/domain/types";
import { useRudimentPlayback } from "@/features/rudiments/hooks/use-rudiment-playback";
import { layout, layoutStyles, spacing } from "@/theme/layout";

const BPM_STEP = 5;
const LARGEST_ONE_LINE_FONT_SCALE = 1.3;

const KIT_PICTURES: Record<
  KitSetup,
  { source: ImageSourcePropType; aspectRatio: number }
> = {
  "hihat-snare-kick": {
    source: require("@/assets/images/kits/hihat-snare-kick.webp"),
    aspectRatio: 1153 / 962,
  },
  "hihat-snare-kick-ride": {
    source: require("@/assets/images/kits/hihat-snare-kick-ride.webp"),
    aspectRatio: 1290 / 931,
  },
  full: {
    source: require("@/assets/images/kits/full.webp"),
    aspectRatio: 1441 / 869,
  },
};

type RoutineRoundInPlay = {
  roundId: string;
  initialBpm: number;
  onTrack: (isPlaying: boolean, tempo: Tempo) => void;
};

function KitPlayer({
  exercise,
  round,
  isInRoutine,
  roundBar,
}: {
  exercise: KitExercise;
  round?: RoutineRoundInPlay;
  isInRoutine: boolean;
  roundBar?: ReactNode;
}) {
  const { pattern } = exercise;
  const [enabled, setEnabled] = useState(() => notesOf(pattern));
  const timeline = useMemo(
    () => buildKitTimeline(pattern, notesOf(pattern)),
    [pattern],
  );
  const [bpm, setBpm] = useState(
    clampBpm(round?.initialBpm ?? exercise.defaultTempo.bpm),
  );
  const tempo = { ...exercise.defaultTempo, bpm };
  const { sound, problem: soundProblem } = useKitSound();

  const { fontScale } = useWindowDimensions();
  const fitsOneLine = fontScale <= LARGEST_ONE_LINE_FONT_SCALE;
  const picture = KIT_PICTURES[kitSetup(notesOf(pattern))];

  const reference = sessionReference(exercise);
  const trackRound = round?.onTrack;
  const track = (isPlaying: boolean, playedBpm: number) =>
    trackRound
      ? trackRound(isPlaying, { ...exercise.defaultTempo, bpm: playedBpm })
      : trackFree(
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
        if (enabled.includes(event.note) && hasKitSample(event.note)) {
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

  const isFreePractice = round === undefined;
  useEffect(() => {
    if (!isFreePractice) {
      return;
    }
    const exerciseId = exercise.id;
    return () => {
      finishFree(exerciseId, Date.now());
    };
  }, [exercise.id, isFreePractice]);

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
        <PageTitle
          numberOfLines={fitsOneLine ? 1 : undefined}
          adjustsFontSizeToFit={fitsOneLine}
          minimumFontScale={0.75}
          trailing={
            <AppText
              variant="overline"
              tone="secondary"
              accessibilityLabel={`Level ${exercise.level}`}
            >
              LVL {exercise.level}
            </AppText>
          }
        >
          {exercise.name}
        </PageTitle>

        {soundProblem ? (
          <InlineMessage style={styles.problem}>{soundProblem}</InlineMessage>
        ) : null}

        <View style={styles.stage}>
          <Image
            source={picture.source}
            resizeMode="contain"
            accessible={false}
            accessibilityIgnoresInvertColors
            style={[
              styles.kit,
              isInRoutine && styles.kitInRoutine,
              { aspectRatio: picture.aspectRatio },
            ]}
          />

          <RhythmGrid
            pattern={pattern}
            enabled={enabled}
            playingColumn={playingColumn}
            onToggle={(row) => setEnabled(toggled(enabled, row))}
          />
        </View>
      </ScrollView>
      {roundBar}
      <PlaybackControls
        variant="bar"
        bpm={bpm}
        minBpm={MIN_BPM}
        maxBpm={MAX_BPM}
        step={BPM_STEP}
        isPlaying={playback.isPlaying}
        onChangeBpm={changeBpm}
        onTogglePlayback={togglePlayback}
      />
    </>
  );
}

export function KitExerciseScreenFor({
  exercise,
  backTitle,
}: {
  exercise: KitExercise | undefined;
  backTitle: string;
}) {
  const { routine: routineId, exercise: exerciseId } = useLocalSearchParams<{
    routine?: string;
    exercise?: string;
  }>();
  const practice = useRoundPractice({
    rudiment: undefined,
    routineId,
    exerciseId,
  });
  const finishRound = useFinishRound(practice.routine, practice.finishRound);
  const header = usePlayerHeader(practice.routine?.name ?? backTitle);
  const round =
    practice.routine && practice.exercise && practice.round
      ? {
          roundId: practice.round.id,
          initialBpm: practice.initialTempo.bpm,
          onTrack: practice.track,
        }
      : undefined;

  const roundBar =
    practice.routine && practice.exercise ? (
      <RoundBar
        done={practice.done}
        goal={practice.roundGoal}
        onUndo={practice.undo}
        onFinish={finishRound}
        clock={
          practice.round ? (
            <RoundClock
              key={practice.round.id}
              routineId={practice.routine.id}
              exerciseId={practice.exercise.id}
              roundId={practice.round.id}
              position={practice.done + 1}
              targetSeconds={practice.round.durationSeconds}
              onTargetReached={finishRound}
            />
          ) : null
        }
      />
    ) : undefined;

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[layoutStyles.screen, styles.screen]}
    >
      <Stack.Screen options={header} />
      {exercise ? (
        <KitPlayer
          key={round?.roundId ?? "free"}
          exercise={exercise}
          round={round}
          isInRoutine={practice.exercise !== undefined}
          roundBar={roundBar}
        />
      ) : (
        <AppText variant="bodySmall" tone="secondary">
          This exercise could not be found.
        </AppText>
      )}
    </SafeAreaView>
  );
}

export default function KitExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <KitExerciseScreenFor
      exercise={findKitExercise(id)}
      backTitle="Kit Coordination"
    />
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
    flexGrow: 1,
  },
  stage: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  kitInRoutine: {
    height: 150,
    marginBottom: spacing.xl,
  },
  problem: {
    marginBottom: spacing.xl,
  },
  kit: {
    alignSelf: "center",
    width: undefined,
    maxWidth: "100%",
    height: 200,
    marginBottom: spacing.xxl,
  },
});
