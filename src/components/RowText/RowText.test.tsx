import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { textVariants } from "@/theme/typography";

import { RowText } from "./RowText";

test("shows a small label, the title and a line of detail, in that order", async () => {
  await render(
    <RowText
      label="RECOMMENDED"
      title="Quick Warm-up"
      detail="9 min · 3 rudiments · Lvl 2"
    />,
  );

  const lines = screen.root?.children ?? [];
  expect(lines).toHaveLength(3);
  expect(lines[0]).toHaveTextContent("RECOMMENDED");
  expect(lines[1]).toHaveTextContent("Quick Warm-up");
  expect(lines[1]).toHaveStyle(textVariants.heading);
  expect(lines[2]).toHaveTextContent("9 min · 3 rudiments · Lvl 2");
});

test("leaves out the label and the detail when they are not given", async () => {
  await render(<RowText title="Paradiddle" />);

  expect(screen.root?.children).toHaveLength(1);
});

test("takes custom detail, such as sticking notation", async () => {
  await render(<RowText title="Flam" detail={<Text>lR rL</Text>} />);

  expect(screen.getByText("lR rL")).toBeOnTheScreen();
});
