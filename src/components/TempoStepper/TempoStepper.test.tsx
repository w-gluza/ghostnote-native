import { render, screen, userEvent } from "@testing-library/react-native";
import { Text } from "react-native";

import { TempoStepper } from "./TempoStepper";

function renderStepper(props: Partial<Parameters<typeof TempoStepper>[0]>) {
  return render(
    <TempoStepper
      canDecrease
      canIncrease
      onDecrease={() => {}}
      onIncrease={() => {}}
      {...props}
    >
      <Text>120</Text>
    </TempoStepper>,
  );
}

test.each(["plain", "tonal"] as const)(
  "a %s stepper shows its content between a decrease and an increase button",
  async (variant) => {
    const onDecrease = jest.fn();
    const onIncrease = jest.fn();
    await renderStepper({ variant, onDecrease, onIncrease });
    const user = userEvent.setup();

    await user.press(screen.getByRole("button", { name: "Decrease tempo" }));
    await user.press(screen.getByRole("button", { name: "Increase tempo" }));

    expect(screen.getByText("120")).toBeOnTheScreen();
    expect(onDecrease).toHaveBeenCalledTimes(1);
    expect(onIncrease).toHaveBeenCalledTimes(1);
  },
);

test("disables a direction that has reached its limit", async () => {
  await renderStepper({ canDecrease: false });

  expect(screen.getByRole("button", { name: "Decrease tempo" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Increase tempo" })).toBeEnabled();
});

test("reports holding a button and letting go, for repeating changes", async () => {
  const onHoldIncrease = jest.fn();
  const onHoldEnd = jest.fn();
  await renderStepper({ variant: "plain", onHoldIncrease, onHoldEnd });

  await userEvent
    .setup()
    .longPress(screen.getByRole("button", { name: "Increase tempo" }));

  expect(onHoldIncrease).toHaveBeenCalledTimes(1);
  expect(onHoldEnd).toHaveBeenCalledTimes(1);
});
