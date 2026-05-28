import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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
import { SwipeBackContainer } from "@/components/SwipeBackContainer";
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

export default function EntryDetailScreen() {
  const { invertColors } = useInvertColors();
  const bg = invertColors ? "white" : "black";
  const textColor = invertColors ? "black" : "white";

  const { date } = useLocalSearchParams<{ date: string }>();
  const { entries, signals: enabledSignals, saveEntry } = useNourish();
  const entry = entries[date];

  const {
    handleScroll,
    scrollIndicatorHeight,
    scrollIndicatorPosition,
    setContentHeight,
    setScrollViewHeight,
  } = useScrollIndicator();

  const [isEditing, setIsEditing] = useState(false);
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
    if (entry) {
      setEditBreakfast(entry.breakfast);
      setEditLunch(entry.lunch);
      setEditDinner(entry.dinner);
      setEditSnacks(entry.snacks);
      setEditSignalRatings(
        entry.signals as Record<string, SignalRating | null>
      );
      setEditSelectedTags(new Set(entry.tags) as Set<TagId>);
      setEditNote(entry.note);
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    saveEntry({
      date,
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

  const handleBack = useCallback(() => {
    if (isEditing) {
      setIsEditing(false);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  }, [isEditing]);

  if (!entry && !isEditing) {
    return (
      <SwipeBackContainer enabled onSwipeBack={handleBack}>
        <SafeAreaView
          edges={["top"]}
          style={[styles.container, { backgroundColor: bg }]}
        >
          <Header
            headerTitle={date ? formatDate(date) : ""}
            rightAction={{ icon: "edit", onPress: handleStartEdit }}
          />
          <View style={styles.emptyState}>
            <StyledText style={[styles.emptyText, { color: textColor }]}>
              no entry logged
            </StyledText>
          </View>
        </SafeAreaView>
      </SwipeBackContainer>
    );
  }

  if (isEditing) {
    return (
      <SwipeBackContainer enabled onSwipeBack={handleBack}>
        <SafeAreaView
          edges={["top"]}
          style={[styles.container, { backgroundColor: bg }]}
        >
          <Header
            headerTitle={date ? formatDate(date) : ""}
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
                    <StyledText
                      style={[styles.fieldLabel, { color: textColor }]}
                    >
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
                    <StyledText
                      style={[styles.fieldLabel, { color: textColor }]}
                    >
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
                    <StyledText
                      style={[styles.fieldLabel, { color: textColor }]}
                    >
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
                    <StyledText
                      style={[styles.fieldLabel, { color: textColor }]}
                    >
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
        </SafeAreaView>
      </SwipeBackContainer>
    );
  }

  const ratedSignals = SIGNAL_OPTIONS.filter(
    (s) => entry.signals[s.id] != null
  );

  return (
    <SwipeBackContainer enabled onSwipeBack={handleBack}>
      <SafeAreaView
        edges={["top"]}
        style={[styles.container, { backgroundColor: bg }]}
      >
        <Header
          headerTitle={formatDate(date)}
          rightAction={{ icon: "edit", onPress: handleStartEdit }}
        />

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
                  {entry.breakfast || "—"}
                </StyledText>
              </View>

              <View style={styles.field}>
                <StyledText style={[styles.fieldLabel, { color: textColor }]}>
                  lunch
                </StyledText>
                <StyledText style={[styles.fieldValue, { color: textColor }]}>
                  {entry.lunch || "—"}
                </StyledText>
              </View>

              <View style={styles.field}>
                <StyledText style={[styles.fieldLabel, { color: textColor }]}>
                  dinner
                </StyledText>
                <StyledText style={[styles.fieldValue, { color: textColor }]}>
                  {entry.dinner || "—"}
                </StyledText>
              </View>

              <View style={styles.field}>
                <StyledText style={[styles.fieldLabel, { color: textColor }]}>
                  snacks
                </StyledText>
                <StyledText style={[styles.fieldValue, { color: textColor }]}>
                  {entry.snacks || "—"}
                </StyledText>
              </View>

              {ratedSignals.map((signal) => (
                <View key={signal.id} style={styles.field}>
                  <StyledText style={[styles.fieldLabel, { color: textColor }]}>
                    {signal.label}
                  </StyledText>
                  <StyledText style={[styles.fieldValue, { color: textColor }]}>
                    {entry.signals[signal.id]}
                  </StyledText>
                </View>
              ))}

              {entry.tags.length > 0 && (
                <View style={styles.field}>
                  <StyledText style={[styles.fieldValue, { color: textColor }]}>
                    {entry.tags.map((id) => getTagLabel(id)).join(", ")}
                  </StyledText>
                </View>
              )}

              {entry.note.length > 0 && (
                <View style={styles.field}>
                  <StyledText style={[styles.fieldValue, { color: textColor }]}>
                    {entry.note}
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
      </SafeAreaView>
    </SwipeBackContainer>
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
