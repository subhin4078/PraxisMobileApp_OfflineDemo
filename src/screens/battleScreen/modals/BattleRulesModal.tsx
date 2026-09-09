import { BattleSvgAssets } from "@/src/constants/assets/battleAssets";
import Themes from "@/src/constants/theme";
import { useModalAnimation } from "@/src/hooks/useModalAnimation";
import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Animated, Modal, Pressable, Text, View } from "react-native";

const GOLD_PRIMARY = Themes.light.battleGold;
const GOLD_DARK = Themes.light.battleGoldDark;

interface BattleRulesModalProps {
  visible: boolean;
  onClose: () => void;
}

export function BattleRulesModal({ visible, onClose }: BattleRulesModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { shown, anim } = useModalAnimation(visible);

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
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 24,
            padding: 24,
            width: "100%",
            maxWidth: 360,
            borderWidth: 1,
            borderColor: colors.borderColor,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <View style={{ marginRight: 10 }}>
              <BattleSvgAssets.rulesSvg width={28} height={28} />
            </View>
            <Text
              style={{
                fontFamily: "Fredoka_700Bold",
                fontSize: 20,
                color: colors.primaryText,
                flex: 1,
              }}
            >
              {t("battle.rulesTitle")}
            </Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.mutedText} />
            </Pressable>
          </View>

          {(
            [
              {
                titleKey: "battle.rules.section1Title",
                descKey: "battle.rules.section1Desc",
              },
              {
                titleKey: "battle.rules.section2Title",
                descKey: "battle.rules.section2Desc",
              },
              {
                titleKey: "battle.rules.section3Title",
                descKey: "battle.rules.section3Desc",
              },
              {
                titleKey: "battle.rules.section4Title",
                descKey: "battle.rules.section4Desc",
              },
            ] as const
          ).map((rule, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: "row",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  backgroundColor: GOLD_PRIMARY + "15",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Fredoka_700Bold",
                    fontSize: 16,
                    color: GOLD_PRIMARY,
                  }}
                >
                  {idx + 1}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Fredoka_600SemiBold",
                    fontSize: 14,
                    color: colors.primaryText,
                  }}
                >
                  {t(rule.titleKey as never)}
                </Text>
                <Text
                  style={{
                    fontFamily: "Fredoka_400Regular",
                    fontSize: 12,
                    color: colors.mutedText,
                    marginTop: 2,
                  }}
                >
                  {t(rule.descKey as never)}
                </Text>
              </View>
            </View>
          ))}

          <Pressable
            onPress={onClose}
            style={{
              marginTop: 8,
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <LinearGradient
              colors={[GOLD_PRIMARY, GOLD_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: "center",
                width: "100%",
              }}
            >
              <Text
                style={{
                  fontFamily: "Fredoka_700Bold",
                  fontSize: 15,
                  color: colors.whiteText,
                }}
              >
                {t("battle.rulesGotIt")}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}
