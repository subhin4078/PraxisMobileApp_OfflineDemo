import pawLoadingLottie from "@/assets/animations/common/paw_loading.json";
import useTheme from "@/src/hooks/useTheme";
import { playButtonSfx } from "@/src/utils/sfx";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { Pressable, Text, View } from "react-native";

type Props = {
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  label: string;
};

export function LoadingButton({ onPress, disabled, isLoading, label }: Props) {
  const { colors } = useTheme();

  const handlePress = () => {
    if (disabled) return;
    onPress();
  };

  return (
    <Pressable
      className="mt-4 overflow-hidden rounded-2xl shadow-sm"
      onPress={handlePress}
      disabled={disabled}
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View className="h-14 flex-row items-center justify-center gap-2">
          {isLoading ? (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.overlayLight18,
                borderWidth: 1,
                borderColor: colors.overlayLight12,
              }}
            >
              <LottieView
                source={pawLoadingLottie}
                style={{ width: 48, height: 48 }}
                autoPlay
                loop
              />
            </View>
          ) : (
            <>
              <Text
                className="font-fredokaBold text-lg text-white"
                numberOfLines={1}
              >
                {label}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={24}
                color={colors.whiteText}
              />
            </>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}
