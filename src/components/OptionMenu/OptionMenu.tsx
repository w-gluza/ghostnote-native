import { SymbolView } from "expo-symbols";
import { useRef, useState, type ComponentRef, type ReactNode } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { colors } from "@/theme/colors";

export type MenuOption<Key extends string | number> = {
  key: Key;
  label: string;
  accessibilityLabel?: string;
};

type OptionMenuProps<Key extends string | number> = {
  name: string;
  options: MenuOption<Key>[];
  selected: Key;
  onChange: (key: Key) => void;
  align?: "start" | "end";
  hitSlop?: PressableProps["hitSlop"];
  chevron?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

type Anchor = { top: number; left?: number; right?: number };

const MENU_GAP = 8;

export function OptionMenu<Key extends string | number>({
  name,
  options,
  selected,
  onChange,
  align = "start",
  hitSlop,
  chevron = true,
  style,
  children,
}: OptionMenuProps<Key>) {
  const { width: windowWidth } = useWindowDimensions();
  const trigger = useRef<ComponentRef<typeof View>>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const current = options.find((option) => option.key === selected);

  const open = () => {
    trigger.current?.measureInWindow((x, y, width, height) => {
      const top = y + height + MENU_GAP;
      setAnchor(
        align === "end"
          ? { top, right: windowWidth - (x + width) }
          : { top, left: x },
      );
    });
  };
  const close = () => setAnchor(null);

  return (
    <>
      <Pressable
        ref={trigger}
        accessibilityRole="button"
        accessibilityLabel={`${name}, ${current ? spokenLabel(current) : "not set"}`}
        accessibilityState={{ expanded: anchor !== null }}
        hitSlop={hitSlop}
        onPress={open}
        style={({ pressed }) => [
          styles.trigger,
          style,
          pressed && styles.pressed,
        ]}
      >
        {children}
        {chevron ? (
          <SymbolView
            name="chevron.down"
            size={13}
            weight="medium"
            tintColor={colors.text.secondary}
          />
        ) : null}
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
          <View accessibilityRole="menu" style={[styles.menu, anchor]}>
            {options.map((option, index) => {
              const isSelected = option.key === selected;
              return (
                <Pressable
                  key={option.key}
                  accessibilityRole="menuitem"
                  accessibilityLabel={spokenLabel(option)}
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
                  <AppText variant="body" tabular>
                    {option.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </Modal>
    </>
  );
}

function spokenLabel(option: MenuOption<string | number>) {
  return option.accessibilityLabel ?? option.label;
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
  pressed: {
    opacity: 0.7,
  },
});
