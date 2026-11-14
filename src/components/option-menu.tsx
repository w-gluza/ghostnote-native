import { SymbolView } from "expo-symbols";
import { useRef, useState, type ComponentRef, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

export type MenuOption<Key extends string | number> = {
  key: Key;
  label: string;
};

type OptionMenuProps<Key extends string | number> = {
  name: string;
  options: MenuOption<Key>[];
  selected: Key;
  onChange: (key: Key) => void;
  children: ReactNode;
};

type Anchor = { top: number; left: number };

const MENU_GAP = 8;

export function OptionMenu<Key extends string | number>({
  name,
  options,
  selected,
  onChange,
  children,
}: OptionMenuProps<Key>) {
  const trigger = useRef<ComponentRef<typeof View>>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const current = options.find((option) => option.key === selected);

  const open = () => {
    trigger.current?.measureInWindow((x, y, _width, height) => {
      setAnchor({ top: y + height + MENU_GAP, left: x });
    });
  };
  const close = () => setAnchor(null);

  return (
    <>
      <Pressable
        ref={trigger}
        accessibilityRole="button"
        accessibilityLabel={`${name}, ${current?.label ?? "not set"}`}
        accessibilityState={{ expanded: anchor !== null }}
        onPress={open}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        {children}
      </Pressable>

      <Modal
        transparent
        visible={anchor !== null}
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable
          accessibilityLabel={`Close ${name.toLowerCase()} menu`}
          onPress={close}
          style={StyleSheet.absoluteFill}
        />
        {anchor ? (
          <View
            accessibilityRole="menu"
            style={[styles.menu, { top: anchor.top, left: anchor.left }]}
          >
            {options.map((option, index) => {
              const isSelected = option.key === selected;
              return (
                <Pressable
                  key={option.key}
                  accessibilityRole="menuitem"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    onChange(option.key);
                    close();
                  }}
                  style={({ pressed }) => [
                    styles.item,
                    index > 0 && styles.itemDivider,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.check}>
                    {isSelected ? (
                      <SymbolView
                        name="checkmark"
                        size={14}
                        weight="semibold"
                        tintColor={colors.accent}
                      />
                    ) : null}
                  </View>
                  <Text style={styles.label}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 44,
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menu: {
    position: "absolute",
    minWidth: 160,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  item: {
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  check: {
    width: 16,
    alignItems: "center",
  },
  label: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
    fontVariant: ["tabular-nums"],
  },
  pressed: {
    opacity: 0.7,
  },
});
