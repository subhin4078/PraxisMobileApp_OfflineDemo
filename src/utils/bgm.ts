import { useSettingsStore } from "@/src/stores/useSettingsStore";
import {
  type AudioPlayer,
  createAudioPlayer,
  setAudioModeAsync,
} from "expo-audio";

type ActiveBgm = {
  key: string;
  player: AudioPlayer;
  loopTimeoutId?: ReturnType<typeof setTimeout>;
};

let activeBgm: ActiveBgm | null = null;
let isMuted = false;
let playRequestId = 0;
let isAudioModeConfigured = false;

const getEffectiveVolume = (requestedVolume: number) => {
  const { bgmEnabled, bgmVolume } = useSettingsStore.getState();
  if (!bgmEnabled) return 0;
  return requestedVolume * bgmVolume;
};

const isEffectivelyMuted = () => {
  const { bgmEnabled } = useSettingsStore.getState();
  return isMuted || !bgmEnabled;
};

const ensureAudioMode = async () => {
  if (isAudioModeConfigured) return;

  await setAudioModeAsync({
    playsInSilentMode: true,
  });
  isAudioModeConfigured = true;
};

const teardownActive = async () => {
  const current = activeBgm;
  activeBgm = null;
  if (!current) return;

  if (current.loopTimeoutId) {
    clearTimeout(current.loopTimeoutId);
  }

  try {
    await current.player.pause();
  } catch {
    // Ignore pause errors during teardown.
  }

  try {
    await current.player.release();
  } catch {
    // Ignore release errors during teardown.
  }
};

export const playPageBgm = async ({
  key,
  source,
  isLooping = true,
  loopDelayMs = 0,
  volume = 1,
}: {
  key: string;
  source: number | string;
  isLooping?: boolean;
  loopDelayMs?: number;
  volume?: number;
}) => {
  const requestId = ++playRequestId;

  await ensureAudioMode();

  if (activeBgm?.key === key) {
    // Same BGM already active — just sync settings, never restart
    try {
      activeBgm.player.muted = isEffectivelyMuted();
      activeBgm.player.loop = isLooping && loopDelayMs === 0;
      activeBgm.player.volume = getEffectiveVolume(volume);
    } catch {
      // ignore
    }
    return;
  }

  await teardownActive();

  const player = createAudioPlayer(source);
  const shouldUseNativeLoop = isLooping && loopDelayMs === 0;

  try {
    player.loop = shouldUseNativeLoop;
    player.muted = isEffectivelyMuted();
    player.volume = getEffectiveVolume(volume);
    await player.play();
  } catch (error) {
    await player.release();
    throw error;
  }

  if (requestId !== playRequestId) {
    // A newer request replaced this one while loading.
    try {
      await player.release();
    } catch {
      // Ignore teardown error.
    }
    return;
  }

  activeBgm = { key, player };

  // Handle looping with delay if loopDelayMs > 0
  if (isLooping && loopDelayMs > 0) {
    const poll = () => {
      const timeoutId = setTimeout(async () => {
        // Stop polling if a different BGM has taken over
        if (activeBgm?.key !== key) return;

        const isPlaying = player.playing;
        if (!isPlaying) {
          // Track ended — wait loopDelayMs then restart
          const restartId = setTimeout(async () => {
            if (activeBgm?.key !== key) return;
            try {
              await player.seekTo(0);
              await player.play();
            } catch {
              // ignore
            }
            poll();
          }, loopDelayMs);
          if (activeBgm?.key === key) {
            activeBgm.loopTimeoutId = restartId;
          }
        } else {
          poll();
        }
      }, 500);

      if (activeBgm?.key === key) {
        activeBgm.loopTimeoutId = timeoutId;
      }
    };

    poll();
  }
};

export const stopPageBgm = async (key?: string) => {
  if (key && activeBgm?.key !== key) return;
  await teardownActive();
};

export const setBgmMuted = async (muted: boolean) => {
  isMuted = muted;
  if (!activeBgm) return;

  try {
    activeBgm.player.muted = isEffectivelyMuted();
  } catch {
    // Ignore mute update errors.
  }
};

export const updateBgmVolume = async () => {
  if (!activeBgm) return;
  try {
    activeBgm.player.volume = getEffectiveVolume(1);
    activeBgm.player.muted = isEffectivelyMuted();
  } catch {
    // Ignore volume update errors.
  }
};

export const getActiveBgmKey = () => activeBgm?.key ?? null;

export const setBgmVolume = async (volume: number) => {
  if (!activeBgm) return;
  try {
    activeBgm.player.volume = getEffectiveVolume(volume);
    activeBgm.player.muted = isEffectivelyMuted();
  } catch {
    // Ignore volume update errors.
  }
};
