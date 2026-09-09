import useTheme from "@/src/hooks/useTheme";
import { playTapSfx } from "@/src/utils/sfx";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Switch, Text, View } from "react-native";

interface SettingsToggleItemProps {
  icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  iconFamily?: "Ionicons" | "MaterialIcons";
}

export function SettingsToggleItem({
  icon,
  label,
  value,
  onValueChange,
  iconFamily = "Ionicons",
}: SettingsToggleItemProps) {
  const { colors } = useTheme();

  const IconComponent =
    iconFamily === "MaterialIcons" ? MaterialIcons : Ionicons;

  const handleToggle = (nextValue: boolean) => {
    playTapSfx();
    onValueChange(nextValue);
  };

  return (
    <View className="mb-3 flex-row items-center justify-between rounded-2xl bg-surface px-5 py-4">
      <View className="flex-row items-center gap-3">
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: `${colors.primary}20` }}
        >
          <IconComponent name={icon as any} size={20} color={colors.primary} />
        </View>
        <Text className="text-text font-fredokaMedium text-base">{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={handleToggle}
        trackColor={{ false: colors.mutedText, true: colors.primary }}
        thumbColor={colors.whiteText}
      />
    </View>
  );
}
