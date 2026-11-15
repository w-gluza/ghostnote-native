import { render, screen } from "@testing-library/react-native";
import { StyleSheet, Text } from "react-native";

import { textVariants } from "@/theme/typography";

import { PageTitle } from "./PageTitle";

function styleOf(name: string) {
  return StyleSheet.flatten(screen.getByRole("header", { name }).props.style);
}

test("is a header in the title style", async () => {
  await render(<PageTitle>Saved Routines</PageTitle>);

  expect(styleOf("Saved Routines")).toMatchObject({
    ...textVariants.title,
    paddingTop: 6,
  });
});

test("keeps the caller's spacing and text props", async () => {
  await render(
    <PageTitle numberOfLines={2} style={{ marginBottom: 12 }}>
      Single Paradiddle
    </PageTitle>,
  );

  const title = screen.getByRole("header", { name: "Single Paradiddle" });
  expect(title.props.numberOfLines).toBe(2);
  expect(styleOf("Single Paradiddle")).toMatchObject({
    paddingTop: 6,
    marginBottom: 12,
  });
});

test("shows a trailing action beside the title, which can shrink to make room", async () => {
  await render(
    <PageTitle trailing={<Text>Done</Text>}>Saved Routines</PageTitle>,
  );

  expect(screen.getByText("Done")).toBeOnTheScreen();
  expect(screen.getByRole("header", { name: "Saved Routines" })).toHaveStyle({
    flexShrink: 1,
  });
});
