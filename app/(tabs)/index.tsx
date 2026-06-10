import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EntryForm, type SignalRating } from "@/components/EntryForm";
import { Header } from "@/components/Header";
import { ScrollViewWithIndicator } from "@/components/ScrollViewWithIndicator";
import { Toast } from "@/components/Toast";
import { useNourish } from "@/contexts/NourishContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { consumeResult } from "@/utils/contextPickerStore";
import { formatDateShort, todayDateString } from "@/utils/formatDate";
import type { TagId } from "@/utils/tags";

export default function LogScreen() {
  const { bg, textColor } = useThemeColors();

  const { entries, signals: enabledSignals, saveEntry, loaded } = useNourish();

  const todayRef = useRef(todayDateString());
  const today = todayRef.current;

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

  const toggleSignal = (signalId: string, rating: SignalRating) => {
    setSignalRatings((prev) => ({
      ...prev,
      [signalId]: prev[signalId] === rating ? null : rating,
    }));
  };

  const handleSave = () => {
    const hasContent =
      breakfast.trim() ||
      lunch.trim() ||
      dinner.trim() ||
      snacks.trim() ||
      note.trim() ||
      selectedTags.size > 0 ||
      Object.values(signalRatings).some((r) => r !== null);

    if (!hasContent) {
      return;
    }

    const existing = entries[today];
    const hasChanged =
      !existing ||
      breakfast !== existing.breakfast ||
      lunch !== existing.lunch ||
      dinner !== existing.dinner ||
      snacks !== existing.snacks ||
      note !== existing.note ||
      selectedTags.size !== existing.tags.length ||
      existing.tags.some((t) => !selectedTags.has(t as TagId)) ||
      enabledSignals.some(
        (s) =>
          (signalRatings[s.id] ?? null) !== (existing.signals[s.id] ?? null)
      );

    if (!hasChanged) {
      return;
    }

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
        <ScrollViewWithIndicator
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          textColor={textColor}
        >
          <EntryForm
            breakfast={breakfast}
            dinner={dinner}
            enabledSignals={enabledSignals}
            lunch={lunch}
            note={note}
            onBreakfastChange={setBreakfast}
            onDinnerChange={setDinner}
            onLunchChange={setLunch}
            onNoteChange={setNote}
            onSnacksChange={setSnacks}
            onToggleSignal={toggleSignal}
            selectedTags={selectedTags}
            signalRatings={signalRatings}
            snacks={snacks}
            textColor={textColor}
          />
        </ScrollViewWithIndicator>
      </KeyboardAvoidingView>

      <Toast
        message="logged"
        onHide={() => {
          setToastVisible(false);
          router.push(`/entry/${today}`);
        }}
        visible={toastVisible}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
});
