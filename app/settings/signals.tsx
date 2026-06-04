import { TextInput as RNTextInput, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticPressable } from "@/components/HapticPressable";
import { Header } from "@/components/Header";
import { StyledText } from "@/components/StyledText";
import { SwipeBackContainer } from "@/components/SwipeBackContainer";
import {
  SIGNAL_OPTIONS,
  type SignalId,
  useNourish,
} from "@/contexts/NourishContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { goBack } from "@/utils/navigation";
import { n } from "@/utils/scaling";

const SIGNAL_UNITS: Record<SignalId, string> = {
  calories: "kcal",
  protein: "g",
  carbs: "g",
  fat: "g",
  water: "oz",
  fiber: "g",
  sodium: "mg",
  "added-sugar": "g",
  caffeine: "mg",
};

const CIRCLE_DIAMETER = n(9.8);
const CIRCLE_BORDER = n(2.5);
const LINE_WIDTH = n(14.5);
const LINE_HEIGHT = n(2.22);

export default function SignalsScreen() {
  const { bg, textColor } = useThemeColors();

  const { signals, targets, saveSignals, saveTargets } = useNourish();

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
    <SwipeBackContainer enabled onSwipeBack={goBack}>
      <SafeAreaView
        edges={["top"]}
        style={[styles.container, { backgroundColor: bg }]}
      >
        <Header headerTitle="Signals" />

        <View style={styles.content}>
          {SIGNAL_OPTIONS.map((signal) => {
            const isSelected = signals.includes(signal.id);
            const atLimit = signals.length >= 3 && !isSelected;
            const target = targets[signal.id];

            return (
              <View key={signal.id} style={styles.row}>
                <HapticPressable
                  onPress={() => {
                    if (!atLimit) {
                      toggleSignal(signal.id);
                    }
                  }}
                  style={styles.toggleAndLabel}
                >
                  <View style={styles.toggleGraphic}>
                    {isSelected ? (
                      <>
                        <View
                          style={[styles.line, { backgroundColor: textColor }]}
                        />
                        <View
                          style={[
                            styles.circle,
                            { backgroundColor: textColor },
                          ]}
                        />
                      </>
                    ) : (
                      <>
                        <View
                          style={[
                            styles.hollowCircle,
                            { borderColor: textColor },
                          ]}
                        />
                        <View
                          style={[styles.line, { backgroundColor: textColor }]}
                        />
                      </>
                    )}
                  </View>
                  <StyledText style={[styles.label, { color: textColor }]}>
                    {signal.label}
                  </StyledText>
                </HapticPressable>

                <View
                  pointerEvents={isSelected ? "auto" : "none"}
                  style={[
                    styles.targetContainer,
                    { opacity: isSelected ? 1 : 0 },
                  ]}
                >
                  <RNTextInput
                    allowFontScaling={false}
                    cursorColor={textColor}
                    defaultValue={target === undefined ? "" : String(target)}
                    keyboardType="numeric"
                    onEndEditing={(e) =>
                      handleTargetChange(signal.id, e.nativeEvent.text)
                    }
                    placeholder="—"
                    placeholderTextColor={textColor}
                    selectionColor={textColor}
                    style={[styles.targetInput, { color: textColor }]}
                  />
                  <StyledText style={[styles.unit, { color: textColor }]}>
                    {SIGNAL_UNITS[signal.id]}
                  </StyledText>
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
  row: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: n(22),
    paddingVertical: n(16),
  },
  toggleAndLabel: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
  },
  toggleGraphic: {
    alignItems: "center",
    flexDirection: "row",
    marginLeft: n(8.5),
    marginRight: n(20),
    marginTop: n(13),
  },
  circle: {
    borderRadius: CIRCLE_DIAMETER / 2,
    height: CIRCLE_DIAMETER,
    width: CIRCLE_DIAMETER,
  },
  hollowCircle: {
    borderRadius: CIRCLE_DIAMETER / 2,
    borderWidth: CIRCLE_BORDER,
    height: CIRCLE_DIAMETER,
    width: CIRCLE_DIAMETER,
  },
  line: {
    height: LINE_HEIGHT,
    width: LINE_WIDTH,
  },
  label: {
    fontSize: n(30),
  },
  targetContainer: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: n(6),
  },
  targetInput: {
    fontFamily: "PublicSans-Regular",
    fontSize: n(22),
    minWidth: n(52),
    textAlign: "right",
  },
  unit: {
    fontSize: n(16),
  },
});
