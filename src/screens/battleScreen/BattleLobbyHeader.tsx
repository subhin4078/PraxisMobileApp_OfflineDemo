import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

interface BattleLobbyHeaderProps {
  onBack: () => void;
}

export function BattleLobbyHeader({ onBack }: BattleLobbyHeaderProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 6,
      }}
    >
      <Pressable
        onPress={onBack}
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: colors.overlayLight25,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="chevron-back" size={20} color={colors.whiteText} />
      </Pressable>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          style={{
            fontFamily: "Fredoka_700Bold",
            fontSize: 22,
            color: colors.whiteText,
          }}
        >
          {t("battle.title")}
        </Text>
        <Text
          style={{
            fontFamily: "Fredoka_500Medium",
            fontSize: 12,
            color: colors.overlayLight80,
          }}
        >
          {t("battle.subtitle")}
        </Text>
      </View>
    </View>
  );
}
