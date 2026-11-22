import { render, screen, userEvent } from "@testing-library/react-native";

import { RoundBar } from "./RoundBar";

test("finishes a round and offers undo only once a round is done", async () => {
  const onFinish = jest.fn();
  const onUndo = jest.fn();
  const user = userEvent.setup();

  await render(
    <RoundBar done={0} goal={2} onUndo={onUndo} onFinish={onFinish} />,
  );
  expect(screen.queryByRole("button", { name: "Undo last round" })).toBeNull();
  expect(screen.getByLabelText("0 of 2 rounds done")).toBeOnTheScreen();
  await user.press(screen.getByRole("button", { name: "Log Round" }));
  expect(onFinish).toHaveBeenCalledTimes(1);

  await screen.rerender(
    <RoundBar done={1} goal={2} onUndo={onUndo} onFinish={onFinish} />,
  );
  await user.press(screen.getByRole("button", { name: "Undo last round" }));
  expect(onUndo).toHaveBeenCalledTimes(1);
});

test("disables the button when every round is done", async () => {
  await render(
    <RoundBar done={2} goal={2} onUndo={jest.fn()} onFinish={jest.fn()} />,
  );
  expect(screen.getByRole("button", { name: "Log Round" })).toBeDisabled();
  expect(screen.getByLabelText("2 of 2 rounds done")).toBeOnTheScreen();
});
