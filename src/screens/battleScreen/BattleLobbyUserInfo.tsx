import { CommonSvgAssets } from "@/src/constants/assets/commonAssets";
import Themes from "@/src/constants/theme";
import useTheme from "@/src/hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

const GOLD_PRIMARY = Themes.light.battleGold;

interface BattleLobbyUserInfoProps {
  catKey: string;
  username: string;
  level: number;
}

export function BattleLobbyUserInfo({
  catKey,
  username,
  level,
}: BattleLobbyUserInfoProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const rankIndex = Math.min(Math.max(Math.floor(level / 10), 0), 8);
  const rankColors = colors.prefixRankColors[rankIndex];

  return (
    <View
      style={{
        paddingHorizontal: 20,
        marginTop: 18,
        marginBottom: 0,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            backgroundColor: colors.overlayDark25,
            borderRadius: 8,
            paddingHorizontal: 20,
            paddingVertical: 8,
          }}
        >
          <Text
            style={{
              fontFamily: "Fredoka_700Bold",
              fontSize: 12,
              color: GOLD_PRIMARY,
            }}
          >
            Lv. {level}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: rankColors.labelBg,
            borderRadius: 8,
            paddingHorizontal: 20,
            paddingVertical: 8,
          }}
        >
          <Text
            style={{
              fontFamily: "Fredoka_600SemiBold",
              fontSize: 12,
              color: rankColors.labelText,
            }}
          >
            {t(`catLevel.${catKey}` as never)}
          </Text>
        </View>
      </View>
      <View>
        <Text
          style={{
            fontFamily: "Fredoka_600SemiBold",
            fontSize: 28,
            color: colors.whiteText,
            flexShrink: 1,
            paddingBottom: 8,
          }}
          numberOfLines={1}
        >
          {username}
        </Text>
        {/* Split dividing line with paw icon in middle */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingVertical: 8,
          }}
        >
          {/* Left line */}
          <LinearGradient
            colors={["transparent", GOLD_PRIMARY]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, height: 2, borderRadius: 1 }}
          />
          {/* Paw icon */}
          <CommonSvgAssets.paw width={24} height={24} />
          {/* Right line */}
          <LinearGradient
            colors={[GOLD_PRIMARY, "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, height: 2, borderRadius: 1 }}
          />
        </View>
      </View>
    </View>
  );
}
