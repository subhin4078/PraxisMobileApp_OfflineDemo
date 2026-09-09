import { BattleSvgAssets } from "@/src/constants/assets/battleAssets";
import useTheme from "@/src/hooks/useTheme";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

interface BattleLobbyActionRowProps {
  onEventPress: () => void;
  onHistoryPress: () => void;
  onRulesPress: () => void;
  onTopicPress: () => void;
}

export function BattleLobbyActionRow({
  onEventPress,
  onHistoryPress,
  onRulesPress,
  onTopicPress,
}: BattleLobbyActionRowProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 4,
      }}
    >
      {/* Event – golden red */}
      <Pressable
        onPress={onEventPress}
        style={{
          width: 120,
          height: 52,
          borderRadius: 16,
          backgroundColor: "#D44A00",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderWidth: 3,
          borderColor: colors.blackText,
        }}
      >
        <BattleSvgAssets.eventSvg width={28} height={28} />
        <Text
          style={{
            fontFamily: "Fredoka_600SemiBold",
            fontSize: 18,
            color: colors.whiteText,
          }}
        >
          {t("battle.eventButton")}
        </Text>
      </Pressable>

      <View style={{ flex: 1 }} />

      {/* History – golden yellow */}
      <Pressable
        onPress={onHistoryPress}
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          backgroundColor: "#E5A200",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 10,
          borderWidth: 3,
          borderColor: colors.blackText,
        }}
      >
        <BattleSvgAssets.historyRecordSvg width={32} height={32} />
      </Pressable>

      {/* Rules + Topic stacked */}
      <View style={{ alignItems: "center", gap: 8 }}>
        {/* Rules – golden blue */}
        <Pressable
          onPress={onRulesPress}
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: "#2E7D9C",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 3,
            borderColor: colors.blackText,
          }}
        >
          <BattleSvgAssets.rulesSvg width={28} height={28} />
        </Pressable>

        {/* Topic – golden pale green */}
        <Pressable
          onPress={onTopicPress}
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: "#6B8E5A",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 3,
            borderColor: colors.blackText,
          }}
        >
          <BattleSvgAssets.topicSvg width={28} height={28} />
        </Pressable>
      </View>
    </View>
  );
}
