import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { colors } from "@/theme/colors";
import { textVariants } from "@/theme/typography";

import { SectionHeader } from "./SectionHeader";

function styleOf(element: { props: { style?: unknown } }) {
  return StyleSheet.flatten(element.props.style as never);
}

test("is a small secondary header by default", async () => {
  await render(<SectionHeader title="YOUR SETLIST" />);

  expect(
    styleOf(screen.getByRole("header", { name: "YOUR SETLIST" })),
  ).toMatchObject({ ...textVariants.overline, color: colors.text.secondary });
});

test("is a larger primary header in the heading variant", async () => {
  await render(<SectionHeader variant="heading" title="This week" />);

  expect(
    styleOf(screen.getByRole("header", { name: "This week" })),
  ).toMatchObject({ ...textVariants.heading, color: colors.text.primary });
});

test("shows trailing text in the style that matches the variant", async () => {
  await render(
    <>
      <SectionHeader title="ROUNDS" trailing="9 min total" />
      <SectionHeader variant="heading" title="This week" trailing="42 min" />
    </>,
  );

  expect(styleOf(screen.getByText("9 min total"))).toMatchObject({
    ...textVariants.caption,
    color: colors.text.secondary,
  });
  expect(styleOf(screen.getByText("42 min"))).toMatchObject({
    ...textVariants.body,
    color: colors.text.secondary,
  });
});

test("shows a trailing control as it is given", async () => {
  await render(
    <SectionHeader
      variant="heading"
      title="Technique balance"
      trailing={<AppText accessibilityRole="button">Last 7 days</AppText>}
    />,
  );

  expect(screen.getByRole("button", { name: "Last 7 days" })).toBeOnTheScreen();
});

test("wraps instead of overflowing and keeps the caller's spacing", async () => {
  await render(
    <SectionHeader
      title="EXERCISES"
      trailing="12 min"
      style={{ marginTop: 28 }}
    />,
  );

  const header = screen.getByRole("header", { name: "EXERCISES" }).parent;
  expect(styleOf(header!)).toMatchObject({ flexWrap: "wrap", marginTop: 28 });
});
