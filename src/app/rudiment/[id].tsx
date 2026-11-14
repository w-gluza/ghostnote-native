import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { NoteValuePicker } from "@/components/note-value-picker";
import { STAGE_HEIGHT } from "@/components/pad-animation";
import { RudimentPlayer } from "@/components/rudiment-player";
import { ScreenHeader } from "@/components/screen-header";
import { WeekProgress } from "@/components/week-progress";
import { fraction } from "@/rudiments/fraction";
import { defaultBpm, findRudiment, standardPattern } from "@/rudiments/library";
import {
  logRound,
  undoRound,
  useRoundsDone,
  willCompleteRoutine,
} from "@/rudiments/round-log";
import { useRoutine } from "@/rudiments/saved-routines";
import { buildTimeline, evenStep, scaleToStep } from "@/rudiments/timeline";
import { useStrokeSound } from "@/rudiments/use-stroke-sound";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

const MIN_PAD_SCALE = 0.6;

export default function RudimentScreen() {
  const { id, routine } = useLocalSearchParams<{
    id: string;
    routine?: string;
  }>();
  const rudiment = findRudiment(id);
  const router = useRouter();
  const sound = useStrokeSound();
  const openedRoutine = useRoutine(routine);
  const activeRoutine = routine ? openedRoutine : undefined;
  const exercise = activeRoutine?.exercises.find((item) => item.id === id);
  const roundsDone = useRoundsDone(activeRoutine?.id ?? "", id);
  const roundGoal = exercise?.rounds.length ?? 0;
  const isComplete = exercise ? roundsDone >= roundGoal : false;
  const round = exercise?.rounds[Math.min(roundsDone, roundGoal - 1)];
  const finishRound = () => {
    if (!exercise || !activeRoutine) {
      return;
    }
    const finishesRoutine = willCompleteRoutine(activeRoutine, exercise.id);
    logRound(activeRoutine.id, exercise.id, roundGoal);
    if (finishesRoutine) {
      router.replace({
        pathname: "/summary",
        params: { routine: activeRoutine.id },
      });
    } else if (roundsDone + 1 >= roundGoal) {
      router.back();
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
  const [subdivision, setSubdivision] = useState(1);
  const pattern = rudiment ? standardPattern(rudiment) : undefined;
  const hasEvenStrokes = pattern ? evenStep(pattern) !== undefined : false;
  const timeline = pattern
    ? buildTimeline(pattern, scaleToStep(pattern, fraction(1, subdivision)))
    : undefined;

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
              {hasEvenStrokes ? (
                <NoteValuePicker
                  subdivision={subdivision}
                  onChange={setSubdivision}
                />
              ) : null}
            </View>
            <RudimentPlayer
              key={`${rudiment.id}-${round?.bpm ?? ""}`}
              timeline={timeline}
              initialBpm={round?.bpm ?? defaultBpm(rudiment)}
              sound={sound}
              padScale={padScale}
            />
          </>
        ) : (
          <Text style={styles.meta}>This rudiment has no player yet.</Text>
        )}
      </ScrollView>
      {exercise && activeRoutine ? (
        <View style={styles.rounds}>
          <WeekProgress
            done={roundsDone}
            goal={roundGoal}
            unit="rounds"
            description={`${roundsDone} of ${roundGoal} rounds done`}
          />
          {roundsDone > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Undo last round"
              hitSlop={12}
              onPress={() => undoRound(activeRoutine.id, exercise.id)}
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
    paddingVertical: 8,
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
