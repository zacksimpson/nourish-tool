import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DatePicker } from "@/components/DatePicker";
import { HapticPressable } from "@/components/HapticPressable";
import { Header } from "@/components/Header";
import { StyledText } from "@/components/StyledText";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { SIGNAL_OPTIONS, useNourish } from "@/contexts/NourishContext";
import {
  scrollIndicatorBaseStyles,
  useScrollIndicator,
} from "@/hooks/useScrollIndicator";
import { n } from "@/utils/scaling";

const TAGS = [
  { id: "tired", label: "tired" },
  { id: "sick", label: "sick" },
  { id: "sore", label: "sore" },
  { id: "restless", label: "restless" },
  { id: "stressed", label: "stressed" },
  { id: "anxious", label: "anxious" },
  { id: "low-mood", label: "low mood" },
  { id: "overwhelmed", label: "overwhelmed" },
  { id: "social-eating", label: "social eating" },
  { id: "traveling", label: "traveling" },
  { id: "busy-day", label: "busy day" },
  { id: "worked-late", label: "worked late" },
  { id: "ate-out", label: "ate out" },
  { id: "skipped-meal", label: "skipped a meal" },
  { id: "ate-fast", label: "ate fast" },
  { id: "late-night-eating", label: "late night eating" },
] as const;

type TagId = (typeof TAGS)[number]["id"];

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

  // Date picker modal state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDate = (date: string) => {
    setPickerVisible(false);
    router.push({ pathname: "/entry/[date]", params: { date } });
  };

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

  const toggleTag = (id: TagId) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: bg }]}
    >
      <Header
        headerTitle="Nourish"
        hideBackButton
        leftAction={{ icon: "history", onPress: () => setPickerVisible(true) }}
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
            >
              <View style={styles.field}>
                <StyledText style={[styles.fieldLabel, { color: textColor }]}>
                  breakfast
                </StyledText>
                <RNTextInput
                  allowFontScaling={false}
                  blurOnSubmit
                  cursorColor={textColor}
                  multiline
                  onChangeText={setBreakfast}
                  placeholder="—"
                  placeholderTextColor={textColor}
                  returnKeyType="done"
                  selectionColor={textColor}
                  style={[styles.fieldInput, { color: textColor }]}
                  value={breakfast}
                />
              </View>

              <View style={styles.field}>
                <StyledText style={[styles.fieldLabel, { color: textColor }]}>
                  lunch
                </StyledText>
                <RNTextInput
                  allowFontScaling={false}
                  blurOnSubmit
                  cursorColor={textColor}
                  multiline
                  onChangeText={setLunch}
                  placeholder="—"
                  placeholderTextColor={textColor}
                  returnKeyType="done"
                  selectionColor={textColor}
                  style={[styles.fieldInput, { color: textColor }]}
                  value={lunch}
                />
              </View>

              <View style={styles.field}>
                <StyledText style={[styles.fieldLabel, { color: textColor }]}>
                  dinner
                </StyledText>
                <RNTextInput
                  allowFontScaling={false}
                  blurOnSubmit
                  cursorColor={textColor}
                  multiline
                  onChangeText={setDinner}
                  placeholder="—"
                  placeholderTextColor={textColor}
                  returnKeyType="done"
                  selectionColor={textColor}
                  style={[styles.fieldInput, { color: textColor }]}
                  value={dinner}
                />
              </View>

              <View style={styles.field}>
                <StyledText style={[styles.fieldLabel, { color: textColor }]}>
                  snacks
                </StyledText>
                <RNTextInput
                  allowFontScaling={false}
                  blurOnSubmit
                  cursorColor={textColor}
                  multiline
                  onChangeText={setSnacks}
                  placeholder="—"
                  placeholderTextColor={textColor}
                  returnKeyType="done"
                  selectionColor={textColor}
                  style={[styles.fieldInput, { color: textColor }]}
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
                        {label}
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

              <View style={styles.tagList}>
                {TAGS.map((tag) => (
                  <HapticPressable
                    key={tag.id}
                    onPress={() => toggleTag(tag.id)}
                    style={styles.tagRow}
                  >
                    <StyledText
                      style={[
                        styles.tagText,
                        { color: textColor },
                        selectedTags.has(tag.id) && styles.tagSelected,
                      ]}
                    >
                      {tag.label}
                    </StyledText>
                  </HapticPressable>
                ))}
              </View>

              <View style={styles.field}>
                <RNTextInput
                  allowFontScaling={false}
                  blurOnSubmit
                  cursorColor={textColor}
                  multiline
                  onChangeText={setNote}
                  placeholder="anything else worth noting"
                  placeholderTextColor={textColor}
                  returnKeyType="done"
                  selectionColor={textColor}
                  style={[styles.fieldInput, { color: textColor }]}
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

      <DatePicker
        onDismiss={() => setPickerVisible(false)}
        onNextMonth={handleNextMonth}
        onPrevMonth={handlePrevMonth}
        onSelect={handleSelectDate}
        viewMonth={viewMonth}
        viewYear={viewYear}
        visible={pickerVisible}
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
    paddingHorizontal: n(22),
    paddingVertical: n(13),
  },
  fieldLabel: {
    fontSize: n(14),
    marginBottom: n(6),
  },
  fieldInput: {
    fontSize: n(22),
    fontFamily: "PublicSans-Regular",
    paddingVertical: n(2),
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
  tagList: {
    paddingHorizontal: n(22),
    paddingTop: n(4),
  },
  tagRow: {
    paddingVertical: n(10),
  },
  tagText: {
    fontSize: n(22),
  },
  tagSelected: {
    textDecorationLine: "underline",
  },
  bottomPad: {
    height: n(40),
  },
});
