import { useInvertColors } from "@/contexts/InvertColorsContext";

export function useThemeColors() {
  const { invertColors } = useInvertColors();
  return {
    bg: invertColors ? "white" : "black",
    textColor: invertColors ? "black" : "white",
  } as const;
}
