import type { BattleListItem } from "@/src/api/battle/useGetBattles";
import { BattleSvgAssets } from "@/src/constants/assets/battleAssets";
import { CommonSvgAssets } from "@/src/constants/assets/commonAssets";
import { useModalAnimation } from "@/src/hooks/useModalAnimation";
import useTheme from "@/src/hooks/useTheme";
import { BattleHistoryCard } from "@/src/screens/battleScreen/BattleHistoryCard";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface BattleHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  completedBattles: BattleListItem[];
  userId: string;
}

export function BattleHistoryModal({
  visible,
  onClose,
  completedBattles,
  userId,
}: BattleHistoryModalProps) {
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
            padding: 20,
            width: "100%",
            maxWidth: 360,
            maxHeight: SCREEN_HEIGHT * 0.7,
            borderWidth: 1,
            borderColor: colors.borderColor,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View style={{ marginRight: 10 }}>
              <BattleSvgAssets.historyRecordSvg width={24} height={24} />
            </View>
            <Text
              style={{
                fontFamily: "Fredoka_700Bold",
                fontSize: 20,
                color: colors.primaryText,
                flex: 1,
              }}
            >
              {t("battle.historyTitle")}
            </Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.mutedText} />
            </Pressable>
          </View>

          <Text
            style={{
              fontFamily: "Fredoka_400Regular",
              fontSize: 12,
              color: colors.mutedText,
              marginBottom: 12,
            }}
          >
            {t("battle.historyShowingRecent", { count: 10 })}
          </Text>

          {completedBattles.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 40,
              }}
            >
              <View style={{ opacity: 0.5 }}>
                <CommonSvgAssets.questionSquare width={48} height={48} />
              </View>
              <Text
                style={{
                  fontFamily: "Fredoka_500Medium",
                  fontSize: 16,
                  color: colors.emptyStateDescriptionText,
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                {t("battle.historyEmpty")}
              </Text>
            </View>
          ) : (
            <FlatList
              data={completedBattles.slice(0, 10)}
              keyExtractor={(item) => item.battleId || item.id || "unknown"}
              contentContainerStyle={{ paddingBottom: 8 }}
              style={{ maxHeight: SCREEN_HEIGHT * 0.45 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <BattleHistoryCard
                  battleId={item.battleId || item.id || ""}
                  userId={userId}
                />
              )}
            />
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}
