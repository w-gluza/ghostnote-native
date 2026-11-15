import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { EmptyState } from "./EmptyState";

test("shows its message centred", async () => {
  await render(<EmptyState>No saved routines yet.</EmptyState>);

  expect(screen.getByText("No saved routines yet.")).toHaveStyle({
    textAlign: "center",
  });
});

test("shows an action under the message when one is given", async () => {
  await render(
    <EmptyState action={<Text>Create routine</Text>}>
      No saved routines yet.
    </EmptyState>,
  );

  expect(screen.getByText("Create routine")).toBeOnTheScreen();
});
