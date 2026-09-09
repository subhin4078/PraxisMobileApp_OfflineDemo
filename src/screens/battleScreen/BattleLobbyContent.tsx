import {
  BattleImageAssets,
  BattleSvgAssets,
} from "@/src/constants/assets/battleAssets";
import Themes from "@/src/constants/theme";
import useTheme from "@/src/hooks/useTheme";
import type { QueueState } from "@/src/screens/battleScreen/battleConstants";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BATTLE_BTN_WIDTH = SCREEN_WIDTH * 0.5;
const BATTLE_BTN_HEIGHT = Math.round(BATTLE_BTN_WIDTH / 2.5);
const BATTLE_ORANGE = Themes.light.battleOrange;

// Auto-detect battle image aspect ratio
const matchImageAsset = Image.resolveAssetSource(BattleImageAssets.matchImage);
const MATCH_IMG_ASPECT = matchImageAsset.height / matchImageAsset.width;
const MATCH_IMG_WIDTH = SCREEN_WIDTH * 0.85;
const MATCH_IMG_HEIGHT = MATCH_IMG_WIDTH * MATCH_IMG_ASPECT;

interface BattleLobbyContentProps {
  queueState: QueueState;
  opponentName: string;
  myUsername: string;
  queueLabel: string;
  isMatching: boolean;
  activeBattleId: string | null;
  idleOpacity: Animated.AnimatedInterpolation<number>;
  matchingAnim: Animated.Value;
  buttonGlowAnim: Animated.Value;
  onJoinQueue: () => void;
  onLeaveQueue: () => void;
  onConfirmMatch: () => void;
  onQuit: () => void;
  onResume: () => void;
}

export function BattleLobbyContent({
  queueState,
  opponentName,
  myUsername,
  queueLabel,
  isMatching,
  activeBattleId,
  idleOpacity,
  matchingAnim,
  buttonGlowAnim,
  onJoinQueue,
  onLeaveQueue,
  onConfirmMatch,
  onQuit,
  onResume,
}: BattleLobbyContentProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: SCREEN_HEIGHT * 0.01,
      }}
    >
      {/* Active battle banner */}
      {!!activeBattleId && (
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 16,
            borderRadius: 16,
            overflow: "hidden",
            borderWidth: 2,
            borderColor: BATTLE_ORANGE,
            width: SCREEN_WIDTH - 40,
          }}
        >
          <LinearGradient
            colors={[BATTLE_ORANGE + "18", colors.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 16 }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: BATTLE_ORANGE + "20",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="flash" size={22} color={BATTLE_ORANGE} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Fredoka_700Bold",
                    fontSize: 14,
                    color: colors.primaryText,
                  }}
                >
                  {t("battle.activeBattleDetected")}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <Pressable
                style={{
                  flex: 1,
                  alignItems: "center",
                  borderRadius: 12,
                  paddingVertical: 10,
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.borderColor,
                }}
                onPress={onQuit}
              >
                <Text
                  style={{
                    fontFamily: "Fredoka_600SemiBold",
                    fontSize: 12,
                    color: colors.primaryText,
                  }}
                >
                  {t("battle.quitPreviousBattle")}
                </Text>
              </Pressable>
              <Pressable
                style={{
                  flex: 1,
                  alignItems: "center",
                  borderRadius: 12,
                  paddingVertical: 10,
                  backgroundColor: BATTLE_ORANGE,
                }}
                onPress={onResume}
              >
                <Text
                  style={{
                    fontFamily: "Fredoka_700Bold",
                    fontSize: 12,
                    color: colors.whiteText,
                  }}
                >
                  {t("battle.resumeActiveBattle")}
                </Text>
              </Pressable>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Center image */}
      <View
        style={{
          borderRadius: 24,
          backgroundColor: "rgba(0,0,0,0.25)",
          borderWidth: 3,
          borderColor: colors.blackText,
          overflow: "hidden",
        }}
      >
        <Image
          source={BattleImageAssets.matchImage}
          style={{
            width: MATCH_IMG_WIDTH,
            height: MATCH_IMG_HEIGHT,
          }}
          resizeMode="cover"
        />
      </View>

      {/* Reward text / queue status */}
      <View
        style={{
          width: SCREEN_WIDTH - 40,
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <Animated.View
          pointerEvents={isMatching ? "auto" : "none"}
          style={{
            opacity: matchingAnim,
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text
            style={{
              fontFamily: "Fredoka_600SemiBold",
              fontSize: 12,
              color: colors.primaryText,
              marginTop: 2,
            }}
          >
            {queueLabel}
          </Text>
          {!!opponentName && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginTop: 4,
                backgroundColor: BATTLE_ORANGE + "15",
                borderRadius: 99,
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderWidth: 1,
                borderColor: BATTLE_ORANGE + "40",
              }}
            >
              <Ionicons name="person" size={11} color={BATTLE_ORANGE} />
              <Text
                style={{
                  fontFamily: "Fredoka_600SemiBold",
                  fontSize: 11,
                  color: colors.primaryText,
                }}
              >
                {opponentName}
              </Text>
            </View>
          )}
        </Animated.View>
      </View>

      {/* Action buttons */}
      {queueState === "found" ? (
        <View style={{ marginTop: 16 }}>
          <Pressable onPress={onConfirmMatch}>
            <LinearGradient
              colors={[
                colors.battleConfirmGreen,
                colors.battleConfirmGreenDark,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 16,
                paddingVertical: 12,
                paddingHorizontal: 28,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={colors.whiteText}
                />
                <Text
                  style={{
                    fontFamily: "Fredoka_700Bold",
                    fontSize: 15,
                    color: colors.whiteText,
                  }}
                >
                  {t("battle.confirmMatch")}
                </Text>
              </View>
              {!!opponentName && (
                <Text
                  style={{
                    fontFamily: "Fredoka_500Medium",
                    fontSize: 11,
                    color: colors.overlayLight80,
                    marginTop: 2,
                  }}
                >
                  {myUsername} vs {opponentName}
                </Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <View
          style={{
            marginTop: 16,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Battle / Cancel crossfade */}
          <View
            style={{
              width: BATTLE_BTN_WIDTH,
              height: BATTLE_BTN_HEIGHT,
            }}
          >
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: idleOpacity,
              }}
            >
              <Pressable
                onPress={onJoinQueue}
                disabled={queueState !== "idle"}
                style={{ flex: 1 }}
              >
                <ExpoImage
                  source={BattleImageAssets.battleButton}
                  style={{ flex: 1, width: "100%", height: "100%" }}
                  contentFit="contain"
                />
              </Pressable>
            </Animated.View>

            <Animated.View
              pointerEvents={isMatching ? "auto" : "none"}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: matchingAnim,
              }}
            >
              <Pressable
                onPress={onLeaveQueue}
                disabled={queueState !== "waiting"}
                style={{ flex: 1 }}
              >
                <ExpoImage
                  source={BattleImageAssets.cancelButton}
                  style={{ flex: 1, width: "100%", height: "100%" }}
                  contentFit="contain"
                />
              </Pressable>
            </Animated.View>
          </View>

          {/* Reward text below battle button */}
          <Animated.View
            pointerEvents={isMatching ? "none" : "auto"}
            style={{
              opacity: idleOpacity,
              alignItems: "center",
              marginTop: 8,
              flexDirection: "row",
              gap: 12,
            }}
          >
            <Text
              style={{
                fontFamily: "Fredoka_700Bold",
                fontSize: 14,
                color: colors.whiteText,
                textShadowColor: colors.textShadowDark,
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
            >
              +50 XP
            </Text>
            <Text
              style={{
                fontFamily: "Fredoka_700Bold",
                fontSize: 14,
                color: colors.whiteText,
                textShadowColor: colors.textShadowDark,
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
            >
              +20 Coins
            </Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}
