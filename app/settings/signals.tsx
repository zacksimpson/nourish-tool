import { router } from "expo-router";
import { TextInput as RNTextInput, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticPressable } from "@/components/HapticPressable";
import { Header } from "@/components/Header";
import { StyledText } from "@/components/StyledText";
import { SwipeBackContainer } from "@/components/SwipeBackContainer";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import {
  SIGNAL_OPTIONS,
  type SignalId,
  useNourish,
} from "@/contexts/NourishContext";
import { n } from "@/utils/scaling";

const SIGNAL_UNITS: Record<SignalId, string> = {
  calories: "kcal",
  protein: "g",
  carbs: "g",
  fat: "g",
};

export default function SignalsScreen() {
  const { invertColors } = useInvertColors();
  const bg = invertColors ? "white" : "black";
  const textColor = invertColors ? "black" : "white";
  const dimColor = invertColors ? "#AAAAAA" : "#555555";
  const dividerColor = invertColors ? "#DDDDDD" : "#1A1A1A";

  const { signals, targets, saveSignals, saveTargets } = useNourish();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const toggleSignal = (id: SignalId) => {
    if (signals.includes(id)) {
      saveSignals(signals.filter((s) => s !== id));
    } else if (signals.length < 3) {
      saveSignals([...signals, id]);
    }
  };

  const handleTargetChange = (id: SignalId, text: string) => {
    const num = Number.parseInt(text, 10);
    const newTargets = { ...targets };
    if (Number.isNaN(num) || text === "") {
      delete newTargets[id];
    } else {
      newTargets[id] = num;
    }
    saveTargets(newTargets);
  };

  return (
    <SwipeBackContainer enabled onSwipeBack={handleBack}>
      <SafeAreaView
        edges={["top"]}
        style={[styles.container, { backgroundColor: bg }]}
      >
        <Header headerTitle="Signals" />

        <View style={styles.content}>
          {SIGNAL_OPTIONS.map((signal, index) => {
            const isSelected = signals.includes(signal.id);
            const atLimit = signals.length >= 3 && !isSelected;
            const target = targets[signal.id];

            return (
              <View key={signal.id}>
                {index > 0 && (
                  <View
                    style={[styles.divider, { backgroundColor: dividerColor }]}
                  />
                )}
                <View style={styles.row}>
                  <HapticPressable
                    onPress={() => {
                      if (!atLimit) {
                        toggleSignal(signal.id);
                      }
                    }}
                    style={styles.labelPressable}
                  >
                    <StyledText
                      style={[
                        styles.label,
                        { color: atLimit ? dimColor : textColor },
                        isSelected && styles.labelSelected,
                      ]}
                    >
                      {signal.label}
                    </StyledText>
                  </HapticPressable>

                  {isSelected && (
                    <View style={styles.targetContainer}>
                      <RNTextInput
                        allowFontScaling={false}
                        cursorColor={textColor}
                        defaultValue={
                          target === undefined ? "" : String(target)
                        }
                        keyboardType="numeric"
                        onEndEditing={(e) =>
                          handleTargetChange(signal.id, e.nativeEvent.text)
                        }
                        placeholder="—"
                        placeholderTextColor={dimColor}
                        selectionColor={textColor}
                        style={[styles.targetInput, { color: textColor }]}
                      />
                      <StyledText style={[styles.unit, { color: dimColor }]}>
                        {SIGNAL_UNITS[signal.id]}
                      </StyledText>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </SafeAreaView>
    </SwipeBackContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingTop: n(8),
  },
  divider: {
    height: 1,
    marginHorizontal: n(22),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: n(22),
    paddingVertical: n(16),
  },
  labelPressable: {
    flex: 1,
  },
  label: {
    fontSize: n(30),
  },
  labelSelected: {
    textDecorationLine: "underline",
  },
  targetContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: n(6),
  },
  targetInput: {
    fontSize: n(22),
    fontFamily: "PublicSans-Regular",
    minWidth: n(52),
    textAlign: "right",
  },
  unit: {
    fontSize: n(16),
  },
});
