type Rect = { x: number; y: number; width: number; height: number };
type Size = { width: number; height: number };
type Insets = { top: number; bottom: number };

export const MENU_GAP = 8;

export function menuMaxHeight(window: Size, insets: Insets) {
  return window.height - insets.top - insets.bottom - 2 * MENU_GAP;
}

export function placeMenu({
  trigger,
  menu,
  window,
  insets,
  align,
}: {
  trigger: Rect;
  menu: Size;
  window: Size;
  insets: Insets;
  align: "start" | "end";
}) {
  const highest = insets.top + MENU_GAP;
  const lowest = window.height - insets.bottom - MENU_GAP - menu.height;
  const below = trigger.y + trigger.height + MENU_GAP;
  const above = trigger.y - MENU_GAP - menu.height;
  const top =
    below <= lowest
      ? below
      : above >= highest
        ? above
        : Math.max(highest, lowest);

  const preferred =
    align === "end" ? trigger.x + trigger.width - menu.width : trigger.x;
  const left = Math.max(
    MENU_GAP,
    Math.min(preferred, window.width - MENU_GAP - menu.width),
  );

  return { top, left };
}
