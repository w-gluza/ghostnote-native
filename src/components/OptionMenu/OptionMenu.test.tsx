import { render, screen, userEvent } from "@testing-library/react-native";
import { Text, View } from "react-native";

import { OptionMenu } from "./OptionMenu";

const options = [
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "all", label: "All time" },
];

type Measure = (
  callback: (x: number, y: number, width: number, height: number) => void,
) => void;

beforeEach(() => {
  const measured: Measure = (callback) => callback(24, 100, 120, 44);
  jest
    .spyOn(View.prototype as { measureInWindow: Measure }, "measureInWindow")
    .mockImplementation(measured);
});

afterEach(() => {
  jest.restoreAllMocks();
});

function renderMenu(onChange = jest.fn()) {
  return render(
    <OptionMenu
      name="Period"
      options={options}
      selected="month"
      onChange={onChange}
    >
      <Text>This month</Text>
    </OptionMenu>,
  );
}

test("the trigger names the menu and its current choice, and starts closed", async () => {
  await renderMenu();

  const trigger = screen.getByRole("button", { name: "Period, This month" });
  expect(trigger).toBeCollapsed();
  expect(screen.queryByRole("menu")).toBeNull();
});

test("pressing the trigger opens the options with the current one selected", async () => {
  await renderMenu();

  await userEvent
    .setup()
    .press(screen.getByRole("button", { name: "Period, This month" }));

  expect(
    screen.getByRole("button", { name: "Period, This month" }),
  ).toBeExpanded();
  expect(screen.getAllByRole("menuitem")).toHaveLength(3);
  expect(screen.getByRole("menuitem", { name: "This month" })).toBeSelected();
  expect(screen.getByRole("menuitem", { name: "All time" })).not.toBeSelected();
});

test("choosing an option reports it and closes the menu", async () => {
  const onChange = jest.fn();
  await renderMenu(onChange);
  const user = userEvent.setup();

  await user.press(screen.getByRole("button", { name: "Period, This month" }));
  await user.press(screen.getByRole("menuitem", { name: "All time" }));

  expect(onChange).toHaveBeenCalledWith("all");
  expect(screen.queryByRole("menu")).toBeNull();
});

test("pressing outside closes the menu without choosing", async () => {
  const onChange = jest.fn();
  await renderMenu(onChange);
  const user = userEvent.setup();

  await user.press(screen.getByRole("button", { name: "Period, This month" }));
  await user.press(screen.getByLabelText("Close period menu"));

  expect(onChange).not.toHaveBeenCalled();
  expect(screen.queryByRole("menu")).toBeNull();
});
