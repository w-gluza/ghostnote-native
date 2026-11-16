import { act, renderHook } from "@testing-library/react-native";

import { useRudimentPlayback } from "./use-rudiment-playback";

jest.mock("expo-keep-awake", () => ({
  activateKeepAwakeAsync: jest.fn(() => Promise.resolve()),
  deactivateKeepAwake: jest.fn(() => Promise.resolve()),
}));

const timeline = { cycleBeats: 4, strokes: [{ beat: 0 }, { beat: 1 }] };
const tempo = { bpm: 60, pulseQuarterUnits: { numerator: 1, denominator: 1 } };
const FIRST_STROKE_MS = 250;

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test("reports each stroke while playing", async () => {
  const onStroke = jest.fn();
  const { result } = await renderHook(() =>
    useRudimentPlayback({ timeline, tempo, onStroke }),
  );

  await act(async () => result.current.play());
  await act(async () => {
    jest.advanceTimersByTime(FIRST_STROKE_MS);
  });

  expect(onStroke).toHaveBeenCalledWith(0);
});

test("a stroke already due when playback is paused is not reported", async () => {
  const onStroke = jest.fn();
  const { result } = await renderHook(() =>
    useRudimentPlayback({ timeline, tempo, onStroke }),
  );

  await act(async () => result.current.play());
  await act(async () => {
    jest.advanceTimersByTime(FIRST_STROKE_MS - 1);
    result.current.pause();
    jest.advanceTimersByTime(1);
  });

  expect(onStroke).not.toHaveBeenCalled();
});
