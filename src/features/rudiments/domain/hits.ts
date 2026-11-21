import type { TimelineStroke } from "./timeline";
import { leadMs } from "./timing.ts";

export type HitLevel = "full" | "soft" | "grace";

export type Hit = {
  sample: "tap" | "accent";
  level: HitLevel;
  offsetMs: number;
};

const GRACE_SPACING_MS = 35;
const BOUNCE_SPACING_MS = 28;
const BOUNCE_REBOUNDS = 3;

type Sounded = Pick<TimelineStroke, "accent" | "bounce" | "grace">;

export function graceOffsetsMs(count: number, gapMs: number) {
  const spacing = Math.min(GRACE_SPACING_MS, leadMs(gapMs) / count);
  return Array.from(
    { length: count },
    (_, index) => -(count - index) * spacing,
  );
}

export function hitsOf(stroke: Sounded, gapMs: number): Hit[] {
  const grace = graceOffsetsMs(stroke.grace.length, gapMs).map(
    (offsetMs): Hit => ({ sample: "tap", level: "grace", offsetMs }),
  );

  const main: Hit = {
    sample: stroke.accent ? "accent" : "tap",
    level: "full",
    offsetMs: 0,
  };

  const bounceSpacing = Math.min(
    BOUNCE_SPACING_MS,
    gapMs / (BOUNCE_REBOUNDS + 2),
  );
  const rebounds = stroke.bounce
    ? Array.from({ length: BOUNCE_REBOUNDS }, (_, index): Hit => ({
        sample: "tap",
        level: index === 0 ? "soft" : "grace",
        offsetMs: (index + 1) * bounceSpacing,
      }))
    : [];

  return [...grace, main, ...rebounds];
}
