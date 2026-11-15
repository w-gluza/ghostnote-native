import { render, screen, userEvent } from "@testing-library/react-native";

import { ScreenHeader } from "./ScreenHeader";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => {
  mockPush.mockClear();
});

test("shows the wordmark and opens the profile", async () => {
  await render(<ScreenHeader />);
  expect(screen.getByText("ghostnote")).toBeOnTheScreen();

  await userEvent
    .setup()
    .press(screen.getByRole("button", { name: "Profile" }));

  expect(mockPush).toHaveBeenCalledWith("/profile");
});

test("has no back button unless the screen can go back", async () => {
  await render(<ScreenHeader />);

  expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
});

test("reports a press on the back button", async () => {
  const onBack = jest.fn();
  await render(<ScreenHeader onBack={onBack} />);

  await userEvent.setup().press(screen.getByRole("button", { name: "Back" }));

  expect(onBack).toHaveBeenCalledTimes(1);
  expect(mockPush).not.toHaveBeenCalled();
});
