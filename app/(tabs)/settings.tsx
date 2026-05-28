import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticPressable } from "@/components/HapticPressable";
import { Header } from "@/components/Header";
import { StyledText } from "@/components/StyledText";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { n } from "@/utils/scaling";

export default function SettingsScreen() {
  const { invertColors, setInvertColors } = useInvertColors();
  const textColor = invertColors ? "black" : "white";
  const dividerColor = invertColors ? "#DDDDDD" : "#1A1A1A";

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.container,
        { backgroundColor: invertColors ? "white" : "black" },
      ]}
    >
      <Header headerTitle="Settings" hideBackButton />

      <View style={styles.content}>
        <ToggleSwitch
          label="Invert Colors"
          onValueChange={setInvertColors}
          value={invertColors}
        />

        <View style={[styles.divider, { backgroundColor: dividerColor }]} />

        <HapticPressable
          onPress={() => router.push("/settings/signals")}
          style={styles.row}
        >
          <StyledText style={[styles.rowLabel, { color: textColor }]}>
            Signals
          </StyledText>
        </HapticPressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: n(22),
    paddingTop: n(16),
  },
  divider: {
    height: 1,
    marginTop: n(16),
    marginBottom: n(4),
  },
  row: {
    paddingVertical: n(13),
  },
  rowLabel: {
    fontSize: n(30),
  },
});
