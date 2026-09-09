import useTheme from "@/src/hooks/useTheme";
import { ActivityIndicator, View } from "react-native";

type Props = {
  size?: "small" | "large";
  color?: string;
};

export function LoadingSpinner({ size = "large", color }: Props) {
  const { colors } = useTheme();
  const spinnerColor = color || colors.primary;

  return (
    <View className="items-center justify-center py-20">
      <ActivityIndicator size={size} color={spinnerColor} />
    </View>
  );
}
