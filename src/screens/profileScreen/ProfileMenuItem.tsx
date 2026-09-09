import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface ProfileMenuItemProps {
  icon?: keyof typeof Ionicons.glyphMap;
  svgSource?: React.ComponentType<{ width?: number; height?: number }>;
  label: string;
  onPress?: () => void;
}

export function ProfileMenuItem({
  icon,
  svgSource: SvgSource,
  label,
  onPress,
}: ProfileMenuItemProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row items-center justify-between rounded-2xl bg-surface p-4 active:opacity-70"
    >
      <View className="flex-row items-center gap-3">
        <View
          className="items-center justify-center rounded-lg p-2"
          style={{
            backgroundColor: `${colors.primary}20`,
            width: 36,
            height: 36,
          }}
        >
          {SvgSource ? (
            <SvgSource width={22} height={22} />
          ) : icon ? (
            <Ionicons name={icon} size={20} color={colors.primary} />
          ) : null}
        </View>
        <Text className="text-text font-fredokaMedium">{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
    </Pressable>
  );
}
