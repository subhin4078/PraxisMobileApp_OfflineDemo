import useTheme from "@/src/hooks/useTheme";
import { playToastSfx } from "@/src/utils/sfx";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";

type ToastType = "success" | "error" | "warning" | "info";

type ToastProps = {
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
};

export function Toast({
  message,
  type = "info",
  duration = 3000,
  onDismiss,
}: ToastProps) {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const handleDismiss = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  }, [slideAnim, onDismiss]);

  useEffect(() => {
    playToastSfx(type);

    // Slide in
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [slideAnim, duration, handleDismiss, type]);

  const getToastConfig = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: colors.toastSuccess,
          icon: "checkmark-circle-outline" as keyof typeof Ionicons.glyphMap,
        };
      case "error":
        return {
          backgroundColor: colors.toastError,
          icon: "close-circle-outline" as keyof typeof Ionicons.glyphMap,
        };
      case "warning":
        return {
          backgroundColor: colors.toastWarning,
          icon: "warning-outline" as keyof typeof Ionicons.glyphMap,
        };
      default:
        return {
          backgroundColor: colors.toastInfo,
          icon: "information-circle-outline" as keyof typeof Ionicons.glyphMap,
        };
    }
  };

  const config = getToastConfig();

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 50,
        left: 20,
        right: 20,
        zIndex: 9999,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Pressable onPress={handleDismiss}>
        <View
          className="flex-row items-center rounded-2xl px-4 py-4 shadow-lg"
          style={{
            backgroundColor: config.backgroundColor,
            shadowColor: colors.toastShadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons
            name={config.icon}
            size={24}
            color={colors.whiteText}
            style={{ marginRight: 12 }}
          />
          <Text className="flex-1 font-fredokaSemiBold text-base text-white">
            {message}
          </Text>
          <Pressable onPress={handleDismiss} hitSlop={10}>
            <Ionicons name="close" size={20} color={colors.whiteText} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}
