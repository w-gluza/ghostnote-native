import assert from "node:assert/strict";
import { test } from "node:test";

import { isOnRing, touchAngle, turnBetween, turnedBpm } from "./dial.ts";

const size = 300;

test("a touch near the centre of the dial is not on the ring", () => {
  assert.equal(isOnRing({ x: 150, y: 150 }, size), false);
  assert.equal(isOnRing({ x: 150, y: 100 }, size), false);
  assert.equal(isOnRing({ x: 150, y: 90 }, size), true);
  assert.equal(isOnRing({ x: 290, y: 150 }, size), true);
});

test("a touch angle is measured clockwise from the top", () => {
  assert.equal(touchAngle({ x: 150, y: 10 }, size), 0);
  assert.equal(touchAngle({ x: 290, y: 150 }, size), 90);
  assert.equal(touchAngle({ x: 10, y: 150 }, size), -90);
});

test("a turn takes the short way round, including across the bottom", () => {
  assert.equal(turnBetween(10, 40), 30);
  assert.equal(turnBetween(40, 10), -30);
  assert.equal(turnBetween(170, -170), 20);
  assert.equal(turnBetween(-170, 170), -20);
});

test("turning changes the tempo in proportion to the arc and stops at the limits", () => {
  assert.equal(turnedBpm(100, 30, 40, 200), 116);
  assert.equal(turnedBpm(100, -30, 40, 200), 84);
  assert.equal(turnedBpm(190, 90, 40, 200), 200);
  assert.equal(turnedBpm(50, -90, 40, 200), 40);
});
