import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { RhythmBar, RhythmBarSeparator } from "./RhythmBar";

test("lays its settings out in a row that can grow taller with large text", async () => {
  await render(
    <RhythmBar style={{ marginTop: 24 }}>
      <Text>4/4</Text>
      <RhythmBarSeparator />
      <Text>Sixteenths</Text>
    </RhythmBar>,
  );

  expect(screen.getByText("4/4")).toBeOnTheScreen();
  expect(screen.getByText("Sixteenths")).toBeOnTheScreen();
  expect(screen.root).toHaveStyle({
    flexDirection: "row",
    minHeight: 52,
    marginTop: 24,
  });
  expect(screen.root).not.toHaveStyle({ height: 52 });
});
