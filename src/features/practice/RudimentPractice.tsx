import { NotificationFeedbackType, notificationAsync } from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/AppText/AppText";
import {
  RhythmBar,
  RhythmBarSeparator,
} from "@/components/RhythmBar/RhythmBar";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { NoteValuePicker } from "@/features/rudiments/components/NoteValuePicker/NoteValuePicker";
import { STAGE_HEIGHT } from "@/features/rudiments/components/PadAnimation/PadAnimation";
import { RoundClock } from "@/features/practice/components/RoundClock/RoundClock";
import { RudimentPlayer } from "@/features/rudiments/components/RudimentPlayer/RudimentPlayer";
import { IconButton } from "@/components/IconButton/IconButton";
import { InlineMessage } from "@/components/InlineMessage/InlineMessage";
import { WeekProgress } from "@/features/practice/components/WeekProgress/WeekProgress";
import { fraction, multiply } from "@/features/rudiments/domain/fraction";
import { findRudiment } from "@/features/rudiments/domain/library";
import { useRoundPractice } from "@/features/practice/hooks/use-round-practice";
import { nextExercise } from "@/features/practice/domain/session";
import { activeSession } from "@/features/practice/stores/practice-session";
import {
  buildTimeline,
  evenStep,
  scaleToStep,
} from "@/features/rudiments/domain/timeline";
import {
  SOUND_FAILED_MESSAGE,
  useStrokeSound,
} from "@/features/rudiments/hooks/use-stroke-sound";
import { Button } from "@/components/Button/Button";
import { colors } from "@/theme/colors";
import { divider, layout, layoutStyles, spacing } from "@/theme/layout";
import { nativeHeader } from "@/theme/navigation";

const MIN_PAD_SCALE = 0.6;
const MAX_ROUND_MARKS = 5;
const HEADER_BUTTONS_WIDTH = 152;

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
  const { width: windowWidth } = useWindowDimensions();
  const { sound, hasFailed: hasSoundFailed } = useStrokeSound();
  const {
    routine: activeRoutine,
    exercise,
    round,
    done,
    roundGoal,
    isComplete,
    pattern,
    rhythmicScale,
    initialTempo,
    track,
    changeScale,
    finishRound: completeRound,
    undo,
  } = useRoundPractice({ rudiment, routineId: routine, exerciseId });
  const finishRound = () => {
    const outcome = completeRound();
    if (outcome) {
      notificationAsync(NotificationFeedbackType.Success).catch(() => {});
    }
    if (outcome === "routine-complete" && activeRoutine) {
      router.replace({
        pathname: "/summary",
        params: { routine: activeRoutine.id },
      });
    } else if (outcome === "exercise-complete" && activeRoutine) {
      const next = nextExercise(activeSession(activeRoutine.id), activeRoutine);
      if (next) {
        router.replace({
          pathname: "/rudiment/[id]",
          params: {
            id: next.pattern.rudimentId,
            routine: activeRoutine.id,
            exercise: next.id,
          },
        });
      } else {
        router.back();
      }
    }
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
    <SafeAreaView
      edges={["bottom"]}
      style={[layoutStyles.screen, styles.screen]}
    >
      <Stack.Screen
        options={{
          ...nativeHeader,
          headerBackTitle: activeRoutine?.name ?? "Rudiments",
          headerTitle: () => (
            <View
              style={[
                styles.wordmark,
                { width: windowWidth - HEADER_BUTTONS_WIDTH },
              ]}
            >
              <AppText variant="headline">ghostnote</AppText>
              <View style={styles.rule} />
            </View>
          ),
          unstable_headerRightItems: () => [
            {
              type: "custom",
              hidesSharedBackground: true,
              element: (
                <IconButton
                  icon="person"
                  accessibilityLabel="Profile"
                  size={24}
                  weight="light"
                  onPress={() => router.push("/profile")}
                />
              ),
            },
          ],
        }}
      />
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
            <PageTitle style={styles.title}>{rudiment.name}</PageTitle>
            <RhythmBar style={styles.settings}>
              <AppText
                variant="bodyStrong"
                tone="secondary"
                accessibilityLabel="Time signature, 4 4"
              >
                4/4
              </AppText>
              <RhythmBarSeparator />
              <AppText
                variant="body"
                tone="secondary"
                numberOfLines={1}
                accessibilityLabel={`${rudiment.category}, level ${rudiment.level}`}
                style={styles.detail}
              >
                {rudiment.category} · Lvl {rudiment.level}
              </AppText>
              {pattern && step ? (
                <NoteValuePicker
                  subdivision={subdivision}
                  onChange={(value) =>
                    changeScale(scaleToStep(pattern, fraction(1, value)))
                  }
                />
              ) : null}
            </RhythmBar>
            {hasSoundFailed ? (
              <InlineMessage style={styles.soundFailed}>
                {SOUND_FAILED_MESSAGE}
              </InlineMessage>
            ) : null}
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
          <AppText variant="bodySmall" tone="secondary">
            This rudiment has no player yet.
          </AppText>
        )}
      </ScrollView>
      {exercise && activeRoutine ? (
        <View style={styles.rounds}>
          <WeekProgress
            done={done}
            goal={roundGoal}
            unit="rounds"
            description={`${done} of ${roundGoal} rounds done`}
            showMarks={roundGoal <= MAX_ROUND_MARKS}
          />
          {done > 0 ? (
            <Button
              variant="text"
              tone="muted"
              accessibilityLabel="Undo last round"
              style={styles.undo}
              onPress={undo}
            >
              Undo
            </Button>
          ) : null}
          <Button variant="tonal" disabled={isComplete} onPress={finishRound}>
            {isComplete ? "All Rounds Done" : "Round Done"}
          </Button>
        </View>
      ) : null}
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
  soundFailed: {
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  wordmark: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  content: {
    paddingBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.md,
  },
  settings: {
    marginBottom: spacing.lg,
  },
  rounds: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    ...divider.top,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  undo: {
    marginRight: "auto",
  },
  detail: {
    flex: 1,
  },
});
