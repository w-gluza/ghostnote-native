import assert from "node:assert/strict";
import { test } from "node:test";

import { decode, encode, SCHEMA_VERSION } from "./envelope.ts";

test("stored data carries its format version", () => {
  assert.equal(JSON.parse(encode([])).schemaVersion, SCHEMA_VERSION);
});

test("nothing stored, corrupt text or another format version reads as absent", () => {
  assert.equal(decode(null), undefined);
  assert.equal(decode("{not json"), undefined);
  assert.equal(decode("null"), undefined);
  assert.equal(
    decode(JSON.stringify({ schemaVersion: SCHEMA_VERSION + 1, data: [] })),
    undefined,
  );
});
