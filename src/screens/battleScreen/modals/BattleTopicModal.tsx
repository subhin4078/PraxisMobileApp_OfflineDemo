import { BattleSvgAssets } from "@/src/constants/assets/battleAssets";
import Themes from "@/src/constants/theme";
import { useModalAnimation } from "@/src/hooks/useModalAnimation";
import useTheme from "@/src/hooks/useTheme";
import {
  BATTLE_ALLOWED_TOPICS,
  type BattleQueueTopic,
  WILDCARD_TOPIC,
} from "@/src/screens/battleScreen/battleConstants";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Animated, Modal, Pressable, Text, View } from "react-native";

const GOLD_PRIMARY = Themes.light.battleGold;
const GOLD_DARK = Themes.light.battleGoldDark;
const MAX_TOPICS = 3;

interface BattleTopicModalProps {
  visible: boolean;
  onClose: () => void;
  selectedTopics: BattleQueueTopic[];
  toggleTopic: (topic: BattleQueueTopic) => void;
}

export function BattleTopicModal({
  visible,
  onClose,
  selectedTopics,
  toggleTopic,
}: BattleTopicModalProps) {
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
            maxWidth: 360,
            borderWidth: 1,
            borderColor: colors.borderColor,
            transform: [{ scale: cardScale }],
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <View style={{ marginRight: 10 }}>
              <BattleSvgAssets.topicSvg width={24} height={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Fredoka_700Bold",
                  fontSize: 20,
                  color: colors.primaryText,
                }}
              >
                {t("battle.topicSelectTitle")}
              </Text>
              <Text
                style={{
                  fontFamily: "Fredoka_400Regular",
                  fontSize: 12,
                  color: colors.mutedText,
                  marginTop: 2,
                }}
              >
                {selectedTopics.includes(WILDCARD_TOPIC)
                  ? t("battle.topicAllSelected")
                  : t("battle.topicSelectedCount", {
                      count: selectedTopics.length,
                      max: MAX_TOPICS,
                    })}
              </Text>
            </View>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.mutedText} />
            </Pressable>
          </View>

          <Text
            style={{
              fontFamily: "Fredoka_400Regular",
              fontSize: 13,
              color: colors.mutedText,
              marginBottom: 16,
            }}
          >
            {t("battle.topicHint")}
          </Text>

          {/* All Topics wildcard */}
          {(() => {
            const wildcardSelected = selectedTopics.includes(WILDCARD_TOPIC);
            return (
              <>
                <Pressable
                  onPress={() => toggleTopic(WILDCARD_TOPIC)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    marginBottom: 10,
                    backgroundColor: wildcardSelected
                      ? GOLD_PRIMARY
                      : colors.buffCoinBg,
                    borderWidth: 1.5,
                    borderColor: wildcardSelected
                      ? GOLD_PRIMARY
                      : colors.borderColor,
                  }}
                >
                  <Ionicons
                    name="infinite"
                    size={18}
                    color={
                      wildcardSelected ? colors.whiteText : colors.primaryText
                    }
                  />
                  <Text
                    style={{
                      fontFamily: "Fredoka_600SemiBold",
                      fontSize: 14,
                      color: wildcardSelected
                        ? colors.whiteText
                        : colors.primaryText,
                      flex: 1,
                    }}
                  >
                    {t("battle.allTopics")}
                  </Text>
                  {wildcardSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.whiteText}
                    />
                  )}
                </Pressable>

                <View
                  style={{
                    height: 1,
                    backgroundColor: colors.borderColor,
                    marginVertical: 6,
                  }}
                />

                <View style={{ flexDirection: "column", gap: 8, marginTop: 8 }}>
                  {BATTLE_ALLOWED_TOPICS.map((topic) => {
                    const selected = selectedTopics.includes(topic);
                    const isDisabled =
                      !selected && selectedTopics.length >= MAX_TOPICS;
                    return (
                      <Pressable
                        key={topic}
                        onPress={() => toggleTopic(topic)}
                        disabled={isDisabled}
                        style={{
                          width: "100%",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          borderRadius: 14,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          marginBottom: 8,
                          backgroundColor: selected
                            ? GOLD_PRIMARY
                            : colors.buffCoinBg,
                          borderWidth: 1.5,
                          borderColor: selected
                            ? GOLD_PRIMARY
                            : colors.borderColor,
                          opacity: isDisabled ? 0.5 : 1,
                        }}
                      >
                        <View
                          style={{
                            width: 18,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {selected && (
                            <Ionicons
                              name="checkmark-circle"
                              size={14}
                              color={colors.whiteText}
                            />
                          )}
                        </View>
                        <Text
                          style={{
                            fontFamily: "Fredoka_500Medium",
                            fontSize: 13,
                            color: selected
                              ? colors.whiteText
                              : colors.primaryText,
                          }}
                        >
                          {t(`mathTopics.${topic}`)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            );
          })()}

          <Pressable onPress={onClose} style={{ marginTop: 22 }}>
            <LinearGradient
              colors={[GOLD_PRIMARY, GOLD_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 16,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Fredoka_700Bold",
                  fontSize: 16,
                  color: colors.whiteText,
                }}
              >
                {t("battle.topicConfirm")}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
