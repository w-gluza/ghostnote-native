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
