import { render, screen } from "@testing-library/react-native";

import { InlineMessage } from "./InlineMessage";

test("announces its text as an alert", async () => {
  await render(
    <InlineMessage>This routine could not be saved. Try again.</InlineMessage>,
  );

  expect(
    screen.getByRole("alert", {
      name: "This routine could not be saved. Try again.",
    }),
  ).toBeOnTheScreen();
});

test("can be made selectable, so an address in it can be copied", async () => {
  await render(
    <InlineMessage selectable>You can find it at example.com</InlineMessage>,
  );

  expect(screen.getByRole("alert")).toHaveProp("selectable", true);
});
