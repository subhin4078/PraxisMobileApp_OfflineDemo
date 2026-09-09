import { BattleSvgAssets } from "@/src/constants/assets/battleAssets";
import Themes from "@/src/constants/theme";
import { useModalAnimation } from "@/src/hooks/useModalAnimation";
import useTheme from "@/src/hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Animated, Modal, Pressable, Text, View } from "react-native";

const BATTLE_ORANGE = Themes.light.battleOrange;

interface BattleEventModalProps {
  visible: boolean;
  onClose: () => void;
}

export function BattleEventModal({ visible, onClose }: BattleEventModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { shown, anim } = useModalAnimation(visible);

  const cardScale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  return (
    <Modal
      visible={shown}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: colors.overlayBackground,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          opacity: anim,
        }}
      >
        <Animated.View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 24,
            padding: 24,
            width: "100%",
            maxWidth: 340,
            borderWidth: 2,
            borderColor: colors.battleEventOrange + "40",
            alignItems: "center",
            transform: [{ scale: cardScale }],
          }}
        >
          {/* Event glow header */}
          <LinearGradient
            colors={[
              colors.battleEventGradientStart,
              colors.battleEventGradientEnd,
            ]}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <BattleSvgAssets.celebrationSvg width={48} height={48} />
          </LinearGradient>

          <Text
            style={{
              fontFamily: "Fredoka_700Bold",
              fontSize: 20,
              color: colors.primaryText,
              textAlign: "center",
            }}
          >
            {t("battle.eventTitle")}
          </Text>
          <Text
            style={{
              fontFamily: "Fredoka_500Medium",
              fontSize: 13,
              color: colors.mutedText,
              textAlign: "center",
              marginTop: 6,
              lineHeight: 18,
            }}
          >
            {t("battle.eventDesc")}
          </Text>

          {/* Buff cards */}
          <View style={{ width: "100%", marginTop: 18, gap: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.battleConfirmGreen,
                borderRadius: 14,
                padding: 14,
                borderWidth: 0,
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: colors.overlayLight15,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BattleSvgAssets.buffSvg width={28} height={28} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Fredoka_700Bold",
                    fontSize: 15,
                    color: colors.whiteText,
                  }}
                >
                  {t("battle.eventDoubleXpTitle")}
                </Text>
                <Text
                  style={{
                    fontFamily: "Fredoka_400Regular",
                    fontSize: 11,
                    color: colors.whiteText,
                    opacity: 0.9,
                  }}
                >
                  {t("battle.eventDoubleXpDesc")}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.battleGold,
                borderRadius: 14,
                padding: 14,
                borderWidth: 0,
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: colors.overlayLight15,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BattleSvgAssets.buffSvg width={28} height={28} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Fredoka_700Bold",
                    fontSize: 15,
                    color: colors.whiteText,
                  }}
                >
                  {t("battle.eventDoubleCoinsTitle")}
                </Text>
                <Text
                  style={{
                    fontFamily: "Fredoka_400Regular",
                    fontSize: 11,
                    color: colors.whiteText,
                    opacity: 0.95,
                  }}
                >
                  {t("battle.eventDoubleCoinsDesc")}
                </Text>
              </View>
            </View>
          </View>

          <Pressable onPress={onClose} style={{ width: "100%", marginTop: 20 }}>
            <LinearGradient
              colors={[colors.battleEventOrange, colors.battleEventOrangeDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 14,
                paddingVertical: 13,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Fredoka_700Bold",
                  fontSize: 15,
                  color: colors.whiteText,
                }}
              >
                {t("battle.eventAwesome")}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
