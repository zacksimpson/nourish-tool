import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  StyleSheet,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticPressable } from "@/components/HapticPressable";
import { Header } from "@/components/Header";
import { StyledText } from "@/components/StyledText";
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
import { formatDate } from "@/utils/formatDate";
import { n } from "@/utils/scaling";
import { getTagLabel, type TagId } from "@/utils/tags";

const SIGNAL_RATINGS = ["on track", "roughly", "off track"] as const;
type SignalRating = (typeof SIGNAL_RATINGS)[number];

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export default function EntryDetailScreen() {
  const { invertColors } = useInvertColors();
  const bg = invertColors ? "white" : "black";
  const textColor = invertColors ? "black" : "white";

  const { date } = useLocalSearchParams<{ date: string }>();
  const { entries, signals: enabledSignals, saveEntry } = useNourish();

  const todayRef = useRef(new Date().toISOString().slice(0, 10));
  const [currentDate, setCurrentDate] = useState(date);
  const currentDateRef = useRef(currentDate);
  currentDateRef.current = currentDate;

  const currentEntry = entries[currentDate];

  const {
    handleScroll,
    scrollIndicatorHeight,
    scrollIndicatorPosition,
    setContentHeight,
    setScrollViewHeight,
  } = useScrollIndicator();

  const [isEditing, setIsEditing] = useState(false);
  const isEditingRef = useRef(isEditing);
  isEditingRef.current = isEditing;

  const [editBreakfast, setEditBreakfast] = useState("");
  const [editLunch, setEditLunch] = useState("");
  const [editDinner, setEditDinner] = useState("");
  const [editSnacks, setEditSnacks] = useState("");
  const [editSignalRatings, setEditSignalRatings] = useState<
    Record<string, SignalRating | null>
  >({});
  const [editSelectedTags, setEditSelectedTags] = useState<Set<TagId>>(
    new Set()
  );
  const [editNote, setEditNote] = useState("");

  const daySwipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-10, 10])
        .failOffsetY([-20, 20])
        .onEnd((event) => {
          if (isEditingRef.current) {
            return;
          }
          const { translationX, velocityX } = event;
          const isMeaningful =
            Math.abs(translationX) > 50 || Math.abs(velocityX) > 400;
          if (!isMeaningful) {
            return;
          }
          if (translationX < 0) {
            const next = addDays(currentDateRef.current, 1);
            if (next <= todayRef.current) {
              setCurrentDate(next);
            }
          } else {
            setCurrentDate(addDays(currentDateRef.current, -1));
          }
        })
        .runOnJS(true),
    []
  );

  useFocusEffect(
    useCallback(() => {
      const result = consumeResult();
      if (result !== null) {
        setEditSelectedTags(new Set(result) as Set<TagId>);
      }
    }, [])
  );

  const contextDisplay = useMemo(() => {
    if (editSelectedTags.size === 0) {
      return null;
    }
    return Array.from(editSelectedTags)
      .map((id) => getTagLabel(id))
      .join(", ");
  }, [editSelectedTags]);

  const handleStartEdit = () => {
    if (currentEntry) {
      setEditBreakfast(currentEntry.breakfast);
      setEditLunch(currentEntry.lunch);
      setEditDinner(currentEntry.dinner);
      setEditSnacks(currentEntry.snacks);
      setEditSignalRatings(
        currentEntry.signals as Record<string, SignalRating | null>
      );
      setEditSelectedTags(new Set(currentEntry.tags) as Set<TagId>);
      setEditNote(currentEntry.note);
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    saveEntry({
      date: currentDate,
      breakfast: editBreakfast,
      lunch: editLunch,
      dinner: editDinner,
      snacks: editSnacks,
      signals: editSignalRatings,
      tags: Array.from(editSelectedTags),
      note: editNote,
      savedAt: Date.now(),
    });
    setIsEditing(false);
  };

  const toggleSignal = (signalId: string, rating: SignalRating) => {
    setEditSignalRatings((prev) => ({
      ...prev,
      [signalId]: prev[signalId] === rating ? null : rating,
    }));
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <KeyboardAvoidingView
          behavior={Platform.OS === "android" ? "height" : "padding"}
          style={styles.flex}
        >
          <View style={styles.scrollWrapper}>
            <Animated.ScrollView
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              onLayout={(e) =>
                setScrollViewHeight(e.nativeEvent.layout.height)
              }
              onScroll={handleScroll}
              overScrollMode="never"
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
            >
              <View
                onLayout={(e) =>
                  setContentHeight(e.nativeEvent.layout.height)
                }
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
                    onChangeText={setEditBreakfast}
                    placeholder="Add breakfast"
                    placeholderTextColor={textColor}
                    returnKeyType="done"
                    selectionColor={textColor}
                    style={[
                      styles.fieldInput,
                      { color: textColor, borderBottomColor: textColor },
                    ]}
                    underlineColorAndroid="transparent"
                    value={editBreakfast}
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
                    onChangeText={setEditLunch}
                    placeholder="Add lunch"
                    placeholderTextColor={textColor}
                    returnKeyType="done"
                    selectionColor={textColor}
                    style={[
                      styles.fieldInput,
                      { color: textColor, borderBottomColor: textColor },
                    ]}
                    underlineColorAndroid="transparent"
                    value={editLunch}
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
                    onChangeText={setEditDinner}
                    placeholder="Add dinner"
                    placeholderTextColor={textColor}
                    returnKeyType="done"
                    selectionColor={textColor}
                    style={[
                      styles.fieldInput,
                      { color: textColor, borderBottomColor: textColor },
                    ]}
                    underlineColorAndroid="transparent"
                    value={editDinner}
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
                    onChangeText={setEditSnacks}
                    placeholder="Add snacks"
                    placeholderTextColor={textColor}
                    returnKeyType="done"
                    selectionColor={textColor}
                    style={[
                      styles.fieldInput,
                      { color: textColor, borderBottomColor: textColor },
                    ]}
                    underlineColorAndroid="transparent"
                    value={editSnacks}
                  />
                </View>

                {enabledSignals.map((signalId) => {
                  const label =
                    SIGNAL_OPTIONS.find((s) => s.id === signalId)?.label ??
                    signalId;
                  const current = editSignalRatings[signalId] ?? null;
                  return (
                    <View key={signalId} style={styles.field}>
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
                  );
                })}

                <HapticPressable
                  onPress={() => {
                    openPicker(Array.from(editSelectedTags));
                    router.push("/context-picker");
                  }}
                  style={styles.field}
                >
                  <StyledText
                    style={[styles.fieldLabel, { color: textColor }]}
                  >
                    context:
                  </StyledText>
                  <StyledText
                    style={[styles.fieldInput, { color: textColor }]}
                  >
                    {contextDisplay ?? "—"}
                  </StyledText>
                </HapticPressable>

                <View style={styles.field}>
                  <RNTextInput
                    allowFontScaling={false}
                    blurOnSubmit
                    cursorColor={textColor}
                    multiline
                    onChangeText={setEditNote}
                    placeholder="Add notes"
                    placeholderTextColor={textColor}
                    returnKeyType="done"
                    selectionColor={textColor}
                    style={[
                      styles.fieldInput,
                      { color: textColor, borderBottomColor: textColor },
                    ]}
                    underlineColorAndroid="transparent"
                    value={editNote}
                  />
                </View>

                <View style={styles.bottomPad} />
              </View>
            </Animated.ScrollView>

            {scrollIndicatorHeight > 0 && (
              <View
                style={[styles.scrollTrack, { backgroundColor: textColor }]}
              >
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
      );
    }

    if (!currentEntry) {
      return (
        <View style={styles.emptyState}>
          <StyledText style={[styles.emptyText, { color: textColor }]}>
            no entry logged
          </StyledText>
        </View>
      );
    }

    const ratedSignals = SIGNAL_OPTIONS.filter(
      (s) => currentEntry.signals[s.id] != null
    );

    return (
      <View style={styles.scrollWrapper}>
        <Animated.ScrollView
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
              <StyledText style={[styles.fieldValue, { color: textColor }]}>
                {currentEntry.breakfast || "—"}
              </StyledText>
            </View>

            <View style={styles.field}>
              <StyledText style={[styles.fieldLabel, { color: textColor }]}>
                lunch
              </StyledText>
              <StyledText style={[styles.fieldValue, { color: textColor }]}>
                {currentEntry.lunch || "—"}
              </StyledText>
            </View>

            <View style={styles.field}>
              <StyledText style={[styles.fieldLabel, { color: textColor }]}>
                dinner
              </StyledText>
              <StyledText style={[styles.fieldValue, { color: textColor }]}>
                {currentEntry.dinner || "—"}
              </StyledText>
            </View>

            <View style={styles.field}>
              <StyledText style={[styles.fieldLabel, { color: textColor }]}>
                snacks
              </StyledText>
              <StyledText style={[styles.fieldValue, { color: textColor }]}>
                {currentEntry.snacks || "—"}
              </StyledText>
            </View>

            {ratedSignals.map((signal) => (
              <View key={signal.id} style={styles.field}>
                <StyledText style={[styles.fieldLabel, { color: textColor }]}>
                  {signal.label}
                </StyledText>
                <StyledText style={[styles.fieldValue, { color: textColor }]}>
                  {currentEntry.signals[signal.id]}
                </StyledText>
              </View>
            ))}

            {currentEntry.tags.length > 0 && (
              <View style={styles.field}>
                <StyledText style={[styles.fieldValue, { color: textColor }]}>
                  {currentEntry.tags.map((id) => getTagLabel(id)).join(", ")}
                </StyledText>
              </View>
            )}

            {currentEntry.note.length > 0 && (
              <View style={styles.field}>
                <StyledText style={[styles.fieldValue, { color: textColor }]}>
                  {currentEntry.note}
                </StyledText>
              </View>
            )}

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
    );
  };

  return (
    <GestureDetector gesture={daySwipeGesture}>
      <SafeAreaView
        edges={["top"]}
        style={[styles.container, { backgroundColor: bg }]}
      >
        <Header
          headerTitle={formatDate(currentDate)}
          hideBackButton={isEditing}
          leftAction={
            isEditing
              ? { icon: "arrow-back-ios", onPress: () => setIsEditing(false) }
              : undefined
          }
          rightAction={
            isEditing
              ? { icon: "check", onPress: handleSave }
              : { icon: "edit", onPress: handleStartEdit }
          }
        />
        {renderContent()}
      </SafeAreaView>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollWrapper: { flex: 1, flexDirection: "row", position: "relative" },
  scrollTrack: scrollIndicatorBaseStyles.track,
  scrollThumb: scrollIndicatorBaseStyles.thumb,
  content: {
    paddingTop: n(12),
  },
  field: {
    paddingHorizontal: n(28),
    paddingVertical: n(13),
  },
  fieldLabel: {
    fontSize: n(16),
    marginBottom: n(6),
  },
  fieldValue: {
    fontFamily: "PublicSans-Regular",
    fontSize: n(22),
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
  emptyState: {
    paddingHorizontal: n(28),
    paddingTop: n(32),
  },
  emptyText: {
    fontSize: n(22),
  },
  bottomPad: {
    height: n(40),
  },
});
