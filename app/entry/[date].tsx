import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { EntryForm, type SignalRating } from "@/components/EntryForm";
import { Header } from "@/components/Header";
import { ScrollViewWithIndicator } from "@/components/ScrollViewWithIndicator";
import { StyledText } from "@/components/StyledText";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { SIGNAL_OPTIONS, useNourish } from "@/contexts/NourishContext";
import { consumeResult } from "@/utils/contextPickerStore";
import { formatDateShort } from "@/utils/formatDate";
import { n } from "@/utils/scaling";
import { getTagLabel, type TagId } from "@/utils/tags";

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
          <ScrollViewWithIndicator
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            textColor={textColor}
          >
            <EntryForm
              breakfast={editBreakfast}
              dinner={editDinner}
              enabledSignals={enabledSignals}
              lunch={editLunch}
              note={editNote}
              onBreakfastChange={setEditBreakfast}
              onDinnerChange={setEditDinner}
              onLunchChange={setEditLunch}
              onNoteChange={setEditNote}
              onSnacksChange={setEditSnacks}
              onToggleSignal={toggleSignal}
              selectedTags={editSelectedTags}
              signalRatings={editSignalRatings}
              snacks={editSnacks}
              textColor={textColor}
            />
          </ScrollViewWithIndicator>
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
      <ScrollViewWithIndicator textColor={textColor}>
        <View style={styles.content}>
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
              <StyledText style={[styles.fieldLabel, { color: textColor }]}>
                context
              </StyledText>
              <StyledText style={[styles.fieldValue, { color: textColor }]}>
                {currentEntry.tags.map((id) => getTagLabel(id)).join(", ")}
              </StyledText>
            </View>
          )}

          {currentEntry.note.length > 0 && (
            <View style={styles.field}>
              <StyledText style={[styles.fieldLabel, { color: textColor }]}>
                notes
              </StyledText>
              <StyledText style={[styles.fieldValue, { color: textColor }]}>
                {currentEntry.note}
              </StyledText>
            </View>
          )}

          <View style={styles.bottomPad} />
        </View>
      </ScrollViewWithIndicator>
    );
  };

  return (
    <GestureDetector gesture={daySwipeGesture}>
      <SafeAreaView
        edges={["top"]}
        style={[styles.container, { backgroundColor: bg }]}
      >
        <Header
          headerTitle={formatDateShort(currentDate)}
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
