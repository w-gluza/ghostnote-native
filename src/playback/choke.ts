export type Chokes<Name extends string> = Partial<Record<Name, Name[]>>;

export type Ringing<Name extends string> = { sample: Name; timeMs: number };

export function chokedBy<Name extends string, Item extends Ringing<Name>>(
  ringing: Item[],
  chokes: Chokes<Name>,
  sample: Name,
  timeMs: number,
) {
  const silenced = chokes[sample] ?? [];
  return ringing.filter(
    (item) => silenced.includes(item.sample) && item.timeMs < timeMs,
  );
}

export function canBeChoked<Name extends string>(
  chokes: Chokes<Name>,
  sample: Name,
) {
  return Object.values<Name[] | undefined>(chokes).some((silenced) =>
    silenced?.includes(sample),
  );
}
