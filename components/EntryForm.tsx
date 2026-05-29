import { router } from "expo-router";
import { useMemo } from "react";
import { TextInput as RNTextInput, StyleSheet, View } from "react-native";
import { HapticPressable } from "@/components/HapticPressable";
import { StyledText } from "@/components/StyledText";
import { SIGNAL_OPTIONS } from "@/contexts/NourishContext";
import { openPicker } from "@/utils/contextPickerStore";
import { n } from "@/utils/scaling";
import { getTagLabel, type TagId } from "@/utils/tags";

export const SIGNAL_RATINGS = ["on track", "roughly", "off track"] as const;
export type SignalRating = (typeof SIGNAL_RATINGS)[number];

interface EntryFormProps {
  breakfast: string;
  dinner: string;
  enabledSignals: string[];
  lunch: string;
  note: string;
  onBreakfastChange: (text: string) => void;
  onDinnerChange: (text: string) => void;
  onLunchChange: (text: string) => void;
  onNoteChange: (text: string) => void;
  onSnacksChange: (text: string) => void;
  onToggleSignal: (signalId: string, rating: SignalRating) => void;
  selectedTags: Set<TagId>;
  signalRatings: Record<string, SignalRating | null>;
  snacks: string;
  textColor: string;
}

export function EntryForm({
  breakfast,
  dinner,
  enabledSignals,
  lunch,
  note,
  onBreakfastChange,
  onDinnerChange,
  onLunchChange,
  onNoteChange,
  onSnacksChange,
  onToggleSignal,
  selectedTags,
  signalRatings,
  snacks,
  textColor,
}: EntryFormProps) {
  const contextDisplay = useMemo(() => {
    if (selectedTags.size === 0) {
      return null;
    }
    return Array.from(selectedTags)
      .map((id) => getTagLabel(id))
      .join(", ");
  }, [selectedTags]);

  return (
    <View style={styles.content}>
      <View style={styles.field}>
        <StyledText style={[styles.fieldLabel, { color: textColor }]}>
          breakfast:
        </StyledText>
        <RNTextInput
          allowFontScaling={false}
          blurOnSubmit
          cursorColor={textColor}
          multiline
          onChangeText={onBreakfastChange}
          placeholder="Add breakfast"
          placeholderTextColor={textColor}
          returnKeyType="done"
          selectionColor={textColor}
          style={[
            styles.fieldInput,
            { color: textColor, borderBottomColor: textColor },
          ]}
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
          onChangeText={onLunchChange}
          placeholder="Add lunch"
          placeholderTextColor={textColor}
          returnKeyType="done"
          selectionColor={textColor}
          style={[
            styles.fieldInput,
            { color: textColor, borderBottomColor: textColor },
          ]}
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
          onChangeText={onDinnerChange}
          placeholder="Add dinner"
          placeholderTextColor={textColor}
          returnKeyType="done"
          selectionColor={textColor}
          style={[
            styles.fieldInput,
            { color: textColor, borderBottomColor: textColor },
          ]}
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
          onChangeText={onSnacksChange}
          placeholder="Add snacks"
          placeholderTextColor={textColor}
          returnKeyType="done"
          selectionColor={textColor}
          style={[
            styles.fieldInput,
            { color: textColor, borderBottomColor: textColor },
          ]}
          underlineColorAndroid="transparent"
          value={snacks}
        />
      </View>

      {enabledSignals.map((signalId) => {
        const label =
          SIGNAL_OPTIONS.find((s) => s.id === signalId)?.label ?? signalId;
        const current = signalRatings[signalId] ?? null;
        return (
          <View key={signalId} style={styles.field}>
            <StyledText style={[styles.fieldLabel, { color: textColor }]}>
              {label}:
            </StyledText>
            <View style={styles.ratingRow}>
              {SIGNAL_RATINGS.map((rating) => (
                <HapticPressable
                  key={rating}
                  onPress={() => onToggleSignal(signalId, rating)}
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
          openPicker(Array.from(selectedTags));
          router.push("/context-picker");
        }}
        style={styles.field}
      >
        <StyledText style={[styles.fieldLabel, { color: textColor }]}>
          context:
        </StyledText>
        <StyledText style={[styles.fieldInput, { color: textColor }]}>
          {contextDisplay ?? "Add context tags"}
        </StyledText>
      </HapticPressable>

      <View style={styles.field}>
        <RNTextInput
          allowFontScaling={false}
          blurOnSubmit
          cursorColor={textColor}
          multiline
          onChangeText={onNoteChange}
          placeholder="Add notes"
          placeholderTextColor={textColor}
          returnKeyType="done"
          selectionColor={textColor}
          style={[
            styles.fieldInput,
            { color: textColor, borderBottomColor: textColor },
          ]}
          underlineColorAndroid="transparent"
          value={note}
        />
      </View>

      <View style={styles.bottomPad} />
    </View>
  );
}

const styles = StyleSheet.create({
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
  bottomPad: {
    height: n(40),
  },
});
