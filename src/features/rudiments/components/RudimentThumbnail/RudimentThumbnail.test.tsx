import { render, screen } from "@testing-library/react-native";

import { RudimentThumbnail } from "./RudimentThumbnail";

const placeholder = { uri: "paradiddle.jpg" };

test("shows a placeholder photo, hidden from screen readers, when there is no video", async () => {
  await render(<RudimentThumbnail label="Paradiddle" photo={placeholder} />);

  const [photo] = screen.root?.children ?? [];
  expect(photo).toHaveProp("accessible", false);
  expect(photo).toHaveStyle({ width: "100%", height: "100%" });
  expect(screen.queryByRole("button")).toBeNull();
});

test.each([
  ["small", { width: 72, height: 72 }],
  ["large", { width: 88, height: 80 }],
] as const)("a %s thumbnail has its own fixed size", async (size, box) => {
  await render(
    <RudimentThumbnail label="Paradiddle" photo={placeholder} size={size} />,
  );

  expect(screen.root).toHaveStyle({ ...box, borderRadius: 12 });
});
