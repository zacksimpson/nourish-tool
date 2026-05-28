import { router, useLocalSearchParams } from "expo-router";
import { Animated, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { StyledText } from "@/components/StyledText";
import { SwipeBackContainer } from "@/components/SwipeBackContainer";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { SIGNAL_OPTIONS, useNourish } from "@/contexts/NourishContext";
import {
  scrollIndicatorBaseStyles,
  useScrollIndicator,
} from "@/hooks/useScrollIndicator";
import { formatDate } from "@/utils/formatDate";
import { n } from "@/utils/scaling";

export default function EntryDetailScreen() {
  const { invertColors } = useInvertColors();
  const bg = invertColors ? "white" : "black";
  const textColor = invertColors ? "black" : "white";

  const { date } = useLocalSearchParams<{ date: string }>();
  const { entries } = useNourish();
  const entry = entries[date];

  const {
    handleScroll,
    scrollIndicatorHeight,
    scrollIndicatorPosition,
    setContentHeight,
    setScrollViewHeight,
  } = useScrollIndicator();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  if (!entry) {
    return (
      <SwipeBackContainer enabled onSwipeBack={handleBack}>
        <SafeAreaView
          edges={["top"]}
          style={[styles.container, { backgroundColor: bg }]}
        >
          <Header headerTitle={date ? formatDate(date) : ""} />
          <View style={styles.emptyState}>
            <StyledText style={[styles.emptyText, { color: textColor }]}>
              entry not found
            </StyledText>
          </View>
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
        <Header headerTitle={formatDate(date)} />

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
                    {entry.tags.join(", ")}
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
  fieldValue: {
    fontFamily: "PublicSans-Regular",
    fontSize: n(22),
  },
  emptyState: {
    paddingHorizontal: n(22),
    paddingTop: n(32),
  },
  emptyText: {
    fontSize: n(22),
  },
  bottomPad: {
    height: n(40),
  },
});
