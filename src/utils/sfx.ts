import {
  SfxBattleAudioAssets,
  SfxCommonAudioAssets,
  SfxToastAudioAssets,
} from "@/src/constants/assets/audioAssets";
import { useSettingsStore } from "@/src/stores/useSettingsStore";
import { type AudioStatus, createAudioPlayer } from "expo-audio";
import { Pressable } from "react-native";

type ToastSfxType = "success" | "error" | "warning" | "info";

let globalButtonSfxInstalled = false;

export const playSfx = (source: number | string, volume = 1) => {
  try {
    const { sfxEnabled, sfxVolume } = useSettingsStore.getState();
    if (!sfxEnabled) return;

    const player = createAudioPlayer(source);

    try {
      player.volume = volume * sfxVolume;
      player.loop = false;

      // Auto-cleanup when playback finishes via event listener
      const subscription = player.addListener(
        "playbackStatusUpdate",
        (status: AudioStatus) => {
          if (status.didJustFinish) {
            subscription.remove();
            player.release();
          }
        },
      );

      player.play();
    } catch {
      // If playback fails, release the player to avoid resource leak
      try {
        player.release();
      } catch {
        // ignore cleanup errors
      }
      // Don't re-throw; SFX failures should never block user interactions
    }
  } catch {
    // SFX failures should never block user interactions.
  }
};

export const playToastSfx = (type: ToastSfxType) => {
  const source =
    type === "success"
      ? SfxToastAudioAssets.popSoundSuccess
      : type === "error"
        ? SfxToastAudioAssets.popSoundError
        : SfxToastAudioAssets.popSoundWarning;
  void playSfx(source, 0.75);
};

export const playButtonSfx = () => {
  void playSfx(SfxCommonAudioAssets.button, 0.8);
};

export const playTapSfx = () => {
  void playSfx(SfxCommonAudioAssets.tap, 0.7);
};

export const playBattleStartMatchmakingSfx = () => {
  void playSfx(SfxBattleAudioAssets.startMatchmaking, 0.9);
};

export const playBattleSubmitAnswerSfx = () => {
  void playSfx(SfxBattleAudioAssets.submitAnswer, 0.9);
};

// Fishing SFX — uses existing common/toast sounds as proxies until dedicated assets are added
export const playFishingCastSfx = () => {
  void playSfx(SfxCommonAudioAssets.tap, 0.7);
};

type FishRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export const playFishingRevealSfx = (rarity: FishRarity) => {
  switch (rarity) {
    case "COMMON":
      void playSfx(SfxToastAudioAssets.popSoundSuccess, 0.5);
      break;
    case "RARE":
      void playSfx(SfxToastAudioAssets.popSoundSuccess, 0.75);
      break;
    case "EPIC":
      void playSfx(SfxToastAudioAssets.popSoundSuccess, 0.9);
      break;
    case "LEGENDARY":
      void playSfx(SfxToastAudioAssets.popSoundSuccess, 1.0);
      break;
  }
};

export const installGlobalButtonSfx = () => {
  if (globalButtonSfxInstalled) return;
  globalButtonSfxInstalled = true;

  const pressableAny = Pressable as any;
  const previousDefaults = pressableAny.defaultProps ?? {};
  const previousOnPressIn = previousDefaults.onPressIn;

  pressableAny.defaultProps = {
    ...previousDefaults,
    onPressIn: (event: unknown) => {
      playButtonSfx();
      if (typeof previousOnPressIn === "function") {
        previousOnPressIn(event);
      }
    },
  };
};
