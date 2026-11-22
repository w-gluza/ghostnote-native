import { useEffect, useEffectEvent, useRef, useState } from "react";
import { AccessibilityInfo } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { roundPlayedMs } from "@/features/practice/stores/practice-session";
import {
  clockLabel,
  isTargetReached,
  spokenClock,
} from "@/features/practice/domain/session";

type RoundClockProps = {
  routineId: string;
  exerciseId: string;
  roundId: string;
  position: number;
  targetSeconds: number;
  onTargetReached: () => void;
};

const TICK_MS = 250;

export function RoundClock({
  routineId,
  exerciseId,
  roundId,
  position,
  targetSeconds,
  onTargetReached,
}: RoundClockProps) {
  const targetMs = targetSeconds * 1000;
  const [playedMs, setPlayedMs] = useState(() =>
    roundPlayedMs(routineId, exerciseId, roundId, Date.now()),
  );
  const wasReached = useRef(isTargetReached(playedMs, targetMs));
  const targetReached = useEffectEvent(onTargetReached);
  useEffect(() => {
    const read = () => {
      const played = roundPlayedMs(routineId, exerciseId, roundId, Date.now());
      const reached = isTargetReached(played, targetMs);
      if (reached && !wasReached.current) {
        AccessibilityInfo.announceForAccessibility(
          `Round ${position} target reached`,
        );
        targetReached();
      }
      wasReached.current = reached;
      setPlayedMs(played);
    };
    const ticker = setInterval(read, TICK_MS);
    return () => clearInterval(ticker);
  }, [routineId, exerciseId, roundId, targetMs, position]);
  const isReached = isTargetReached(playedMs, targetMs);

  return (
    <AppText
      variant="bodySmall"
      tone="secondary"
      tabular
      accessibilityLabel={`Round ${position}, played ${spokenClock(playedMs)} of ${spokenClock(targetMs)}${isReached ? ", target reached" : ""}`}
    >
      <AppText variant="heading" tone={isReached ? "accent" : "primary"}>
        {clockLabel(playedMs)}
      </AppText>{" "}
      / {clockLabel(targetMs)}
    </AppText>
  );
}
