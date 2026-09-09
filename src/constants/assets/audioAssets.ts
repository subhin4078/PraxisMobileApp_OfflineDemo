import battleLoop from "@/assets/audio/bgm/battle_loop.wav";
import home from "@/assets/audio/bgm/home.wav";
import startMatchmaking from "@/assets/audio/sfx/battle/start_matchmaking.wav";
import submitAnswer from "@/assets/audio/sfx/battle/submit_answer.wav";
import button from "@/assets/audio/sfx/common/button.wav";
import tap from "@/assets/audio/sfx/common/tap.wav";
import popSoundError from "@/assets/audio/sfx/toast/pop_sound_error.wav";
import popSoundSuccess from "@/assets/audio/sfx/toast/pop_sound_success.wav";
import popSoundWarning from "@/assets/audio/sfx/toast/pop_sound_warning.wav";

export const BgmAudioAssets = {
  battleLoop,
  home,
};

export const SfxBattleAudioAssets = {
  startMatchmaking,
  submitAnswer,
};

export const SfxCommonAudioAssets = {
  button,
  tap,
};

export const SfxToastAudioAssets = {
  popSoundError,
  popSoundSuccess,
  popSoundWarning,
};
