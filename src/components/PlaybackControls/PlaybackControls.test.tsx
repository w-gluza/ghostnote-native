import { render, screen, userEvent } from "@testing-library/react-native";

import { PlaybackControls } from "./PlaybackControls";

const controls = {
  bpm: 80,
  minBpm: 40,
  maxBpm: 200,
  step: 5,
  isPlaying: false,
  onChangeBpm: () => {},
  onTogglePlayback: () => {},
};

test.each(["bar", "stacked"] as const)(
  "shows the tempo and a play button in the %s variant",
  async (variant) => {
    await render(<PlaybackControls {...controls} variant={variant} />);

    expect(screen.getByLabelText("80 beats per minute")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Play" })).toBeOnTheScreen();
  },
);

test("changes the tempo by one step", async () => {
  const onChangeBpm = jest.fn();
  const user = userEvent.setup();
  await render(
    <PlaybackControls {...controls} variant="bar" onChangeBpm={onChangeBpm} />,
  );

  await user.press(screen.getByRole("button", { name: "Increase tempo" }));
  await user.press(screen.getByRole("button", { name: "Decrease tempo" }));

  expect(onChangeBpm.mock.calls).toEqual([[85], [75]]);
});

test("stops stepping at the tempo limits", async () => {
  await render(<PlaybackControls {...controls} variant="bar" bpm={200} />);

  expect(screen.getByRole("button", { name: "Increase tempo" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Decrease tempo" })).toBeEnabled();
});

test("reports a press on play", async () => {
  const onTogglePlayback = jest.fn();
  await render(
    <PlaybackControls
      {...controls}
      variant="stacked"
      onTogglePlayback={onTogglePlayback}
    />,
  );

  await userEvent.setup().press(screen.getByRole("button", { name: "Play" }));

  expect(onTogglePlayback).toHaveBeenCalledTimes(1);
});
