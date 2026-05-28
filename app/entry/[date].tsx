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
  const dimColor = invertColors ? "#AAAAAA" : "#555555";
  const dividerColor = invertColors ? "#DDDDDD" : "#1A1A1A";

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
            <StyledText style={[styles.emptyText, { color: dimColor }]}>
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
              {/* ── What you ate ── */}
              <View style={styles.sectionHeader}>
                <StyledText style={[styles.sectionLabel, { color: dimColor }]}>
                  what you ate
                </StyledText>
              </View>

              <View style={styles.field}>
                <StyledText style={[styles.fieldLabel, { color: dimColor }]}>
                  breakfast
                </StyledText>
                <StyledText style={[styles.fieldValue, { color: textColor }]}>
                  {entry.breakfast || "—"}
                </StyledText>
              </View>

              <View
                style={[styles.divider, { backgroundColor: dividerColor }]}
              />

              <View style={styles.field}>
                <StyledText style={[styles.fieldLabel, { color: dimColor }]}>
                  lunch
                </StyledText>
                <StyledText style={[styles.fieldValue, { color: textColor }]}>
                  {entry.lunch || "—"}
                </StyledText>
              </View>

              <View
                style={[styles.divider, { backgroundColor: dividerColor }]}
              />

              <View style={styles.field}>
                <StyledText style={[styles.fieldLabel, { color: dimColor }]}>
                  dinner
                </StyledText>
                <StyledText style={[styles.fieldValue, { color: textColor }]}>
                  {entry.dinner || "—"}
                </StyledText>
              </View>

              <View
                style={[styles.divider, { backgroundColor: dividerColor }]}
              />

              <View style={styles.field}>
                <StyledText style={[styles.fieldLabel, { color: dimColor }]}>
                  snacks
                </StyledText>
                <StyledText style={[styles.fieldValue, { color: textColor }]}>
                  {entry.snacks || "—"}
                </StyledText>
              </View>

              {/* ── How it went ── */}
              {ratedSignals.length > 0 && (
                <>
                  <View
                    style={[styles.sectionHeader, styles.sectionHeaderSpaced]}
                  >
                    <StyledText
                      style={[styles.sectionLabel, { color: dimColor }]}
                    >
                      how it went
                    </StyledText>
                  </View>

                  {ratedSignals.map((signal, index) => (
                    <View key={signal.id}>
                      {index > 0 && (
                        <View
                          style={[
                            styles.divider,
                            { backgroundColor: dividerColor },
                          ]}
                        />
                      )}
                      <View style={styles.field}>
                        <StyledText
                          style={[styles.fieldLabel, { color: dimColor }]}
                        >
                          {signal.label}
                        </StyledText>
                        <StyledText
                          style={[styles.fieldValue, { color: textColor }]}
                        >
                          {entry.signals[signal.id]}
                        </StyledText>
                      </View>
                    </View>
                  ))}
                </>
              )}

              {/* ── Context tags ── */}
              {entry.tags.length > 0 && (
                <>
                  <View
                    style={[styles.sectionHeader, styles.sectionHeaderSpaced]}
                  >
                    <StyledText
                      style={[styles.sectionLabel, { color: dimColor }]}
                    >
                      context
                    </StyledText>
                  </View>

                  <View style={styles.field}>
                    <StyledText
                      style={[styles.fieldValue, { color: textColor }]}
                    >
                      {entry.tags.join(", ")}
                    </StyledText>
                  </View>
                </>
              )}

              {/* ── Note ── */}
              {entry.note.length > 0 && (
                <>
                  <View
                    style={[styles.sectionHeader, styles.sectionHeaderSpaced]}
                  >
                    <StyledText
                      style={[styles.sectionLabel, { color: dimColor }]}
                    >
                      note
                    </StyledText>
                  </View>

                  <View style={styles.field}>
                    <StyledText
                      style={[styles.fieldValue, { color: textColor }]}
                    >
                      {entry.note}
                    </StyledText>
                  </View>
                </>
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
  fieldValue: {
    fontSize: n(22),
    fontFamily: "PublicSans-Regular",
  },
  divider: {
    height: 1,
    marginHorizontal: n(22),
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
