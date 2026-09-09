import { useGetBattle } from "@/src/api/battle/useGetBattle";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import { BgmAudioAssets } from "@/src/constants/assets/audioAssets";
import {
  BattleGifAssets,
  BattleImageAssets,
} from "@/src/constants/assets/battleAssets";
import useTheme from "@/src/hooks/useTheme";
import { useToast } from "@/src/hooks/useToast";
import {
  connectBattleSocket,
  emitBattleEventWithAck,
  ensureBattleSocketConnected,
  onBattleEvent,
} from "@/src/lib/battleSocket";
import { BattleInfoBar } from "@/src/screens/battleScreen/BattleInfoBar";
import { BattleQuestionCard } from "@/src/screens/battleScreen/BattleQuestionCard";
import { BattleResultScreen } from "@/src/screens/battleScreen/BattleResultScreen";
import { BattleRoomHeader } from "@/src/screens/battleScreen/BattleRoomHeader";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useBattleStore } from "@/src/stores/useBattleStore";
import { useSettingsStore } from "@/src/stores/useSettingsStore";
import useUserStore from "@/src/stores/useUserStore";
import { BattleEndedPayload, BattleStartPayload } from "@/src/types/battle";
import {
  getActiveBgmKey,
  playPageBgm,
  setBgmVolume,
  stopPageBgm,
} from "@/src/utils/bgm";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type BattlePhase = "active" | "waiting" | "ended";
const MAX_BATTLE_SECONDS = 10 * 60;
const BATTLE_BGM_KEY = "battle-room";

export default function BattleRoomRoute() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const battleId = id;
  const isHistoryMode = mode === "history";

  const { accessToken } = useAuthStore();
  const { userId, username } = useUserStore();
  const {
    activeBattle,
    lastBattleResult,
    setActiveBattle,
    setLastBattleResult,
    clearBattleState,
  } = useBattleStore();

  const { data: battleData, isLoading } = useGetBattle(
    userId || "",
    battleId || "",
  );

  const liveBattle = activeBattle?.battleId === battleId ? activeBattle : null;
  const questions = liveBattle?.questions || battleData?.questions || [];

  const [phase, setPhase] = useState<BattlePhase>(
    liveBattle && !isHistoryMode ? "active" : "ended",
  );
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [committedProgress, setCommittedProgress] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(MAX_BATTLE_SECONDS);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [opponentFinished, setOpponentFinished] = useState(false);
  const [presenceNotice, setPresenceNotice] = useState<string>("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitConfirmVisible, setSubmitConfirmVisible] = useState(false);
  const [expandedResultIndex, setExpandedResultIndex] = useState<number | null>(
    null,
  );
  const hasAutoExpiredRef = useRef(false);
  const imageFadeAnim = useRef(new Animated.Value(1)).current;
  const questionFadeAnim = useRef(new Animated.Value(1)).current;
  const prevQuestionIndexRef = useRef(0);

  const endedPayload: BattleEndedPayload | null = useMemo(() => {
    if (lastBattleResult?.battleId === battleId) return lastBattleResult;

    if (!battleData?.participants || !battleData?.questions?.length)
      return null;

    const totalMarks = battleData.questions.length;
    const results = battleData.participants.map((participant) => ({
      userId: participant.userId || "",
      username: participant.username || t("battle.unknownPlayer"),
      timeSpentMs: participant.timeSpentMs ?? null,
      gainedMarks: participant.gainedMarks ?? 0,
      totalMarks,
      isWinner: !!participant.isWinner,
      questionResults: (battleData.questions || []).map((q, idx) => {
        const studentAnswer = participant.studentAnswers?.[idx] ?? "";
        const correctAnswer = q.answer ?? "";
        const isCorrect = !!correctAnswer && studentAnswer === correctAnswer;
        return { isCorrect, correctAnswer };
      }),
    }));

    return { battleId, results };
  }, [battleData, battleId, lastBattleResult, t]);

  const myResult = endedPayload?.results.find(
    (result) => result.userId === userId,
  );
  const myParticipant = battleData?.participants?.find(
    (participant) => participant.userId === userId,
  );
  const mySubmittedAnswers = myParticipant?.studentAnswers ?? answers;
  const hasWinner = !!endedPayload?.results.some((result) => result.isWinner);
  const answeredCount = answers.filter((answer) => !!answer).length;
  const currentQuestion = questions[currentQuestionIndex];
  const isInteractionLocked =
    isHistoryMode || phase !== "active" || hasSubmitted;
  const displayedOpponentProgress = opponentFinished
    ? questions.length
    : Math.min(opponentProgress, questions.length);

  const myUsername = username || t("battle.you");
  const opponentPlayer = liveBattle?.players?.find((p) => p.userId !== userId);
  const opponentParticipant = battleData?.participants?.find(
    (p) => p.userId !== userId,
  );
  const opponentUsername =
    opponentPlayer?.username ||
    opponentParticipant?.username ||
    t("battle.opponent");

  const battleStartIso =
    (liveBattle as { startedAt?: string } | null)?.startedAt ||
    battleData?.metadata?.startedAt ||
    battleData?.metadata?.createdAt ||
    null;

  const initialRemainingSeconds = useMemo(() => {
    if (!battleStartIso) return MAX_BATTLE_SECONDS;

    const startedAtMs = new Date(battleStartIso).getTime();
    if (Number.isNaN(startedAtMs)) return MAX_BATTLE_SECONDS;

    const elapsed = Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000));
    return Math.max(0, MAX_BATTLE_SECONDS - elapsed);
  }, [battleStartIso]);

  const battleMomentumImage = useMemo(() => {
    if (answeredCount === 0 && displayedOpponentProgress === 0) {
      return BattleGifAssets.battleWhenStart;
    }
    if (answeredCount > displayedOpponentProgress)
      return BattleImageAssets.battleWhenA;
    if (answeredCount < displayedOpponentProgress)
      return BattleImageAssets.battleWhenB;
    return BattleGifAssets.battleWhenStart;
  }, [answeredCount, displayedOpponentProgress]);

  const [displayedBattleImage, setDisplayedBattleImage] =
    useState(battleMomentumImage);

  const toggleResultCard = (index: number) => {
    setExpandedResultIndex((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    if (isHistoryMode) return;

    void playPageBgm({
      key: BATTLE_BGM_KEY,
      source: BgmAudioAssets.battleLoop,
      isLooping: true,
      volume: 0,
    });

    return () => {
      // When leaving battle, play home BGM
      if (getActiveBgmKey() === BATTLE_BGM_KEY) {
        void stopPageBgm(BATTLE_BGM_KEY);
      }
      void playPageBgm({
        key: "home",
        source: BgmAudioAssets.home,
        isLooping: true,
        loopDelayMs: 8000,
        volume: 1,
      });
    };
  }, [isHistoryMode]);

  useEffect(() => {
    if (questions.length > 0 && answers.length !== questions.length) {
      setAnswers(Array(questions.length).fill(""));
    }
  }, [answers.length, questions.length]);

  useEffect(() => {
    setCommittedProgress(0);
  }, [battleId]);

  // Vibrate on battle win
  useEffect(() => {
    if (phase !== "ended" || isHistoryMode) return;
    if (myResult?.isWinner && useSettingsStore.getState().vibrationEnabled) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [phase, isHistoryMode, myResult?.isWinner]);

  // Fade in BGM volume when battle starts
  useEffect(() => {
    if (phase !== "active" || isHistoryMode) return;

    let cancelled = false;
    const fadeInTimer = setTimeout(async () => {
      const FADE_IN_DURATION = 2000; // 2 seconds
      const FADE_IN_STEPS = 20;
      const STEP_DURATION = FADE_IN_DURATION / FADE_IN_STEPS;

      for (let i = 1; i <= FADE_IN_STEPS; i++) {
        if (cancelled) return;
        const volume = i / FADE_IN_STEPS;
        await setBgmVolume(volume);
        await new Promise((resolve) => setTimeout(resolve, STEP_DURATION));
      }

      if (!cancelled) await setBgmVolume(1);
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(fadeInTimer);
    };
  }, [phase, isHistoryMode]);

  // Fade out BGM volume when battle ends
  useEffect(() => {
    if (phase !== "ended" || isHistoryMode) return;

    let cancelled = false;
    const fadeOutTimer = setTimeout(async () => {
      const FADE_OUT_DURATION = 2000; // 2 seconds
      const FADE_OUT_STEPS = 20;
      const STEP_DURATION = FADE_OUT_DURATION / FADE_OUT_STEPS;

      for (let i = FADE_OUT_STEPS; i >= 0; i--) {
        if (cancelled) return;
        const volume = i / FADE_OUT_STEPS;
        await setBgmVolume(volume);
        await new Promise((resolve) => setTimeout(resolve, STEP_DURATION));
      }

      // After fade, restore home music
      if (!cancelled && getActiveBgmKey() === BATTLE_BGM_KEY) {
        void stopPageBgm(BATTLE_BGM_KEY);
        void playPageBgm({
          key: "home",
          source: BgmAudioAssets.home,
          isLooping: true,
          loopDelayMs: 8000,
          volume: 1,
        });
      }
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(fadeOutTimer);
    };
  }, [phase, isHistoryMode]);

  useEffect(() => {
    if (phase !== "ended") return;

    Animated.timing(imageFadeAnim, {
      toValue: 0,
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;

      setDisplayedBattleImage(battleMomentumImage);
      Animated.timing(imageFadeAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start();
    });
  }, [battleMomentumImage, displayedBattleImage, imageFadeAnim]);

  useEffect(() => {
    if (isHistoryMode) {
      setPhase("ended");
      return;
    }

    if (lastBattleResult?.battleId === battleId) {
      setPhase("ended");
      return;
    }

    const battleStatus = battleData?.metadata?.status;
    if (battleStatus === "completed") {
      setPhase("ended");
      return;
    }

    if (liveBattle || battleStatus === "active") {
      setPhase((prev) => (prev === "ended" ? "active" : prev));
      setHasSubmitted(false);
    }
  }, [
    battleData?.metadata?.status,
    battleId,
    isHistoryMode,
    lastBattleResult?.battleId,
    liveBattle,
  ]);

  useEffect(() => {
    if (isHistoryMode || phase !== "active") return;

    setRemainingSeconds(initialRemainingSeconds);
    hasAutoExpiredRef.current = false;
  }, [battleId, initialRemainingSeconds, isHistoryMode, phase]);

  useEffect(() => {
    if (phase !== "active" || isHistoryMode) return;

    if (remainingSeconds <= 0) {
      if (hasSubmitted || hasAutoExpiredRef.current) return;

      hasAutoExpiredRef.current = true;
      setHasSubmitted(true);
      setPhase("waiting");

      void (async () => {
        if (!battleId || !accessToken) return;

        const connectAck = await ensureBattleSocketConnected(accessToken);
        if (!connectAck.success) {
          toast.show(connectAck.error || t("battle.submitFailed"), "error");
          return;
        }

        const studentAnswers = questions.map(
          (_, index) => answers[index] ?? "",
        );
        const ack = await emitBattleEventWithAck("battle:finished", {
          battleId,
          studentAnswers,
        });

        if (!ack.success) {
          toast.show(ack.error || t("battle.submitFailed"), "error");
        }
      })();

      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [
    accessToken,
    answers,
    battleId,
    hasSubmitted,
    isHistoryMode,
    phase,
    questions,
    remainingSeconds,
    t,
    toast,
  ]);

  useEffect(() => {
    if (!battleId || !accessToken || isHistoryMode) return;

    connectBattleSocket(accessToken);

    const offOpponentProgress = onBattleEvent(
      "battle:opponent_progress",
      (payload) => {
        if (payload.battleId !== battleId) return;
        setOpponentProgress(payload.questionsCompleted || 0);
      },
    );

    const offOpponentFinished = onBattleEvent(
      "battle:opponent_finished",
      () => {
        setOpponentFinished(true);
        setOpponentProgress(questions.length);
      },
    );

    const offWaiting = onBattleEvent("battle:waiting", (payload) => {
      if (payload.battleId !== battleId) return;
      setPhase("waiting");
    });

    const offEnded = onBattleEvent("battle:ended", (payload) => {
      if (payload.battleId !== battleId) return;
      setLastBattleResult(payload);
      setPhase("ended");
      setHasSubmitted(false);
    });

    const offSync = onBattleEvent("battle:sync", (payload) => {
      if (!("inBattle" in payload) || !payload.inBattle) return;
      if (payload.battleId !== battleId) return;
      // Restore battle state from server on reconnect
      setActiveBattle({
        battleId: payload.battleId,
        players: payload.players,
        questions: payload.questions,
        ...(payload.startedAt ? { startedAt: payload.startedAt } : {}),
      } as BattleStartPayload & { startedAt?: string });
      if (payload.progress?.selectedAnswers) {
        setAnswers(payload.progress.selectedAnswers);
      }
      if (payload.opponentProgress?.questionsCompleted != null) {
        setOpponentProgress(payload.opponentProgress.questionsCompleted);
      }
      if (payload.opponentProgress?.isFinished) {
        setOpponentFinished(true);
      }
      setPhase("active");
    });

    const offDisconnected = onBattleEvent(
      "battle:opponent_disconnected",
      (payload) => {
        if (payload.battleId !== battleId) return;
        setPresenceNotice(
          t("battle.opponentDisconnected", { username: payload.username }),
        );
      },
    );

    const offReconnected = onBattleEvent(
      "battle:opponent_reconnected",
      (payload) => {
        if (payload.battleId !== battleId) return;
        setPresenceNotice(
          t("battle.opponentReconnected", { username: payload.username }),
        );
      },
    );

    return () => {
      offOpponentProgress();
      offOpponentFinished();
      offWaiting();
      offEnded();
      offSync();
      offDisconnected();
      offReconnected();
    };
  }, [
    accessToken,
    battleId,
    isHistoryMode,
    questions.length,
    setActiveBattle,
    setLastBattleResult,
    t,
  ]);

  // Fade animation on question change
  useEffect(() => {
    if (prevQuestionIndexRef.current !== currentQuestionIndex) {
      prevQuestionIndexRef.current = currentQuestionIndex;
      questionFadeAnim.setValue(0);
      Animated.timing(questionFadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [currentQuestionIndex, questionFadeAnim]);

  const handleChooseOption = (option: string) => {
    if (isInteractionLocked) return;

    setAnswers((prev) => {
      const next = [...prev];
      next[currentQuestionIndex] = option;
      return next;
    });
  };

  const handleSendProgress = async (progressCount: number) => {
    if (!battleId || isHistoryMode || !accessToken) return;

    const connectAck = await ensureBattleSocketConnected(accessToken);
    if (!connectAck.success) return;

    await emitBattleEventWithAck("battle:progress", {
      battleId,
      questionsCompleted: progressCount,
    });
  };

  const handleNext = async () => {
    if (isInteractionLocked) return;

    if (currentQuestionIndex < questions.length - 1) {
      const answeredThroughCurrent = answers
        .slice(0, currentQuestionIndex + 1)
        .filter((answer) => !!answer).length;
      const nextCommittedProgress = answers[currentQuestionIndex]
        ? Math.max(committedProgress, answeredThroughCurrent)
        : committedProgress;

      if (nextCommittedProgress !== committedProgress) {
        setCommittedProgress(nextCommittedProgress);
      }

      await handleSendProgress(nextCommittedProgress);
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = async () => {
    if (isInteractionLocked) return;

    if (currentQuestionIndex > 0) {
      const answeredThroughCurrent = answers
        .slice(0, currentQuestionIndex + 1)
        .filter((answer) => !!answer).length;
      const nextCommittedProgress = answers[currentQuestionIndex]
        ? Math.max(committedProgress, answeredThroughCurrent)
        : committedProgress;

      if (nextCommittedProgress !== committedProgress) {
        setCommittedProgress(nextCommittedProgress);
      }

      await handleSendProgress(nextCommittedProgress);
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const doSubmit = async () => {
    if (!battleId || isHistoryMode || !accessToken || hasSubmitted) return;

    const answeredThroughCurrent = answers
      .slice(0, currentQuestionIndex + 1)
      .filter((answer) => !!answer).length;
    const submitCommittedProgress = answers[currentQuestionIndex]
      ? Math.max(committedProgress, answeredThroughCurrent)
      : committedProgress;

    if (submitCommittedProgress !== committedProgress) {
      setCommittedProgress(submitCommittedProgress);
    }

    const connectAck = await ensureBattleSocketConnected(accessToken);
    if (!connectAck.success) {
      toast.show(connectAck.error || t("battle.submitFailed"), "error");
      return;
    }

    const studentAnswers = questions.map((_, index) => answers[index] ?? "");

    const ack = await emitBattleEventWithAck("battle:finished", {
      battleId,
      studentAnswers,
    });

    if (!ack.success) {
      toast.show(ack.error || t("battle.submitFailed"), "error");
      return;
    }

    setHasSubmitted(true);
    setPhase("waiting");
  };

  const handleSubmit = async () => {
    const answeredCount = answers.filter((a) => !!a).length;
    if (answeredCount < questions.length) {
      setSubmitConfirmVisible(true);
      return;
    }
    await doSubmit();
  };

  const handleExit = async () => {
    // Stop battle music and play home music
    if (getActiveBgmKey() === BATTLE_BGM_KEY) {
      await stopPageBgm(BATTLE_BGM_KEY);
    }
    void playPageBgm({
      key: "home",
      source: BgmAudioAssets.home,
      isLooping: true,
      loopDelayMs: 8000,
      volume: 1,
    });

    if (!isHistoryMode && phase !== "ended" && battleId && accessToken) {
      const connectAck = await ensureBattleSocketConnected(accessToken, 3000);
      if (connectAck.success) {
        const exitAnswers = questions.map((_, index) => answers[index] ?? "");
        // Best-effort submission on exit; ignore result
        void emitBattleEventWithAck("battle:finished", {
          battleId,
          studentAnswers: exitAnswers,
        });
      }
    }

    clearBattleState();
    router.replace("/(tabs)" as never);
  };

  if (isLoading && !liveBattle && !endedPayload) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <LoadingSpinner size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <BattleRoomHeader
        battleId={battleId}
        isHistoryMode={isHistoryMode}
        showExitButton={isHistoryMode || phase === "ended"}
        onExit={handleExit}
      />

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
      >
        {presenceNotice ? (
          <View
            className="mb-3 rounded-xl bg-surface px-3 py-2"
            style={{ borderColor: colors.borderColor, borderWidth: 1 }}
          >
            <Text className="font-fredokaMedium text-xs text-secondaryText">
              {presenceNotice}
            </Text>
          </View>
        ) : null}

        {phase !== "ended" ? (
          <>
            <BattleInfoBar
              committedProgress={committedProgress}
              totalQuestions={questions.length}
              remainingSeconds={remainingSeconds}
              displayedOpponentProgress={displayedOpponentProgress}
              myUsername={myUsername}
              opponentUsername={opponentUsername}
              displayedBattleImage={displayedBattleImage}
              imageFadeAnim={imageFadeAnim}
            />

            <BattleQuestionCard
              question={currentQuestion}
              answers={answers}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              isInteractionLocked={isInteractionLocked}
              hasSubmitted={hasSubmitted}
              questionFadeAnim={questionFadeAnim}
              onChooseOption={handleChooseOption}
              onNext={handleNext}
              onPrev={handlePrev}
              onSubmit={handleSubmit}
            />

            {phase === "waiting" && hasSubmitted && (
              <View
                className="mt-3 rounded-xl bg-surface px-3 py-2"
                style={{ borderColor: colors.borderColor, borderWidth: 1 }}
              >
                <Text className="font-fredokaMedium text-sm text-secondaryText">
                  {t("battle.waitingForResult")}
                </Text>
              </View>
            )}
          </>
        ) : (
          <BattleResultScreen
            myResult={myResult}
            endedPayload={endedPayload}
            hasWinner={hasWinner}
            userId={userId}
            questions={questions}
            mySubmittedAnswers={mySubmittedAnswers}
            expandedResultIndex={expandedResultIndex}
            onToggleResultCard={toggleResultCard}
            onExit={handleExit}
          />
        )}
      </ScrollView>

      {/* Submit Confirmation Modal */}
      <Modal
        visible={submitConfirmVisible}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setSubmitConfirmVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/50 px-5"
          onPress={() => setSubmitConfirmVisible(false)}
        >
          <Pressable
            className="w-full rounded-2xl bg-surface p-6"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="mb-2 text-center font-fredokaSemiBold text-lg text-primaryText">
              {t("battle.submitConfirmTitle")}
            </Text>
            <Text className="mb-5 text-left font-fredoka text-sm text-secondaryText">
              {t("battle.submitConfirmMessage", {
                answered: answers.filter((a) => !!a).length,
                total: questions.length,
              })}
            </Text>
            <View className="flex-row justify-end gap-3">
              <Pressable
                className="rounded-xl px-5 py-2.5 active:opacity-70"
                onPress={() => setSubmitConfirmVisible(false)}
              >
                <Text className="font-fredokaMedium text-base text-secondaryText">
                  {t("battle.submitConfirmCancel")}
                </Text>
              </Pressable>
              <Pressable
                className="rounded-xl px-5 py-2.5 active:opacity-70"
                style={{ backgroundColor: colors.primary }}
                onPress={() => {
                  setSubmitConfirmVisible(false);
                  void doSubmit();
                }}
              >
                <Text className="font-fredokaSemiBold text-base text-whiteText">
                  {t("battle.submitConfirmOk")}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
