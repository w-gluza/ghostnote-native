import { render, screen, userEvent } from "@testing-library/react-native";
import { Text } from "react-native";

import { NumberedRow } from "./NumberedRow";

test("shows a two-digit position and its content, and reports a press", async () => {
  const onPress = jest.fn();
  await render(
    <NumberedRow
      position={3}
      accessibilityLabel="Quick warm-up, 9 minutes"
      onPress={onPress}
    >
      <Text>Quick warm-up</Text>
    </NumberedRow>,
  );

  expect(screen.getByText("03")).toBeOnTheScreen();
  expect(screen.getByText("Quick warm-up")).toBeOnTheScreen();

  await userEvent
    .setup()
    .press(screen.getByRole("button", { name: "Quick warm-up, 9 minutes" }));

  expect(onPress).toHaveBeenCalledTimes(1);
});

test("shows trailing content beside the row's content", async () => {
  await render(
    <NumberedRow
      position={1}
      accessibilityLabel="Paradiddle"
      trailing={<Text>2/3 rounds</Text>}
      onPress={() => {}}
    >
      <Text>Paradiddle</Text>
    </NumberedRow>,
  );

  expect(screen.getByText("2/3 rounds")).toBeOnTheScreen();
});

test("has a divider unless it is the last row", async () => {
  await render(
    <>
      <NumberedRow position={1} accessibilityLabel="First" onPress={() => {}}>
        <Text>First</Text>
      </NumberedRow>
      <NumberedRow
        position={2}
        accessibilityLabel="Last"
        isLast
        onPress={() => {}}
      >
        <Text>Last</Text>
      </NumberedRow>
    </>,
  );

  expect(screen.getByRole("button", { name: "First" })).toHaveStyle({
    borderBottomColor: expect.any(String),
  });
  expect(screen.getByRole("button", { name: "Last" })).not.toHaveStyle({
    borderBottomColor: expect.any(String),
  });
});
