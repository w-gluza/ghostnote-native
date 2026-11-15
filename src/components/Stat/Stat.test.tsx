import { render, screen } from "@testing-library/react-native";

import { Stat } from "./Stat";

test("shows a value above its label", async () => {
  await render(<Stat value="12" label="rounds" />);

  expect(screen.getByText("12")).toBeOnTheScreen();
  expect(screen.getByText("rounds")).toBeOnTheScreen();
});

test("is read out by its accessibility label when one is given", async () => {
  await render(
    <Stat value={120} label="BPM" accessibilityLabel="120 beats per minute" />,
  );

  expect(screen.getByLabelText("120 beats per minute")).toBeOnTheScreen();
});
