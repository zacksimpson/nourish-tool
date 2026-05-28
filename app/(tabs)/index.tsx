import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticPressable } from "@/components/HapticPressable";
import { Header } from "@/components/Header";
import { StyledText } from "@/components/StyledText";
import { Toast } from "@/components/Toast";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { SIGNAL_OPTIONS, useNourish } from "@/contexts/NourishContext";
import {
  scrollIndicatorBaseStyles,
  useScrollIndicator,
} from "@/hooks/useScrollIndicator";
import {
  consumeResult,
  openPicker,
} from "@/utils/contextPickerStore";
import { formatDateShort } from "@/utils/formatDate";
import { n } from "@/utils/scaling";
import { getTagLabel, type TagId } from "@/utils/tags";

const SIGNAL_RATINGS = ["on track", "roughly", "off track"] as const;
type SignalRating = (typeof SIGNAL_RATINGS)[number];

export default function LogScreen() {
  const { invertColors } = useInvertColors();
  const bg = invertColors ? "white" : "black";
  const textColor = invertColors ? "black" : "white";

  const { entries, signals: enabledSignals, saveEntry, loaded } = useNourish();

  const todayRef = useRef(new Date().toISOString().slice(0, 10));
  const today = todayRef.current;

  const {
    handleScroll,
    scrollIndicatorHeight,
    scrollIndicatorPosition,
    setContentHeight,
    setScrollViewHeight,
  } = useScrollIndicator();

  // Check-in form state
  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [dinner, setDinner] = useState("");
  const [snacks, setSnacks] = useState("");
  const [signalRatings, setSignalRatings] = useState<
    Record<string, SignalRating | null>
  >({});
  const [selectedTags, setSelectedTags] = useState<Set<TagId>>(new Set());
  const [note, setNote] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!loaded || initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    const entry = entries[today];
    if (!entry) {
      return;
    }

    setBreakfast(entry.breakfast);
    setLunch(entry.lunch);
    setDinner(entry.dinner);
    setSnacks(entry.snacks);
    setSignalRatings(entry.signals as Record<string, SignalRating | null>);
    setSelectedTags(new Set(entry.tags) as Set<TagId>);
    setNote(entry.note);
  }, [loaded, entries, today]);

  useFocusEffect(
    useCallback(() => {
      const result = consumeResult();
      if (result !== null) {
        setSelectedTags(new Set(result) as Set<TagId>);
      }
    }, [])
  );

  const contextDisplay = useMemo(() => {
    if (selectedTags.size === 0) {
      return null;
    }
    return Array.from(selectedTags)
      .map((id) => getTagLabel(id))
      .join(", ");
  }, [selectedTags]);

  const toggleSignal = (signalId: string, rating: SignalRating) => {
    setSignalRatings((prev) => ({
      ...prev,
      [signalId]: prev[signalId] === rating ? null : rating,
    }));
  };

  const handleSave = () => {
    saveEntry({
      date: today,
      breakfast,
      lunch,
      dinner,
      snacks,
      signals: signalRatings,
      tags: Array.from(selectedTags),
      note,
      savedAt: Date.now(),
    });
    setToastVisible(true);
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: bg }]}
    >
      <Header
        headerTitle={formatDateShort(today)}
        hideBackButton
        rightAction={{ icon: "check", onPress: handleSave }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "height" : "padding"}
        style={styles.flex}
      >
        <View style={styles.scrollWrapper}>
          <Animated.ScrollView
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
            onScroll={handleScroll}
            overScrollMode="never"
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <View
              onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
              style={styles.content}
            >
              <View style={styles.field}>
                <StyledText style={[styles.fieldLabel, { color: textColor }]}>
                  breakfast:
                </StyledText>
                <RNTextInput
                  allowFontScaling={false}
                  blurOnSubmit
                  cursorColor={textColor}
                  multiline
                  onChangeText={setBreakfast}
                  placeholder="Add breakfast"
                  placeholderTextColor={textColor}
                  returnKeyType="done"
                  selectionColor={textColor}
                  style={[styles.fieldInput, { color: textColor, borderBottomColor: textColor }]}
                  underlineColorAndroid="transparent"
                  value={breakfast}
                />
              </View>

              <View style={styles.field}>
                <StyledText style={[styles.fieldLabel, { color: textColor }]}>
                  lunch:
                </StyledText>
                <RNTextInput
                  allowFontScaling={false}
                  blurOnSubmit
                  cursorColor={textColor}
                  multiline
                  onChangeText={setLunch}
                  placeholder="Add lunch"
                  placeholderTextColor={textColor}
                  returnKeyType="done"
                  selectionColor={textColor}
                  style={[styles.fieldInput, { color: textColor, borderBottomColor: textColor }]}
                  underlineColorAndroid="transparent"
                  value={lunch}
                />
              </View>

              <View style={styles.field}>
                <StyledText style={[styles.fieldLabel, { color: textColor }]}>
                  dinner:
                </StyledText>
                <RNTextInput
                  allowFontScaling={false}
                  blurOnSubmit
                  cursorColor={textColor}
                  multiline
                  onChangeText={setDinner}
                  placeholder="Add dinner"
                  placeholderTextColor={textColor}
                  returnKeyType="done"
                  selectionColor={textColor}
                  style={[styles.fieldInput, { color: textColor, borderBottomColor: textColor }]}
                  underlineColorAndroid="transparent"
                  value={dinner}
                />
              </View>

              <View style={styles.field}>
                <StyledText style={[styles.fieldLabel, { color: textColor }]}>
                  snacks:
                </StyledText>
                <RNTextInput
                  allowFontScaling={false}
                  blurOnSubmit
                  cursorColor={textColor}
                  multiline
                  onChangeText={setSnacks}
                  placeholder="Add snacks"
                  placeholderTextColor={textColor}
                  returnKeyType="done"
                  selectionColor={textColor}
                  style={[styles.fieldInput, { color: textColor, borderBottomColor: textColor }]}
                  underlineColorAndroid="transparent"
                  value={snacks}
                />
              </View>

              {enabledSignals.map((signalId) => {
                const label =
                  SIGNAL_OPTIONS.find((s) => s.id === signalId)?.label ??
                  signalId;
                const current = signalRatings[signalId] ?? null;
                return (
                  <View key={signalId}>
                    <View style={styles.field}>
                      <StyledText
                        style={[styles.fieldLabel, { color: textColor }]}
                      >
                        {label}:
                      </StyledText>
                      <View style={styles.ratingRow}>
                        {SIGNAL_RATINGS.map((rating) => (
                          <HapticPressable
                            key={rating}
                            onPress={() => toggleSignal(signalId, rating)}
                          >
                            <StyledText
                              style={[
                                styles.ratingOption,
                                { color: textColor },
                                current === rating && styles.ratingSelected,
                              ]}
                            >
                              {rating}
                            </StyledText>
                          </HapticPressable>
                        ))}
                      </View>
                    </View>
                  </View>
                );
              })}

              <HapticPressable
                onPress={() => {
                  openPicker(Array.from(selectedTags));
                  router.push("/context-picker");
                }}
                style={styles.field}
              >
                <StyledText style={[styles.fieldLabel, { color: textColor }]}>
                  context:
                </StyledText>
                <StyledText style={[styles.fieldInput, { color: textColor }]}>
                  {contextDisplay ?? "—"}
                </StyledText>
              </HapticPressable>

              <View style={styles.field}>
                <RNTextInput
                  allowFontScaling={false}
                  blurOnSubmit
                  cursorColor={textColor}
                  multiline
                  onChangeText={setNote}
                  placeholder="Add notes"
                  placeholderTextColor={textColor}
                  returnKeyType="done"
                  selectionColor={textColor}
                  style={[styles.fieldInput, { color: textColor, borderBottomColor: textColor }]}
                  underlineColorAndroid="transparent"
                  value={note}
                />
              </View>

              <View style={styles.bottomPad} />
            </View>
          </Animated.ScrollView>

          {scrollIndicatorHeight > 0 && (
            <View style={[styles.scrollTrack, { backgroundColor: textColor }]}>
              <Animated.View
                style={[
                  styles.scrollThumb,
                  {
                    backgroundColor: textColor,
                    height: scrollIndicatorHeight,
                    transform: [{ translateY: scrollIndicatorPosition }],
                  },
                ]}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      <Toast
        message="logged"
        onHide={() => setToastVisible(false)}
        visible={toastVisible}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollWrapper: { flex: 1, flexDirection: "row", position: "relative" },
  scrollTrack: scrollIndicatorBaseStyles.track,
  scrollThumb: scrollIndicatorBaseStyles.thumb,
  field: {
    paddingHorizontal: n(28),
    paddingVertical: n(13),
  },
  fieldLabel: {
    fontSize: n(16),
    marginBottom: n(6),
  },
  fieldInput: {
    fontSize: n(23),
    fontFamily: "PublicSans-Regular",
    paddingVertical: n(2),
    paddingBottom: n(4),
    paddingLeft: 0,
    borderBottomWidth: n(3),
    marginRight: n(18),
  },
  ratingRow: {
    flexDirection: "row",
    gap: n(24),
    paddingTop: n(4),
  },
  ratingOption: {
    fontSize: n(22),
    fontFamily: "PublicSans-Regular",
  },
  ratingSelected: {
    textDecorationLine: "underline",
  },
  content: {
    paddingTop: n(12),
  },
  bottomPad: {
    height: n(40),
  },
});
