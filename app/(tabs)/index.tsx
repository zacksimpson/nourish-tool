import { useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticPressable } from "@/components/HapticPressable";
import { Header } from "@/components/Header";
import { StyledText } from "@/components/StyledText";
import { useInvertColors } from "@/contexts/InvertColorsContext";
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
  const dimColor = invertColors ? "#AAAAAA" : "#555555";
  const dividerColor = invertColors ? "#DDDDDD" : "#1A1A1A";

  const {
    handleScroll,
    scrollIndicatorHeight,
    scrollIndicatorPosition,
    setContentHeight,
    setScrollViewHeight,
  } = useScrollIndicator();

  // Meal log
  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [dinner, setDinner] = useState("");
  const [snacks, setSnacks] = useState("");

  // Signal ratings — hardcoded to protein + calories for now
  // will be driven by settings later
  const [caloriesRating, setCaloriesRating] =
    useState<SignalRating | null>(null);
  const [proteinRating, setProteinRating] = useState<SignalRating | null>(null);

  // Tags
  const [selectedTags, setSelectedTags] = useState<Set<TagId>>(new Set());

  // Note
  const [note, setNote] = useState("");

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

  const handleSave = () => {
    // persistence comes later — placeholder for now
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: bg }]}
    >
      <Header
        headerTitle="Nourish"
        hideBackButton
        rightAction={{ icon: "check", onPress: handleSave }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "height" : "padding"}
        style={styles.flex}
      >
        <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
          <View style={styles.scrollWrapper}>
            <Animated.ScrollView
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
                {/* ── SECTION: What you ate ── */}
                <View style={styles.sectionHeader}>
                  <StyledText style={[styles.sectionLabel, { color: dimColor }]}>
                    what you ate
                  </StyledText>
                </View>

                <View style={styles.field}>
                  <StyledText style={[styles.fieldLabel, { color: dimColor }]}>
                    breakfast
                  </StyledText>
                  <RNTextInput
                    allowFontScaling={false}
                    cursorColor={textColor}
                    multiline
                    onChangeText={setBreakfast}
                    placeholder="—"
                    placeholderTextColor={dimColor}
                    selectionColor={textColor}
                    style={[styles.fieldInput, { color: textColor }]}
                    value={breakfast}
                  />
                </View>

                <View style={[styles.divider, { backgroundColor: dividerColor }]} />

                <View style={styles.field}>
                  <StyledText style={[styles.fieldLabel, { color: dimColor }]}>
                    lunch
                  </StyledText>
                  <RNTextInput
                    allowFontScaling={false}
                    cursorColor={textColor}
                    multiline
                    onChangeText={setLunch}
                    placeholder="—"
                    placeholderTextColor={dimColor}
                    selectionColor={textColor}
                    style={[styles.fieldInput, { color: textColor }]}
                    value={lunch}
                  />
                </View>

                <View style={[styles.divider, { backgroundColor: dividerColor }]} />

                <View style={styles.field}>
                  <StyledText style={[styles.fieldLabel, { color: dimColor }]}>
                    dinner
                  </StyledText>
                  <RNTextInput
                    allowFontScaling={false}
                    cursorColor={textColor}
                    multiline
                    onChangeText={setDinner}
                    placeholder="—"
                    placeholderTextColor={dimColor}
                    selectionColor={textColor}
                    style={[styles.fieldInput, { color: textColor }]}
                    value={dinner}
                  />
                </View>

                <View style={[styles.divider, { backgroundColor: dividerColor }]} />

                <View style={styles.field}>
                  <StyledText style={[styles.fieldLabel, { color: dimColor }]}>
                    snacks
                  </StyledText>
                  <RNTextInput
                    allowFontScaling={false}
                    cursorColor={textColor}
                    multiline
                    onChangeText={setSnacks}
                    placeholder="—"
                    placeholderTextColor={dimColor}
                    selectionColor={textColor}
                    style={[styles.fieldInput, { color: textColor }]}
                    value={snacks}
                  />
                </View>

                {/* ── SECTION: How it went ── */}
                <View style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
                  <StyledText style={[styles.sectionLabel, { color: dimColor }]}>
                    how it went
                  </StyledText>
                </View>

                {/* Calories signal */}
                <View style={styles.field}>
                  <StyledText style={[styles.fieldLabel, { color: dimColor }]}>
                    calories
                  </StyledText>
                  <View style={styles.ratingRow}>
                    {SIGNAL_RATINGS.map((rating) => (
                      <HapticPressable
                        key={rating}
                        onPress={() =>
                          setCaloriesRating(
                            caloriesRating === rating ? null : rating
                          )
                        }
                      >
                        <StyledText
                          style={[
                            styles.ratingOption,
                            { color: textColor },
                            caloriesRating === rating && styles.ratingSelected,
                          ]}
                        >
                          {rating}
                        </StyledText>
                      </HapticPressable>
                    ))}
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: dividerColor }]} />

                {/* Protein signal */}
                <View style={styles.field}>
                  <StyledText style={[styles.fieldLabel, { color: dimColor }]}>
                    protein
                  </StyledText>
                  <View style={styles.ratingRow}>
                    {SIGNAL_RATINGS.map((rating) => (
                      <HapticPressable
                        key={rating}
                        onPress={() =>
                          setProteinRating(
                            proteinRating === rating ? null : rating
                          )
                        }
                      >
                        <StyledText
                          style={[
                            styles.ratingOption,
                            { color: textColor },
                            proteinRating === rating && styles.ratingSelected,
                          ]}
                        >
                          {rating}
                        </StyledText>
                      </HapticPressable>
                    ))}
                  </View>
                </View>

                {/* ── SECTION: Context ── */}
                <View style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
                  <StyledText style={[styles.sectionLabel, { color: dimColor }]}>
                    context
                  </StyledText>
                </View>

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

                {/* ── Note ── */}
                <View style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
                  <StyledText style={[styles.sectionLabel, { color: dimColor }]}>
                    note
                  </StyledText>
                </View>

                <View style={styles.field}>
                  <RNTextInput
                    allowFontScaling={false}
                    cursorColor={textColor}
                    multiline
                    onChangeText={setNote}
                    placeholder="anything else worth noting"
                    placeholderTextColor={dimColor}
                    selectionColor={textColor}
                    style={[styles.fieldInput, { color: textColor }]}
                    value={note}
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
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollWrapper: { flex: 1, flexDirection: "row", position: "relative" },
  scrollTrack: scrollIndicatorBaseStyles.track,
  scrollThumb: scrollIndicatorBaseStyles.thumb,
  sectionHeader: {
    paddingHorizontal: n(22),
    paddingTop: n(16),
    paddingBottom: n(4),
  },
  sectionHeaderSpaced: {
    paddingTop: n(32),
  },
  sectionLabel: {
    fontSize: n(13),
    letterSpacing: n(1.5),
    textTransform: "uppercase",
  },
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
  divider: {
    height: 1,
    marginHorizontal: n(22),
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