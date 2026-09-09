import { BattleImageAssets } from "@/src/constants/assets/battleAssets";
import useTheme from "@/src/hooks/useTheme";
import type { QueueState } from "@/src/screens/battleScreen/battleConstants";
import { useSettingsStore } from "@/src/stores/useSettingsStore";
import { Image as ExpoImage } from "expo-image";
import type { VideoPlayer } from "expo-video";
import { VideoView } from "expo-video";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Pressable, Text, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface BattleMatchingOverlayProps {
  waitSeconds: number;
  formatTimer: (s: number) => string;
  queueState: QueueState;
  opponentName?: string;
  onCancel: () => void;
  onConfirmMatch: () => void;
  player: VideoPlayer;
}

export function BattleMatchingOverlay({
  waitSeconds,
  formatTimer,
  queueState,
  opponentName,
  onCancel,
  onConfirmMatch,
  player,
}: BattleMatchingOverlayProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { bgmEnabled, bgmVolume } = useSettingsStore();

  useEffect(() => {
    // Configure player - loop and play immediately, respecting BGM settings
    if (player) {
      try {
        player.loop = true;
        player.muted = !bgmEnabled;
        player.volume = bgmVolume;
        player.play();
      } catch (e) {
        console.warn("Failed to play video:", e);
      }
    }

    return () => {
      // Cleanup: stop and release player when overlay closes
      try {
        if (player) {
          player.pause();
          player.loop = false;
          player.muted = true;
          player.volume = 0;
        }
      } catch {
        // ignore
      }
    };
  }, [player, bgmEnabled, bgmVolume]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View
        style={{
          borderRadius: 24,
          backgroundColor: "rgba(0,0,0,0.25)",
          borderWidth: 3,
          borderColor: "#000000",
          overflow: "hidden",
          width: SCREEN_WIDTH * 0.82,
          height: SCREEN_WIDTH * 0.82 * 0.65,
        }}
      >
        <VideoView
          player={player}
          nativeControls={false}
          style={{
            width: SCREEN_WIDTH * 0.82,
            height: SCREEN_WIDTH * 0.82,
            marginTop: -(SCREEN_WIDTH * 0.82 * 0.175),
          }}
          contentFit="contain"
        />
      </View>
      <Text
        style={{
          marginTop: 12,
          fontFamily: "Fredoka_600SemiBold",
          fontSize: 14,
          color: colors.whiteText,
        }}
      >
        {" "}
        {queueState === "confirming"
          ? t("battle.loadingQuestions")
          : queueState === "found"
            ? t("battle.matchFound") +
              (opponentName ? `: vs ${opponentName}` : "")
            : t("battle.waitingTimer", { time: formatTimer(waitSeconds) })}
      </Text>
      <View
        style={{
          marginTop: 20,
          width: SCREEN_WIDTH * 0.5,
          height: Math.round((SCREEN_WIDTH * 0.5) / 2.5),
        }}
      >
        {queueState === "confirming" ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Fredoka_600SemiBold",
                fontSize: 14,
                color: colors.whiteText,
              }}
            >
              {t("battle.enteringBattleRoom")}
            </Text>
          </View>
        ) : queueState === "found" ? (
          <Pressable onPress={onConfirmMatch} style={{ flex: 1 }}>
            <ExpoImage
              source={BattleImageAssets.acceptButton}
              style={{ flex: 1, width: "100%", height: "100%" }}
              contentFit="contain"
            />
          </Pressable>
        ) : (
          <Pressable onPress={handleCancel} style={{ flex: 1 }}>
            <ExpoImage
              source={BattleImageAssets.cancelButton}
              style={{ flex: 1, width: "100%", height: "100%" }}
              contentFit="contain"
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}
