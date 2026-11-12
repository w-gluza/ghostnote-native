import { StyleSheet, Text, View } from "react-native";

export default function Home() {
  return (
    <View style={styles.screen}>
      <Text style={styles.hello}>Hello</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#121214",
  },
  hello: {
    color: "#f2efe9",
    fontSize: 24,
  },
});
