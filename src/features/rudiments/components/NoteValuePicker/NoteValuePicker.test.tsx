import { render, screen, userEvent } from "@testing-library/react-native";
import { View } from "react-native";

import { NoteValuePicker } from "./NoteValuePicker";

type Measure = (
  callback: (x: number, y: number, width: number, height: number) => void,
) => void;

beforeEach(() => {
  const measured: Measure = (callback) => callback(200, 100, 80, 24);
  jest
    .spyOn(View.prototype as { measureInWindow: Measure }, "measureInWindow")
    .mockImplementation(measured);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("shows the note value as a fraction and speaks it by name", async () => {
  await render(<NoteValuePicker subdivision={2} onChange={jest.fn()} />);

  expect(
    screen.getByRole("button", { name: "Note value, Eighth notes" }),
  ).toBeCollapsed();
  expect(screen.getByText("1/8")).toBeTruthy();
});

test("offers quarter, eighth and sixteenth notes and reports the choice", async () => {
  const onChange = jest.fn();
  await render(<NoteValuePicker subdivision={2} onChange={onChange} />);
  const user = userEvent.setup();

  await user.press(
    screen.getByRole("button", { name: "Note value, Eighth notes" }),
  );

  expect(screen.getAllByRole("menuitem")).toHaveLength(3);
  expect(screen.getByRole("menuitem", { name: "Eighth notes" })).toBeSelected();

  await user.press(screen.getByRole("menuitem", { name: "Sixteenth notes" }));

  expect(onChange).toHaveBeenCalledWith(4);
  expect(screen.queryByRole("menu")).toBeNull();
});

test("says the note value is not set when the rhythm matches none of them", async () => {
  await render(<NoteValuePicker subdivision={0} onChange={jest.fn()} />);

  expect(
    screen.getByRole("button", { name: "Note value, not set" }),
  ).toBeTruthy();
});
