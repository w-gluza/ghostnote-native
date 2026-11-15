import type { ComponentProps } from "react";

import { AppText } from "@/components/AppText/AppText";

type InlineMessageProps = Omit<
  ComponentProps<typeof AppText>,
  "variant" | "accessibilityRole"
>;

export function InlineMessage(props: InlineMessageProps) {
  return <AppText {...props} variant="bodySmall" accessibilityRole="alert" />;
}
