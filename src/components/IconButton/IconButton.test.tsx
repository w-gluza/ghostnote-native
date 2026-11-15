import { render, screen, userEvent } from "@testing-library/react-native";

import { IconButton } from "./IconButton";

test("is a button named by its accessibility label and reports a press", async () => {
  const onPress = jest.fn();
  await render(
    <IconButton
      icon="plus"
      accessibilityLabel="Create new routine"
      onPress={onPress}
    />,
  );

  await userEvent
    .setup()
    .press(screen.getByRole("button", { name: "Create new routine" }));

  expect(onPress).toHaveBeenCalledTimes(1);
});

test("ignores presses and reads as disabled when disabled", async () => {
  const onPress = jest.fn();
  await render(
    <IconButton
      icon="minus"
      accessibilityLabel="Decrease tempo"
      disabled
      onPress={onPress}
    />,
  );
  const button = screen.getByRole("button", { name: "Decrease tempo" });

  await userEvent.setup().press(button);

  expect(onPress).not.toHaveBeenCalled();
  expect(button).toBeDisabled();
});

test("reports a long press and its release, for press-and-hold actions", async () => {
  const onLongPress = jest.fn();
  const onPressOut = jest.fn();
  await render(
    <IconButton
      icon="plus"
      accessibilityLabel="Increase tempo"
      onPress={() => {}}
      onLongPress={onLongPress}
      onPressOut={onPressOut}
    />,
  );

  await userEvent
    .setup()
    .longPress(screen.getByRole("button", { name: "Increase tempo" }));

  expect(onLongPress).toHaveBeenCalledTimes(1);
  expect(onPressOut).toHaveBeenCalledTimes(1);
});

test.each(["plain", "tonal"] as const)(
  "a %s button is at least 44 points in each direction",
  async (variant) => {
    await render(
      <IconButton
        icon="magnifyingglass"
        accessibilityLabel="Search rudiments"
        variant={variant}
        onPress={() => {}}
      />,
    );

    const button = screen.getByRole("button", { name: "Search rudiments" });
    expect(button).toHaveStyle(
      variant === "plain"
        ? { minWidth: 44, minHeight: 44 }
        : { width: 44, height: 44 },
    );
  },
);
