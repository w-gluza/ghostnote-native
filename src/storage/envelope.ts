export const SCHEMA_VERSION = 1;

export function encode(data: unknown) {
  return JSON.stringify({ schemaVersion: SCHEMA_VERSION, data });
}

export function decode(text: string | null): unknown {
  if (text === null) {
    return undefined;
  }
  try {
    const stored: unknown = JSON.parse(text);
    return typeof stored === "object" &&
      stored !== null &&
      "schemaVersion" in stored &&
      stored.schemaVersion === SCHEMA_VERSION &&
      "data" in stored
      ? stored.data
      : undefined;
  } catch {
    return undefined;
  }
}
