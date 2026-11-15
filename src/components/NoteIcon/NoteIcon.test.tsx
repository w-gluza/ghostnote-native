import { render, screen } from "@testing-library/react-native";

import { colors } from "@/theme/colors";

import { NoteIcon } from "./NoteIcon";

test("shows the note glyph in the accent colour", async () => {
  await render(<NoteIcon />);

  expect(screen.getByText("♫")).toHaveStyle({ color: colors.accent });
});
