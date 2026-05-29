import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticPressable } from "@/components/HapticPressable";
import { Header } from "@/components/Header";
import { ScrollViewWithIndicator } from "@/components/ScrollViewWithIndicator";
import { StyledText } from "@/components/StyledText";
import { SwipeBackContainer } from "@/components/SwipeBackContainer";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { commitResult } from "@/utils/contextPickerStore";
import { n } from "@/utils/scaling";
import { ALL_TAGS, type TagId } from "@/utils/tags";

export default function ContextPickerScreen() {
  const { invertColors } = useInvertColors();
  const bg = invertColors ? "white" : "black";
  const textColor = invertColors ? "black" : "white";

  const { initialTags } = useLocalSearchParams<{ initialTags?: string }>();
  const [selectedTags, setSelectedTags] = useState<Set<TagId>>(() => {
    const tags = initialTags ? initialTags.split(",").filter(Boolean) : [];
    return new Set(tags as TagId[]);
  });

  const toggleTag = (id: TagId) => {
    const next = new Set(selectedTags);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedTags(next);
    commitResult(Array.from(next));
  };

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, []);

  return (
    <SwipeBackContainer enabled onSwipeBack={handleBack}>
      <SafeAreaView
        edges={["top"]}
        style={[styles.container, { backgroundColor: bg }]}
      >
        <Header headerTitle="context tags" />

        <ScrollViewWithIndicator textColor={textColor}>
          <View style={styles.tagList}>
            {ALL_TAGS.map((tag) => (
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
          <View style={styles.bottomPad} />
        </ScrollViewWithIndicator>
      </SafeAreaView>
    </SwipeBackContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tagList: {
    paddingHorizontal: n(22),
    paddingTop: n(4),
  },
  tagRow: {
    paddingVertical: n(10),
  },
  tagText: {
    fontSize: n(22),
    fontFamily: "PublicSans-Regular",
  },
  tagSelected: {
    textDecorationLine: "underline",
  },
  bottomPad: {
    height: n(40),
  },
});
