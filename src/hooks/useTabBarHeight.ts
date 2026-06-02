import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";

export function useBottomTabBarHeight() {
  const insets = useSafeAreaInsets();
  // Hauteur standard d'une tab bar + safe area
  return 49 + (Platform.OS === 'ios' ? insets.bottom : 0);
}