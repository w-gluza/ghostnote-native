import { StyleSheet } from "react-native";

import { layout } from "@/theme/layout";

export const editorStyles = StyleSheet.create({
  bar: {
    paddingTop: 8,
    paddingHorizontal: layout.screenInset,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    paddingTop: 8,
    paddingHorizontal: layout.screenInset,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginTop: 28,
  },
  add: {
    marginTop: 11,
    alignSelf: "center",
  },
  remove: {
    marginTop: 19,
    alignSelf: "center",
  },
});
