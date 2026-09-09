import useTheme from "@/src/hooks/useTheme";
import { playButtonSfx } from "@/src/utils/sfx";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface SettingsButtonItemProps {
  icon:
    | keyof typeof Ionicons.glyphMap
    | keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  variant?: "default" | "danger";
  iconFamily?: "Ionicons" | "MaterialCommunityIcons";
}

export function SettingsButtonItem({
  icon,
  label,
  onPress,
  variant = "default",
  iconFamily = "Ionicons",
}: SettingsButtonItemProps) {
  const { colors } = useTheme();

  const iconColor = variant === "danger" ? colors.error : colors.primary;
  const textColor = variant === "danger" ? "text-error" : "text-text";

  const IconComponent =
    iconFamily === "MaterialCommunityIcons" ? MaterialCommunityIcons : Ionicons;

  const handlePress = () => {
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      className="mb-3 flex-row items-center gap-3 rounded-2xl bg-surface px-5 py-4 active:opacity-70"
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{
          backgroundColor:
            variant === "danger" ? `${colors.error}20` : `${colors.primary}20`,
        }}
      >
        <IconComponent name={icon as any} size={20} color={iconColor} />
      </View>
      <Text className={`${textColor} font-fredokaMedium text-base`}>
        {label}
      </Text>
    </Pressable>
  );
}
