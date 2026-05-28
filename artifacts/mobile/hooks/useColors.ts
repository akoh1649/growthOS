import { useColorScheme } from "react-native";

import colors from "@/constants/colors";

export type ColorPalette = typeof colors.light & { radius: number };

/**
 * Returns the design tokens for the current color scheme plus a `colorOf`
 * helper for dynamic agent-color lookups without unsafe type casts.
 */
export function useColors() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const result: ColorPalette = { ...palette, radius: colors.radius };

  function colorOf(key: string): string {
    return (result as unknown as Record<string, string>)[key] ?? "";
  }

  return { ...result, colorOf };
}
