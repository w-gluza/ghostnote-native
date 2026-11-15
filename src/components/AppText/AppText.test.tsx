import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { colors } from "@/theme/colors";
import { textVariants } from "@/theme/typography";

import { AppText } from "./AppText";

function styleOf(text: string) {
  return StyleSheet.flatten(screen.getByText(text).props.style);
}

test("is body text in the primary colour by default", async () => {
  await render(<AppText>Paradiddle</AppText>);

  expect(styleOf("Paradiddle")).toEqual({
    ...textVariants.body,
    color: colors.text.primary,
  });
});

test("takes its font from the variant and its colour from the tone", async () => {
  await render(
    <AppText variant="overline" tone="secondary">
      ROUNDS
    </AppText>,
  );

  expect(styleOf("ROUNDS")).toEqual({
    ...textVariants.overline,
    color: colors.text.secondary,
  });
});

test("sets numbers in fixed-width digits when tabular", async () => {
  await render(
    <AppText variant="heading" tabular>
      120
    </AppText>,
  );

  expect(styleOf("120").fontVariant).toEqual(["tabular-nums"]);
});

test("lets a caller's style override the variant and the tone", async () => {
  await render(
    <AppText
      variant="caption"
      tone="secondary"
      style={{ letterSpacing: 1, color: colors.accent }}
    >
      BPM
    </AppText>,
  );

  expect(styleOf("BPM")).toEqual({
    ...textVariants.caption,
    letterSpacing: 1,
    color: colors.accent,
  });
});

test("passes accessibility and text props to the native text", async () => {
  await render(
    <AppText accessibilityRole="header" numberOfLines={1} selectable>
      Insights
    </AppText>,
  );

  const heading = screen.getByRole("header", { name: "Insights" });
  expect(heading.props.numberOfLines).toBe(1);
  expect(heading.props.selectable).toBe(true);
});

test("keeps text scaling on unless the caller caps it", async () => {
  await render(
    <>
      <AppText>Scales freely</AppText>
      <AppText maxFontSizeMultiplier={1.3}>Capped</AppText>
    </>,
  );

  expect(screen.getByText("Scales freely").props.allowFontScaling).not.toBe(
    false,
  );
  expect(
    screen.getByText("Scales freely").props.maxFontSizeMultiplier,
  ).toBeUndefined();
  expect(screen.getByText("Capped").props.maxFontSizeMultiplier).toBe(1.3);
});
