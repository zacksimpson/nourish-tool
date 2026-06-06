import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { TextInput as RNTextInput, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { ScrollViewWithIndicator } from "@/components/ScrollViewWithIndicator";
import { StyledText } from "@/components/StyledText";
import { SwipeBackContainer } from "@/components/SwipeBackContainer";
import { useThemeColors } from "@/hooks/useThemeColors";
import { goBack } from "@/utils/navigation";
import { n } from "@/utils/scaling";
import { foodDetailUrl } from "@/utils/usdaApi";

const NUTRIENTS = [
  { id: 1008, label: "Calories", unit: "kcal" },
  { id: 1003, label: "Protein", unit: "g" },
  { id: 1005, label: "Carbs", unit: "g" },
  { id: 1004, label: "Fat", unit: "g" },
  { id: 1079, label: "Fiber", unit: "g" },
  { id: 1235, label: "Added Sugar", unit: "g" },
  { id: 1093, label: "Sodium", unit: "mg" },
  { id: 1051, label: "Water", unit: "g" },
  { id: 1057, label: "Caffeine", unit: "mg" },
] as const;

interface FoodNutrient {
  amount: number;
  nutrient: { id: number };
}

interface FoodPortion {
  amount: number;
  gramWeight: number;
  measureUnit?: { abbreviation: string; name: string };
  portionDescription?: string;
}

interface FoodDetail {
  foodNutrients: FoodNutrient[];
  foodPortions?: FoodPortion[];
  householdServingFullText?: string;
  servingSize?: number;
  servingSizeUnit?: string;
}

type Status = "loading" | "success" | "error";

function resolveServing(data: FoodDetail): { scale: number; label: string } {
  if (data.servingSize && data.servingSize > 0) {
    const label = data.householdServingFullText
      ? data.householdServingFullText.toLowerCase()
      : `serving (${Math.round(data.servingSize)}${data.servingSizeUnit ?? "g"})`;
    return { label, scale: data.servingSize / 100 };
  }

  const portion = data.foodPortions?.[0];
  if (portion && portion.gramWeight > 0) {
    let label: string;
    if (portion.portionDescription) {
      label = portion.portionDescription.toLowerCase();
    } else {
      const unitName = portion.measureUnit?.name?.toLowerCase();
      const hasUnit =
        unitName && unitName !== "undetermined" && unitName !== "racc";
      label = hasUnit
        ? `${portion.amount} ${portion.measureUnit?.abbreviation ?? portion.measureUnit?.name}`
        : `serving (${Math.round(portion.gramWeight)}g)`;
    }
    return { label, scale: portion.gramWeight / 100 };
  }

  return { label: "100g", scale: 1 };
}

export default function FoodDetailScreen() {
  const { bg, textColor } = useThemeColors();

  const { id, name, category } = useLocalSearchParams<{
    id: string;
    name: string;
    category: string;
  }>();

  const [status, setStatus] = useState<Status>("loading");
  const [nutrients, setNutrients] = useState<FoodNutrient[]>([]);
  const [servingScale, setServingScale] = useState<number>(1);
  const [servingLabel, setServingLabel] = useState<string>("100g");
  const [servingsText, setServingsText] = useState<string>("1");

  const parsed = Number.parseFloat(servingsText);
  const servings = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  useEffect(() => {
    setServingsText("1");

    if (!id) {
      setStatus("error");
      return;
    }

    const url = foodDetailUrl(id);

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Not found");
        }
        return res.json() as Promise<FoodDetail>;
      })
      .then((data) => {
        setNutrients(data.foodNutrients ?? []);
        const { scale, label } = resolveServing(data);
        setServingScale(scale);
        setServingLabel(label);
        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
      });
  }, [id]);

  const getNutrientAmount = (nutrientId: number): number | null => {
    const match = nutrients.find((n) => n.nutrient?.id === nutrientId);
    return match ? match.amount : null;
  };

  const renderBody = () => {
    if (status === "loading") {
      return (
        <View style={styles.stateContainer}>
          <StyledText style={[styles.stateText, { color: textColor }]}>
            loading...
          </StyledText>
        </View>
      );
    }

    if (status === "error") {
      return (
        <View style={styles.stateContainer}>
          <StyledText style={[styles.stateText, { color: textColor }]}>
            something went wrong
          </StyledText>
        </View>
      );
    }

    return (
      <ScrollViewWithIndicator textColor={textColor}>
        <View style={styles.content}>
          <View style={styles.titleBlock}>
            <StyledText style={[styles.titleName, { color: textColor }]}>
              {name}
            </StyledText>
            {category && (
              <StyledText style={[styles.titleCategory, { color: textColor }]}>
                {category}
              </StyledText>
            )}
          </View>
          <View style={styles.servingRow}>
            <StyledText style={[styles.perLabel, { color: textColor }]}>
              per {servingLabel}
            </StyledText>
            <View style={styles.servingInputGroup}>
              <RNTextInput
                allowFontScaling={false}
                blurOnSubmit
                cursorColor={textColor}
                keyboardType="decimal-pad"
                onChangeText={setServingsText}
                returnKeyType="done"
                selectionColor={textColor}
                style={[styles.servingInput, { color: textColor }]}
                value={servingsText}
              />
              <StyledText style={[styles.servingUnit, { color: textColor }]}>
                {servings === 1 ? "serving" : "servings"}
              </StyledText>
            </View>
          </View>
          {NUTRIENTS.map((nutrient) => {
            const amount = getNutrientAmount(nutrient.id);
            if (amount === null) {
              return null;
            }
            const display = `${Math.round(amount * servingScale * servings)} ${nutrient.unit}`;
            return (
              <StyledText
                key={nutrient.id}
                style={[styles.nutrientLine, { color: textColor }]}
              >
                {nutrient.label} – {display}
              </StyledText>
            );
          })}
        </View>
      </ScrollViewWithIndicator>
    );
  };

  return (
    <SwipeBackContainer enabled onSwipeBack={goBack}>
      <SafeAreaView
        edges={["top"]}
        style={[styles.container, { backgroundColor: bg }]}
      >
        <Header />
        {renderBody()}
      </SafeAreaView>
    </SwipeBackContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stateContainer: {
    paddingLeft: n(22),
    paddingRight: n(32),
    paddingTop: n(32),
  },
  stateText: {
    fontSize: n(22),
  },
  content: {
    paddingLeft: n(22),
    paddingRight: n(32),
    paddingTop: n(24),
    paddingBottom: n(40),
    gap: n(16),
  },
  titleBlock: {
    gap: n(2),
  },
  titleName: {
    fontSize: n(28),
  },
  titleCategory: {
    fontSize: n(18),
  },
  servingRow: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: n(4),
  },
  perLabel: {
    fontSize: n(13),
    letterSpacing: n(1.5),
    textTransform: "uppercase",
  },
  servingInputGroup: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: n(6),
  },
  servingInput: {
    fontFamily: "PublicSans-Regular",
    fontSize: n(22),
    minWidth: n(32),
    textAlign: "right",
  },
  servingUnit: {
    fontSize: n(13),
  },
  nutrientLine: {
    fontSize: n(22),
  },
});
