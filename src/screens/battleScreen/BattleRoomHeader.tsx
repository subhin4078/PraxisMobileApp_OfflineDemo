import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

interface BattleRoomHeaderProps {
  battleId: string | undefined;
  isHistoryMode: boolean;
  showExitButton?: boolean;
  onExit: () => void;
}

export function BattleRoomHeader({
  battleId,
  isHistoryMode,
  showExitButton = true,
  onExit,
}: BattleRoomHeaderProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View className="relative px-5 py-4">
      {showExitButton && (
        <Pressable
          onPress={onExit}
          className="absolute left-5 top-4 z-10 active:opacity-70"
        >
          <Ionicons name="chevron-back" size={22} color={colors.primaryText} />
        </Pressable>
      )}
      <View className="items-center">
        <Text className="font-fredokaSemiBold text-lg text-primaryText">
          {t("battle.roomTitle")}
        </Text>
      </View>
      <View className="absolute right-5 top-4 flex-row items-center gap-2">
        <Text className="font-fredokaSemiBold text-xs text-mutedText">
          #{battleId?.slice(0, 6)}
        </Text>
      </View>
    </View>
  );
}
