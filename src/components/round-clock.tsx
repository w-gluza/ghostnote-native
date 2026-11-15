import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, StyleSheet, Text } from "react-native";

import { roundPlayedMs } from "@/rudiments/practice-session";
import { clockLabel, isTargetReached, spokenClock } from "@/rudiments/session";
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
  const targetMs = targetSeconds * 1000;
  const [playedMs, setPlayedMs] = useState(0);
  const wasReached = useRef(false);
  useEffect(() => {
    const read = () => {
      const played = roundPlayedMs(routineId, exerciseId, roundId, Date.now());
      const reached = isTargetReached(played, targetMs);
      if (reached && !wasReached.current) {
        AccessibilityInfo.announceForAccessibility(
          `Round ${position} target reached`,
        );
      }
      wasReached.current = reached;
      setPlayedMs(played);
    };
    const ticker = setInterval(read, TICK_MS);
    return () => clearInterval(ticker);
  }, [routineId, exerciseId, roundId, targetMs, position]);
  const isReached = isTargetReached(playedMs, targetMs);

  return (
    <Text
      accessibilityLabel={`Round ${position}, played ${spokenClock(playedMs)} of ${spokenClock(targetMs)}${isReached ? ", target reached" : ""}`}
      style={styles.target}
    >
      <Text style={[styles.played, isReached && styles.reached]}>
        {clockLabel(playedMs)}
      </Text>{" "}
      / {clockLabel(targetMs)}
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
  reached: {
    color: colors.accent,
  },
});
