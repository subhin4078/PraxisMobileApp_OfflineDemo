import { useGetBattles } from "@/src/api/battle/useGetBattles";
import { useGetProgression } from "@/src/api/game/useGetProgression";
import { MathBackground } from "@/src/components/MathBackground";
import { BgmAudioAssets } from "@/src/constants/assets/audioAssets";
import { BattleImageAssets } from "@/src/constants/assets/battleAssets";
import { BattleVideoAssets } from "@/src/constants/assets/battleAssets";
import useTheme from "@/src/hooks/useTheme";
import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import {
  connectBattleSocket,
  emitBattleEventWithAck,
  ensureBattleSocketConnected,
  onBattleEvent,
} from "@/src/lib/battleSocket";
import { BattleLobbyActionRow } from "@/src/screens/battleScreen/BattleLobbyActionRow";
import { BattleLobbyContent } from "@/src/screens/battleScreen/BattleLobbyContent";
import { BattleLobbyHeader } from "@/src/screens/battleScreen/BattleLobbyHeader";
import { BattleLobbyUserInfo } from "@/src/screens/battleScreen/BattleLobbyUserInfo";
import { BattleMatchingOverlay } from "@/src/screens/battleScreen/BattleMatchingOverlay";
import {
  type BattleQueueTopic,
  type QueueState,
  WILDCARD_TOPIC,
  getCatKey,
} from "@/src/screens/battleScreen/battleConstants";
import { BattleEventModal } from "@/src/screens/battleScreen/modals/BattleEventModal";
import { BattleHistoryModal } from "@/src/screens/battleScreen/modals/BattleHistoryModal";
import { BattleRulesModal } from "@/src/screens/battleScreen/modals/BattleRulesModal";
import { BattleTopicModal } from "@/src/screens/battleScreen/modals/BattleTopicModal";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useBattleStore } from "@/src/stores/useBattleStore";
import useUserStore from "@/src/stores/useUserStore";
import { playPageBgm, stopPageBgm } from "@/src/utils/bgm";
import { playBattleStartMatchmakingSfx } from "@/src/utils/sfx";
import { useRouter } from "expo-router";
import { useVideoPlayer } from "expo-video";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Easing, Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BattleLobbyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const { colors } = useTheme();

  const { accessToken } = useAuthStore();
  const { userId, username } = useUserStore();
  const { setActiveBattle, setLastBattleResult } = useBattleStore();

  const { data: progData } = useGetProgression(userId ?? "");
  const level = progData?.progression?.level ?? 1;
  const catKey = getCatKey(level);

  const [battlesEnabled, setBattlesEnabled] = useState(false);
  const { data: battles, refetch: refetchBattles } = useGetBattles(
    userId || "",
    battlesEnabled,
  );

  const [selectedTopics, setSelectedTopics] = useState<BattleQueueTopic[]>([]);
  const [queueState, setQueueState] = useState<QueueState>("idle");
  const [foundBattleId, setFoundBattleId] = useState<string | null>(null);
  const [opponentName, setOpponentName] = useState<string>("");
  const isLeavingQueueRef = useRef(false);

  // Modal visibility
  const [historyVisible, setHistoryVisible] = useState(false);
  const [rulesVisible, setRulesVisible] = useState(false);
  const [eventVisible, setEventVisible] = useState(false);
  const [topicVisible, setTopicVisible] = useState(false);

  // Preload battle video player so it's ready instantly when matching starts
  const battleVideoPlayer = useVideoPlayer(BattleVideoAssets.battleVideo);

  const queueLabel = useMemo(() => {
    if (queueState === "joining") return t("battle.joiningQueue");
    if (queueState === "waiting") return t("battle.waitingForOpponentNoCount");
    if (queueState === "found") return t("battle.matchFound");
    if (queueState === "confirming") return t("battle.confirming");
    return t("battle.readyToQueue");
  }, [queueState, t]);

  const activeBattleId = useMemo(() => {
    const activeBattle = battles?.find((item) => item.status === "active");
    return activeBattle?.battleId || activeBattle?.id || null;
  }, [battles]);

  // ── Socket events ──
  useEffect(() => {
    if (!accessToken) return;

    connectBattleSocket(accessToken);

    const offWaiting = onBattleEvent("matchmaking:waiting", (payload) => {
      let shouldAutoCancelPendingMatch = false;

      setQueueState((prev) => {
        if (prev === "found" || prev === "confirming") {
          shouldAutoCancelPendingMatch = true;
          return "idle";
        }
        return "waiting";
      });

      if (!shouldAutoCancelPendingMatch) return;

      setFoundBattleId(null);
      setOpponentName("");
      toast.show(t("battle.matchCancelled"), "warning");
      void emitBattleEventWithAck("matchmaking:leave");
    });

    const offFound = onBattleEvent("matchmaking:found", (payload) => {
      setFoundBattleId(payload.battleId);
      setOpponentName(payload.opponentUsername);
      setQueueState("found");
    });

    const offCancelled = onBattleEvent("matchmaking:cancelled", (payload) => {
      setFoundBattleId(null);
      setOpponentName("");
      setQueueState("idle");
      toast.show(
        payload.reason === "confirmation_timeout"
          ? t("battle.matchCancelledTimeout")
          : t("battle.matchCancelled"),
        "warning",
      );
    });

    const offStart = onBattleEvent("battle:start", (payload) => {
      setActiveBattle(payload);
      setLastBattleResult(null);
      setQueueState("idle");
      router.push(`/battle/${payload.battleId}` as never);
    });

    return () => {
      offWaiting();
      offFound();
      offCancelled();
      offStart();
    };
  }, [accessToken, router, setActiveBattle, setLastBattleResult, t, toast]);

  // ── Stop home BGM when matching overlay opens; restart when closes ──
  useEffect(() => {
    if (queueState !== "idle") {
      // Matching overlay is open — stop home BGM
      void stopPageBgm("home");
    } else {
      // Matching overlay is closed — play home BGM
      void playPageBgm({
        key: "home",
        source: BgmAudioAssets.home,
        isLooping: true,
        loopDelayMs: 8000,
        volume: 1,
      });
    }
  }, [queueState]);

  // ── Heartbeat ──
  useEffect(() => {
    if (
      !accessToken ||
      queueState !== "waiting" ||
      selectedTopics.length === 0 ||
      isLeavingQueueRef.current
    )
      return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const scheduleNextTick = () => {
      if (cancelled) return;
      timer = setTimeout(() => {
        void runHeartbeat();
      }, 1000);
    };

    const runHeartbeat = async () => {
      try {
        const connectAck = await ensureBattleSocketConnected(accessToken, 3000);
        if (cancelled) return;
        if (connectAck.success) {
          await emitBattleEventWithAck("matchmaking:join", {
            topics: selectedTopics,
          });
        }
      } finally {
        scheduleNextTick();
      }
    };

    scheduleNextTick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [accessToken, queueState, selectedTopics]);

  // ── Topic toggle ──
  const toggleTopic = useCallback((topic: BattleQueueTopic) => {
    const MAX_TOPICS = 3;
    setSelectedTopics((prev) => {
      if (topic === WILDCARD_TOPIC) {
        return prev.includes(WILDCARD_TOPIC) ? [] : [WILDCARD_TOPIC];
      }

      const withoutWildcard = prev.filter((t0) => t0 !== WILDCARD_TOPIC);

      // If topic already selected, deselect it
      if (withoutWildcard.includes(topic)) {
        return withoutWildcard.filter((t0) => t0 !== topic);
      }

      // Enforce max selected topics (silently ignore additional selections)
      if (withoutWildcard.length >= MAX_TOPICS) {
        return prev;
      }

      return [...withoutWildcard, topic];
    });
  }, []);

  // ── Queue actions ──
  const joinQueue = async () => {
    if (!accessToken) {
      toast.show(t("battle.authRequired"), "error");
      return;
    }
    if (activeBattleId) {
      toast.show(t("battle.activeBattleQueueBlocked"), "warning");
      return;
    }

    const queueTopics =
      selectedTopics.length > 0 ? selectedTopics : [WILDCARD_TOPIC];
    playBattleStartMatchmakingSfx();

    setQueueState("joining");
    const connectAck = await ensureBattleSocketConnected(accessToken);
    if (!connectAck.success) {
      setQueueState("idle");
      toast.show(connectAck.error || t("battle.queueJoinFailed"), "error");
      return;
    }

    const ack = await emitBattleEventWithAck("matchmaking:join", {
      topics: queueTopics,
    });
    if (!ack.success) {
      setQueueState("idle");
      toast.show(ack.error || t("battle.queueJoinFailed"), "error");
      return;
    }
    setQueueState((prev) => (prev === "joining" ? "waiting" : prev));
  };

  const leaveQueue = async () => {
    if (!accessToken) {
      toast.show(t("battle.authRequired"), "error");
      return;
    }
    if (queueState !== "waiting") return;

    isLeavingQueueRef.current = true;
    setQueueState("idle");
    setFoundBattleId(null);
    setOpponentName("");

    const connectAck = await ensureBattleSocketConnected(accessToken);
    if (!connectAck.success) {
      isLeavingQueueRef.current = false;
      toast.show(connectAck.error || t("battle.queueLeaveFailed"), "error");
      return;
    }
    const ack = await emitBattleEventWithAck("matchmaking:leave");
    if (!ack.success)
      toast.show(ack.error || t("battle.queueLeaveFailed"), "error");
    isLeavingQueueRef.current = false;
  };

  const confirmMatch = async () => {
    if (!foundBattleId) return;
    if (!accessToken) {
      toast.show(t("battle.authRequired"), "error");
      return;
    }

    setQueueState("confirming");
    const connectAck = await ensureBattleSocketConnected(accessToken);
    if (!connectAck.success) {
      setQueueState("found");
      toast.show(connectAck.error || t("battle.confirmFailed"), "error");
      return;
    }
    const ack = await emitBattleEventWithAck("matchmaking:confirm", {
      battleId: foundBattleId,
    });
    if (!ack.success) {
      setQueueState("found");
      toast.show(ack.error || t("battle.confirmFailed"), "error");
    }
  };

  const quitPreviousBattle = async () => {
    if (!accessToken || !userId || !activeBattleId) {
      toast.show(t("battle.noActiveBattleToQuit"), "warning");
      return;
    }
    const connectAck = await ensureBattleSocketConnected(accessToken);
    if (!connectAck.success) {
      toast.show(connectAck.error || t("battle.quitBattleFailed"), "error");
      return;
    }
    try {
      const battleDetail = (await api.get(
        `/users/${userId}/battles/${activeBattleId}`,
      )) as { questions?: unknown[] };
      const questionCount = Array.isArray(battleDetail?.questions)
        ? battleDetail.questions.length
        : 0;
      if (questionCount <= 0) {
        toast.show(t("battle.quitBattleFailed"), "error");
        return;
      }

      const ack = await emitBattleEventWithAck("battle:finished", {
        battleId: activeBattleId,
        studentAnswers: Array.from({ length: questionCount }, () => ""),
      });
      if (!ack.success) {
        toast.show(ack.error || t("battle.quitBattleFailed"), "error");
        return;
      }

      setFoundBattleId(null);
      setOpponentName("");
      setQueueState("idle");
      toast.show(t("battle.quitBattleSuccess"), "success");
      await refetchBattles();
    } catch {
      toast.show(t("battle.quitBattleFailed"), "error");
    }
  };

  const resumeActiveBattle = () => {
    if (!activeBattleId) return;
    router.push(`/battle/${activeBattleId}` as never);
  };

  // ── Animations ──
  const buttonGlowAnim = useRef(new Animated.Value(0)).current;
  const matchingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonGlowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(buttonGlowAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.delay(2000),
      ]),
    ).start();
  }, [buttonGlowAnim]);

  const isMatching: boolean = queueState !== "idle";
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (isMatching) {
      setShowOverlay(true);
    }
    Animated.timing(matchingAnim, {
      toValue: isMatching ? 1 : 0,
      duration: 280,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !isMatching) {
        setShowOverlay(false);
      }
    });
  }, [isMatching, matchingAnim]);

  const idleOpacity = matchingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const [waitSeconds, setWaitSeconds] = useState(0);
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isMatching) {
      setWaitSeconds(0);
      timer = setInterval(() => setWaitSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isMatching]);

  const formatTimer = (s: number) => {
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm}:${ss.toString().padStart(2, "0")}`;
  };

  // ── Derived data ──
  const completedBattles = useMemo(
    () =>
      (battles ?? [])
        .filter((b) => b.status !== "active" && b.status !== "pending")
        .sort((a, b) => {
          const dateA = new Date(
            a.endedAt || a.metadata?.endedAt || a.createdAt || 0,
          ).getTime();
          const dateB = new Date(
            b.endedAt || b.metadata?.endedAt || b.createdAt || 0,
          ).getTime();
          return dateB - dateA; // Latest first
        }),
    [battles],
  );

  const topicLabel = useMemo(() => {
    if (selectedTopics.length === 0) return t("battle.allTopics");
    if (selectedTopics.includes(WILDCARD_TOPIC)) return t("battle.allTopics");
    return t("battle.topicCount", { count: selectedTopics.length });
  }, [selectedTopics, t]);

  return (
    <View style={{ flex: 1 }}>
      <Image
        source={BattleImageAssets.battleBackground}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
        }}
        resizeMode="cover"
      />
      <MathBackground
        backgroundColor="transparent"
        symbolColor={colors.overlayLight55}
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        {/* Lobby content – fades out when matching */}
        <Animated.View
          style={{ flex: 1, opacity: idleOpacity }}
          pointerEvents={isMatching ? "none" : "auto"}
        >
          <BattleLobbyHeader onBack={() => router.back()} />

          {/* ── User Info ── */}
          <BattleLobbyUserInfo
            catKey={catKey}
            username={username ?? ""}
            level={level}
          />

          {/* ── Button row: Event | History + Rules ── */}
          <BattleLobbyActionRow
            onEventPress={() => setEventVisible(true)}
            onHistoryPress={async () => {
              setBattlesEnabled(true);
              await refetchBattles();
              setHistoryVisible(true);
            }}
            onRulesPress={() => setRulesVisible(true)}
            onTopicPress={() => setTopicVisible(true)}
          />

          <BattleLobbyContent
            queueState={queueState}
            opponentName={opponentName}
            myUsername={username ?? ""}
            queueLabel={queueLabel}
            isMatching={isMatching}
            activeBattleId={activeBattleId}
            idleOpacity={idleOpacity}
            matchingAnim={matchingAnim}
            buttonGlowAnim={buttonGlowAnim}
            onJoinQueue={joinQueue}
            onLeaveQueue={leaveQueue}
            onConfirmMatch={confirmMatch}
            onQuit={quitPreviousBattle}
            onResume={resumeActiveBattle}
          />
        </Animated.View>

        {/* Matching overlay – fades in when matching */}
        {showOverlay && (
          <Animated.View
            style={{
              ...StyleSheet.absoluteFillObject,
              opacity: matchingAnim,
            }}
            pointerEvents={isMatching ? "auto" : "none"}
          >
            <BattleMatchingOverlay
              waitSeconds={waitSeconds}
              formatTimer={formatTimer}
              queueState={queueState}
              opponentName={opponentName}
              onCancel={leaveQueue}
              onConfirmMatch={confirmMatch}
              player={battleVideoPlayer}
            />
          </Animated.View>
        )}
      </SafeAreaView>

      {/* ── Modals ── */}
      <BattleHistoryModal
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        completedBattles={completedBattles}
        userId={userId || ""}
      />
      <BattleRulesModal
        visible={rulesVisible}
        onClose={() => setRulesVisible(false)}
      />
      <BattleEventModal
        visible={eventVisible}
        onClose={() => setEventVisible(false)}
      />
      <BattleTopicModal
        visible={topicVisible}
        onClose={() => setTopicVisible(false)}
        selectedTopics={selectedTopics}
        toggleTopic={toggleTopic}
      />
    </View>
  );
}
