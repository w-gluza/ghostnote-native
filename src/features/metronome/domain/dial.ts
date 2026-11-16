export const ARC_START = -150;
export const ARC_END = 150;
const DEAD_ZONE_SHARE = 0.4;

type Touch = { x: number; y: number };

export function isOnRing(touch: Touch, size: number) {
  const radius = size / 2;
  return (
    Math.hypot(touch.x - radius, touch.y - radius) >= radius * DEAD_ZONE_SHARE
  );
}

export function touchAngle(touch: Touch, size: number) {
  const radius = size / 2;
  return (Math.atan2(touch.x - radius, radius - touch.y) * 180) / Math.PI;
}

export function turnBetween(from: number, to: number) {
  const turn = to - from;
  return turn > 180 ? turn - 360 : turn <= -180 ? turn + 360 : turn;
}

export function turnedBpm(
  bpm: number,
  degrees: number,
  min: number,
  max: number,
) {
  const turned = bpm + (degrees / (ARC_END - ARC_START)) * (max - min);
  return Math.min(max, Math.max(min, turned));
}
