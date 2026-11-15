export function validItems<Item>(
  value: unknown,
  isItem: (item: unknown) => item is Item,
): Item[] | undefined {
  return Array.isArray(value) ? value.filter(isItem) : undefined;
}

export function isListOf<Item>(
  value: unknown,
  isItem: (item: unknown) => item is Item,
): value is Item[] {
  return Array.isArray(value) && value.every(isItem);
}

export function isDuration(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}
