import { render, screen, userEvent } from "@testing-library/react-native";

import { Button } from "./Button";

test("shows its label as a button and reports a press", async () => {
  const onPress = jest.fn();
  await render(<Button onPress={onPress}>Start Practice</Button>);

  await userEvent
    .setup()
    .press(screen.getByRole("button", { name: "Start Practice" }));

  expect(onPress).toHaveBeenCalledTimes(1);
});

test("ignores presses and reads as disabled when disabled", async () => {
  const onPress = jest.fn();
  await render(
    <Button variant="tonal" disabled onPress={onPress}>
      All rounds done
    </Button>,
  );
  const button = screen.getByRole("button", { name: "All rounds done" });

  await userEvent.setup().press(button);

  expect(onPress).not.toHaveBeenCalled();
  expect(button).toBeDisabled();
});

test("is announced by its accessibility label when one is given", async () => {
  await render(
    <Button
      variant="text"
      tone="muted"
      accessibilityLabel="Undo last round"
      onPress={() => {}}
    >
      Undo
    </Button>,
  );

  expect(
    screen.getByRole("button", { name: "Undo last round" }),
  ).toBeOnTheScreen();
  expect(screen.getByText("Undo")).toBeOnTheScreen();
});

test.each(["fill", "tonal", "text"] as const)(
  "a %s label can shrink and wrap instead of overflowing at large text sizes",
  async (variant) => {
    await render(
      <Button variant={variant} icon="play.circle" onPress={() => {}}>
        Resume Practice
      </Button>,
    );

    expect(screen.getByText("Resume Practice")).toHaveStyle({
      flexShrink: 1,
      textAlign: "center",
    });
  },
);

test("passes an accessibility state on, so a toggle can say it is expanded", async () => {
  await render(
    <Button
      variant="text"
      tone="accent"
      icon="plus"
      accessibilityState={{ expanded: true }}
      onPress={() => {}}
    >
      Add rudiment
    </Button>,
  );

  expect(screen.getByRole("button", { name: "Add rudiment" })).toBeExpanded();
});
