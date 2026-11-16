import { useEffect, type ComponentProps } from "react";
import { AccessibilityInfo } from "react-native";

import { AppText } from "@/components/AppText/AppText";

type InlineMessageProps = Omit<
  ComponentProps<typeof AppText>,
  "variant" | "accessibilityRole"
>;

export function InlineMessage(props: InlineMessageProps) {
  const message =
    typeof props.children === "string" ? props.children : undefined;
  useEffect(() => {
    if (message) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [message]);

  return <AppText {...props} variant="bodySmall" accessibilityRole="alert" />;
}
