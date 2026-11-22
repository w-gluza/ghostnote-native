export const PREVIEW_STROKE_LIMIT = 8;

export type StickingPreview<Stroke> = {
  phrases: Stroke[][];
  isShortened: boolean;
};

export function stickingPreview<Stroke>(
  phrases: Stroke[][],
  limit = PREVIEW_STROKE_LIMIT,
): StickingPreview<Stroke> {
  const total = phrases.reduce((count, phrase) => count + phrase.length, 0);
  if (total <= limit) {
    return { phrases, isShortened: false };
  }

  const [first = [], ...rest] = phrases;
  if (first.length >= limit) {
    return { phrases: [first.slice(0, limit)], isShortened: true };
  }

  const shown = [first];
  let count = first.length;
  for (const phrase of rest) {
    if (count + phrase.length > limit) {
      break;
    }
    shown.push(phrase);
    count += phrase.length;
  }
  return { phrases: shown, isShortened: true };
}
