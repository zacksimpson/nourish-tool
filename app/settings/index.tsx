import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticPressable } from "@/components/HapticPressable";
import { Header } from "@/components/Header";
import { StyledText } from "@/components/StyledText";
import { SwipeBackContainer } from "@/components/SwipeBackContainer";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { goBack } from "@/utils/navigation";
import { n } from "@/utils/scaling";

export default function SettingsScreen() {
  const { invertColors, setInvertColors } = useInvertColors();
  const bg = invertColors ? "white" : "black";

  return (
    <SwipeBackContainer enabled onSwipeBack={goBack}>
      <SafeAreaView
        edges={["top"]}
        style={[styles.container, { backgroundColor: bg }]}
      >
        <Header headerTitle="Settings" />

        <ScrollView overScrollMode="never" showsVerticalScrollIndicator={false}>
          <HapticPressable
            onPress={() => router.push("/settings/notifications")}
            style={styles.row}
          >
            <StyledText style={[styles.rowText, { paddingBottom: 0 }]}>
              Notifications
            </StyledText>
          </HapticPressable>

          <HapticPressable
            onPress={() => router.push("/settings/signals")}
            style={styles.row}
          >
            <StyledText style={[styles.rowText, { paddingBottom: 0 }]}>
              Nutrition Focus
            </StyledText>
            <StyledText style={styles.rowDescription}>
              choose up to three
            </StyledText>
          </HapticPressable>

          <View style={styles.row}>
            <ToggleSwitch
              label="Invert Colors"
              onValueChange={setInvertColors}
              value={invertColors}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </SwipeBackContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: {
    alignItems: "flex-start",
    flexDirection: "column",
    paddingLeft: n(22),
    paddingRight: n(32),
    paddingVertical: n(16),
  },
  rowText: {
    fontSize: n(30),
    paddingBottom: n(10),
  },
  rowDescription: {
    fontSize: n(16),
    letterSpacing: 0.4,
    paddingBottom: n(10),
  },
});
