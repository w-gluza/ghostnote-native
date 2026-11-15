import { render, screen, userEvent } from "@testing-library/react-native";
import { Text } from "react-native";

import { SettingsRow } from "./SettingsRow";

test("shows its content and is not pressable without a press handler", async () => {
  await render(
    <SettingsRow symbol="clock">
      <Text>Played this week</Text>
    </SettingsRow>,
  );

  expect(screen.getByText("Played this week")).toBeOnTheScreen();
  expect(screen.queryByRole("button")).toBeNull();
});

test("becomes a pressable row with the given role and label", async () => {
  const onPress = jest.fn();
  await render(
    <SettingsRow
      symbol="lock"
      accessibilityRole="link"
      accessibilityLabel="Privacy policy"
      onPress={onPress}
    >
      <Text>Privacy policy</Text>
    </SettingsRow>,
  );

  await userEvent
    .setup()
    .press(screen.getByRole("link", { name: "Privacy policy" }));

  expect(onPress).toHaveBeenCalledTimes(1);
});

test("shows a footer under the row", async () => {
  await render(
    <SettingsRow symbol="calendar" footer={<Text>Could not be saved</Text>}>
      <Text>Weekly goal</Text>
    </SettingsRow>,
  );

  expect(screen.getByText("Could not be saved")).toBeOnTheScreen();
});
