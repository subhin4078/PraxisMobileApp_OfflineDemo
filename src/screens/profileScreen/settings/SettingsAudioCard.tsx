import useTheme from "@/src/hooks/useTheme";
import { playTapSfx } from "@/src/utils/sfx";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Switch, Text, View } from "react-native";

interface SettingsAudioCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
}

export function SettingsAudioCard({
  icon,
  label,
  enabled,
  onEnabledChange,
}: SettingsAudioCardProps) {
  const { colors } = useTheme();

  const handleToggle = (nextValue: boolean) => {
    playTapSfx();
    onEnabledChange(nextValue);
  };

  return (
    <View className="mb-3 rounded-2xl bg-surface px-5 py-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${colors.primary}20` }}
          >
            <Ionicons name={icon} size={20} color={colors.primary} />
          </View>
          <Text className="font-fredokaMedium text-base text-primaryText">
            {label}
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          trackColor={{ false: colors.mutedText, true: colors.primary }}
          thumbColor={colors.whiteText}
        />
      </View>
    </View>
  );
}
