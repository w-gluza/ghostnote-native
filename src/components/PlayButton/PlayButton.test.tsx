import { render, screen, userEvent } from "@testing-library/react-native";

import { PlayButton } from "./PlayButton";

test("offers to play while stopped and to pause while playing", async () => {
  const view = await render(<PlayButton isPlaying={false} />);
  expect(screen.getByRole("button", { name: "Play" })).toBeOnTheScreen();

  await view.rerender(<PlayButton isPlaying />);
  expect(screen.getByRole("button", { name: "Pause" })).toBeOnTheScreen();
  expect(screen.queryByRole("button", { name: "Play" })).toBeNull();
});

test("reports a press", async () => {
  const onPress = jest.fn();
  await render(<PlayButton isPlaying={false} onPress={onPress} />);

  await userEvent.setup().press(screen.getByRole("button", { name: "Play" }));

  expect(onPress).toHaveBeenCalledTimes(1);
});
