import type { ReactNode } from "react";
import { Animated, StyleSheet, View } from "react-native";
import {
  scrollIndicatorBaseStyles,
  useScrollIndicator,
} from "@/hooks/useScrollIndicator";

interface ScrollViewWithIndicatorProps {
  children: ReactNode;
  keyboardDismissMode?: "none" | "on-drag" | "interactive";
  keyboardShouldPersistTaps?: "handled" | "always" | "never";
  textColor: string;
}

export function ScrollViewWithIndicator({
  children,
  keyboardDismissMode,
  keyboardShouldPersistTaps,
  textColor,
}: ScrollViewWithIndicatorProps) {
  const {
    handleScroll,
    scrollIndicatorHeight,
    scrollIndicatorPosition,
    setContentHeight,
    setScrollViewHeight,
  } = useScrollIndicator();

  return (
    <View style={styles.wrapper}>
      <Animated.ScrollView
        keyboardDismissMode={keyboardDismissMode}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
        onScroll={handleScroll}
        overScrollMode="never"
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}>
          {children}
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
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, flexDirection: "row", position: "relative" },
  scrollTrack: scrollIndicatorBaseStyles.track,
  scrollThumb: scrollIndicatorBaseStyles.thumb,
});
