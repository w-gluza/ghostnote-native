import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";

import { roundPlayedMs } from "@/rudiments/practice-session";
import { clockLabel, spokenClock } from "@/rudiments/session";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

type RoundClockProps = {
  routineId: string;
  exerciseId: string;
  roundId: string;
  position: number;
  targetSeconds: number;
};

const TICK_MS = 250;

export function RoundClock({
  routineId,
  exerciseId,
  roundId,
  position,
  targetSeconds,
}: RoundClockProps) {
  const [playedMs, setPlayedMs] = useState(0);
  useEffect(() => {
    const read = () =>
      setPlayedMs(roundPlayedMs(routineId, exerciseId, roundId, Date.now()));
    const ticker = setInterval(read, TICK_MS);
    return () => clearInterval(ticker);
  }, [routineId, exerciseId, roundId]);
  const targetMs = targetSeconds * 1000;

  return (
    <Text
      accessibilityLabel={`Round ${position}, played ${spokenClock(playedMs)} of ${spokenClock(targetMs)}`}
      style={styles.target}
    >
      <Text style={styles.played}>{clockLabel(playedMs)}</Text> /{" "}
      {clockLabel(targetMs)}
    </Text>
  );
}

const styles = StyleSheet.create({
  target: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
    fontVariant: ["tabular-nums"],
  },
  played: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.title,
  },
});
