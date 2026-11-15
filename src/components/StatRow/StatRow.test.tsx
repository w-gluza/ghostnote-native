import { render, screen } from "@testing-library/react-native";

import { StatRow } from "./StatRow";

test("shows a label with its value", async () => {
  await render(<StatRow symbol="clock" label="Total practice" value="2h 5m" />);

  expect(screen.getByText("Total practice")).toBeOnTheScreen();
  expect(screen.getByText("2h 5m")).toBeOnTheScreen();
});
