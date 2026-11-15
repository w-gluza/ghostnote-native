import { render, screen, userEvent } from "@testing-library/react-native";

import { colors } from "@/theme/colors";
import { textVariants } from "@/theme/typography";

import { TextField } from "./TextField";

test("is found by its label and reports what is typed", async () => {
  const onChangeText = jest.fn();
  await render(
    <TextField accessibilityLabel="Routine name" onChangeText={onChangeText} />,
  );

  await userEvent.setup().type(screen.getByLabelText("Routine name"), "Warm");

  expect(onChangeText).toHaveBeenLastCalledWith("Warm");
});

test("uses the app's text style, dark keyboard and accent selection", async () => {
  await render(
    <TextField accessibilityLabel="Routine name" style={{ height: 52 }} />,
  );
  const field = screen.getByLabelText("Routine name");

  expect(field).toHaveStyle({
    ...textVariants.body,
    color: colors.text.primary,
    height: 52,
  });
  expect(field).toHaveProp("keyboardAppearance", "dark");
  expect(field).toHaveProp("selectionColor", colors.accent);
});
