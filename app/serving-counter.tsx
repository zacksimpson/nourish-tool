import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticPressable } from "@/components/HapticPressable";
import { StyledText } from "@/components/StyledText";
import { SwipeBackContainer } from "@/components/SwipeBackContainer";
import { useThemeColors } from "@/hooks/useThemeColors";
import { goBack } from "@/utils/navigation";
import { n } from "@/utils/scaling";
import { storeServingCount } from "@/utils/servingCounterStore";

export default function ServingCounterScreen() {
  const { bg, textColor } = useThemeColors();
  const [count, setCount] = useState(1);

  const decrement = () => setCount((c) => Math.max(1, c - 1));
  const increment = () => setCount((c) => c + 1);

  const handleSave = () => {
    storeServingCount(count);
    goBack();
  };

  return (
    <SwipeBackContainer enabled onSwipeBack={goBack}>
      <SafeAreaView
        edges={["top"]}
        style={[styles.container, { backgroundColor: bg }]}
      >
        <StyledText style={[styles.title, { color: textColor }]}>
          Servings
        </StyledText>

        <View style={styles.pickerRow}>
          <HapticPressable onPress={decrement} style={styles.chevronBtn}>
            <MaterialIcons
              color={textColor}
              name="keyboard-arrow-down"
              size={n(52)}
            />
          </HapticPressable>
          <StyledText style={[styles.number, { color: textColor }]}>
            {count}
          </StyledText>
          <HapticPressable onPress={increment} style={styles.chevronBtn}>
            <MaterialIcons
              color={textColor}
              name="keyboard-arrow-up"
              size={n(52)}
            />
          </HapticPressable>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerSide} />
          <HapticPressable onPress={goBack} style={styles.footerBtn}>
            <StyledText style={[styles.dismissX, { color: textColor }]}>
              ✕
            </StyledText>
          </HapticPressable>
          <View style={styles.footerSide}>
            <HapticPressable onPress={handleSave} style={styles.saveBtn}>
              <StyledText style={[styles.save, { color: textColor }]}>
                SAVE
              </StyledText>
            </HapticPressable>
          </View>
        </View>
      </SafeAreaView>
    </SwipeBackContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontFamily: "PublicSans-Regular",
    fontSize: n(26),
    paddingBottom: n(20),
    paddingTop: n(60),
    textAlign: "center",
  },
  pickerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: n(10),
  },
  chevronBtn: {
    paddingHorizontal: n(32),
    paddingVertical: n(16),
  },
  number: {
    fontFamily: "PublicSans-Thin",
    fontSize: n(100),
    minWidth: n(120),
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "center",
    left: 0,
    paddingVertical: n(14),
    position: "absolute",
    right: 0,
  },
  footerSide: { alignItems: "flex-end", flex: 1, paddingRight: n(24) },
  footerBtn: { padding: n(8) },
  saveBtn: { padding: n(8) },
  dismissX: { fontSize: n(28) },
  save: {
    fontFamily: "PublicSans-Regular",
    fontSize: n(24),
    letterSpacing: n(5),
  },
});
