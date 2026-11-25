import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

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
import { StrokeVoicePicker } from "@/features/rudiments/components/StrokeVoicePicker/StrokeVoicePicker";
import { InlineMessage } from "@/components/InlineMessage/InlineMessage";
import { RoundBar } from "@/features/practice/components/RoundBar/RoundBar";
import { fraction, multiply } from "@/playback/fraction";
import { findRudiment } from "@/features/rudiments/domain/library";
import { usePlayerHeader } from "@/features/practice/hooks/use-player-header";
import { useFinishRound } from "@/features/practice/hooks/use-finish-round";
import { useRoundPractice } from "@/features/practice/hooks/use-round-practice";
import {
  buildTimeline,
  evenStep,
  scaleToStep,
} from "@/features/rudiments/domain/timeline";
import { useStrokeSound } from "@/features/rudiments/hooks/use-stroke-sound";
import { layout, layoutStyles, spacing } from "@/theme/layout";

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
  const { sound, problem: soundProblem } = useStrokeSound();
  const {
    routine: activeRoutine,
    exercise,
    round,
    done,
    roundGoal,
    pattern,
    rhythmicScale,
    initialTempo,
    track,
    changeScale,
    finishRound: completeRound,
    undo,
  } = useRoundPractice({ rudiment, routineId: routine, exerciseId });
  const finishRound = useFinishRound(activeRoutine, completeRound);
  const header = usePlayerHeader(activeRoutine?.name ?? "Rudiments");
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
      <Stack.Screen options={header} />
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
              <StrokeVoicePicker />
              {pattern && step ? (
                <NoteValuePicker
                  subdivision={subdivision}
                  onChange={(value) =>
                    changeScale(scaleToStep(pattern, fraction(1, value)))
                  }
                />
              ) : null}
            </RhythmBar>
            {soundProblem ? (
              <InlineMessage style={styles.soundFailed}>
                {soundProblem}
              </InlineMessage>
            ) : null}
            <RudimentPlayer
              key={`${rudiment.id}-${round?.id ?? ""}`}
              timeline={timeline}
              initialTempo={initialTempo}
              onActivity={track}
              sound={sound}
              padScale={padScale}
            />
          </>
        ) : (
          <AppText variant="bodySmall" tone="secondary">
            This rudiment has no player yet.
          </AppText>
        )}
      </ScrollView>
      {exercise && activeRoutine ? (
        <RoundBar
          done={done}
          goal={roundGoal}
          onUndo={undo}
          onFinish={finishRound}
          clock={
            round ? (
              <RoundClock
                key={round.id}
                routineId={activeRoutine.id}
                exerciseId={exercise.id}
                roundId={round.id}
                position={done + 1}
                targetSeconds={round.durationSeconds}
                onTargetReached={finishRound}
              />
            ) : null
          }
        />
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
  content: {
    paddingBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.md,
  },
  settings: {
    marginBottom: spacing.lg,
  },
});
