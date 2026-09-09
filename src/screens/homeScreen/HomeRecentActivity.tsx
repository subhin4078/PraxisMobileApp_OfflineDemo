import { useGetBattles } from "@/src/api/battle/useGetBattles";
import { useGetChatrooms } from "@/src/api/chat/useGetChatrooms";
import { useGetTransactions } from "@/src/api/game/useGetTransactions";
import { useGetPractices } from "@/src/api/practice/useGetPractices";
import { useGetStatistics } from "@/src/api/user/useGetStatistics";
import { HomeSvgAssets } from "@/src/constants/assets/homeAssets";
import useTheme from "@/src/hooks/useTheme";
import useUserStore from "@/src/stores/useUserStore";
import { shouldNavigate } from "@/src/utils";
import { formatRelativeDate } from "@/src/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

interface Activity {
  id: string;
  title: string;
  type: "Completed" | "In Progress" | "Battle Result" | "Chat" | "Purchase";
  typeLabel: string;
  time: string;
  score: number | null;
  completed: boolean;
  battleResult?: "win" | "loss" | "draw";
  timestamp: number;
}

interface HomeRecentActivityProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function HomeRecentActivity({
  onRefresh,
  isRefreshing = false,
}: HomeRecentActivityProps) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { userId } = useUserStore();
  const router = useRouter();

  const { data: practices = [] } = useGetPractices(userId || "");
  const { data: battles = [] } = useGetBattles(userId || "");
  const { data: chatrooms = [] } = useGetChatrooms(userId || "");
  const { data: statistics } = useGetStatistics(userId || "");
  const { data: transactionsData } = useGetTransactions(userId || "", {
    limit: 10,
  });

  const activities = useMemo(() => {
    const practiceActivities: Activity[] = practices.map((practice) => {
      const createdAt = new Date(practice.createdAt).getTime();
      const firstTopic = practice.topics[0]
        ? t(`mathTopics.${practice.topics[0]}`)
        : t("home.dailyChallenge");

      return {
        id: `practice-${practice.practiceId}`,
        title: firstTopic,
        type: practice.completed ? "Completed" : "In Progress",
        typeLabel: practice.completed
          ? t("home.activityCompleted")
          : t("home.activityInProgress"),
        time: formatRelativeDate(practice.createdAt, i18n.language, t),
        score: null,
        completed: practice.completed,
        timestamp: createdAt,
      };
    });

    const battleActivities: Activity[] = battles.map((battle) => {
      const timestampSource =
        battle.endedAt ||
        battle.startedAt ||
        battle.createdAt ||
        new Date().toISOString();
      const timestamp = new Date(timestampSource).getTime();
      const battleResult: "win" | "loss" | "draw" =
        typeof battle.isWinner === "boolean"
          ? battle.isWinner
            ? "win"
            : "loss"
          : !battle.winner
            ? "draw"
            : battle.winner === userId
              ? "win"
              : "loss";

      return {
        id: `battle-${battle.battleId || battle.id || timestamp}`,
        title: t("battle.title"),
        type: "Battle Result",
        typeLabel: t("home.activityBattleResult"),
        time: formatRelativeDate(timestampSource, i18n.language, t),
        score: null,
        completed: true,
        battleResult,
        timestamp,
      };
    });

    const chatActivities: Activity[] = chatrooms.map((chatroom) => ({
      id: `chat-${chatroom.chatId}`,
      title: chatroom.title,
      type: "Chat",
      typeLabel: t("home.activityChat"),
      time: formatRelativeDate(chatroom.updatedAt, i18n.language, t),
      score: null,
      completed: true,
      timestamp: new Date(chatroom.updatedAt).getTime(),
    }));

    const dailyActivities: Activity[] = (statistics?.activityLogs || [])
      .filter((log) => {
        const completedQuestions = log.activity.completedQuestions || 0;
        const participatedBattles = log.activity.participatedBattles || 0;
        const chatAsked = log.activity.chatAsked || 0;
        return (
          completedQuestions > 0 || participatedBattles > 0 || chatAsked > 0
        );
      })
      .map((log) => ({
        id: `daily-${log.date}`,
        title: t("home.dailyChallenge"),
        type: "Completed",
        typeLabel: t("home.activityCompleted"),
        time: formatRelativeDate(log.date, i18n.language, t),
        score: null,
        completed: true,
        timestamp: new Date(log.date).getTime(),
      }));

    const purchaseActivities: Activity[] = (
      transactionsData?.transactions ?? []
    )
      .filter((tx) => tx.data.type === "purchase")
      .map((tx) => ({
        id: `purchase-${tx.id}`,
        title: `${t("home.shopPurchased")} (${tx.data.coinsInvolved} ${t("home.coins")})`,
        type: "Purchase" as const,
        typeLabel: t("home.activityPurchase"),
        time: formatRelativeDate(tx.data.createdAt, i18n.language, t),
        score: null,
        completed: true,
        timestamp: new Date(tx.data.createdAt).getTime(),
      }));

    return [
      ...practiceActivities,
      ...battleActivities,
      ...chatActivities,
      ...dailyActivities,
      ...purchaseActivities,
    ]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }, [
    practices,
    battles,
    chatrooms,
    statistics,
    transactionsData,
    userId,
    t,
    i18n.language,
  ]);

  return (
    <View className="mb-6">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="font-fredokaSemiBold text-lg text-primaryText">
          {t("home.recentActivity")}
        </Text>
        <Pressable
          className="h-8 w-8 items-center justify-center rounded-lg bg-surface active:opacity-70"
          style={{ opacity: isRefreshing ? 0.6 : 1 }}
          onPress={onRefresh}
          disabled={isRefreshing}
        >
          <Ionicons name="refresh" size={16} color={colors.primaryText} />
        </Pressable>
      </View>

      <View className="gap-3">
        {activities.map((activity) => (
          <Pressable
            key={activity.id}
            className="flex-row items-center justify-between rounded-2xl bg-surface p-4 active:opacity-70"
            accessibilityLabel={`${activity.title}, ${activity.typeLabel}`}
            onPress={() => {
              if (!shouldNavigate()) return;
              const parts = activity.id.split("-").slice(1);
              const targetId = parts.join("-");

              if (activity.id.startsWith("practice-")) {
                router.push(
                  activity.completed
                    ? {
                        pathname: "/practice/[id]",
                        params: { id: targetId, mode: "history" },
                      }
                    : {
                        pathname: "/practice/[id]",
                        params: { id: targetId },
                      },
                );
                return;
              }

              if (activity.id.startsWith("battle-")) {
                router.push({
                  pathname: "/battle/[id]",
                  params: { id: targetId, mode: "history" },
                });
                return;
              }

              if (activity.id.startsWith("chat-")) {
                router.push({
                  pathname: "/chat/[id]",
                  params: { id: targetId },
                });
                return;
              }

              if (activity.id.startsWith("daily-")) {
                router.push({
                  pathname: "/daily-exercise/[id]",
                  params: { id: targetId, mode: "history" },
                });
                return;
              }

              if (activity.type === "Purchase") {
                router.push("/other/shop" as never);
                return;
              }
            }}
          >
            <View className="flex-1 flex-row items-center gap-3">
              <View
                className="h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  backgroundColor:
                    activity.type === "Battle Result"
                      ? activity.battleResult === "win"
                        ? `${colors.primary}15`
                        : `${colors.activityBattleLostColor}15`
                      : activity.type === "Chat"
                        ? `${colors.activityChatColor}15`
                        : activity.type === "Purchase"
                          ? `${colors.activityPurchaseColor}15`
                          : activity.completed
                            ? `${colors.primary}15`
                            : `${colors.mutedText}15`,
                }}
              >
                {(() => {
                  const svgAssets: Record<
                    string,
                    React.ComponentType<{ width?: number; height?: number }>
                  > = {
                    Chat: HomeSvgAssets.chat,
                    Completed: HomeSvgAssets.pencil,
                    "In Progress": HomeSvgAssets.pencil,
                    "Battle Result": HomeSvgAssets.battle,
                    Purchase: HomeSvgAssets.shop,
                  };
                  // Use target.svg for daily activity entries (ids like 'daily-YYYY-MM-DD')
                  let SvgIcon = svgAssets[activity.type];
                  if (activity.id && activity.id.startsWith("daily-")) {
                    SvgIcon = HomeSvgAssets.target;
                  }
                  if (SvgIcon) {
                    return <SvgIcon width={22} height={22} />;
                  }
                  return (
                    <Ionicons
                      name="time-outline"
                      size={22}
                      color={colors.mutedText}
                    />
                  );
                })()}
              </View>

              <View className="flex-1">
                <Text
                  className="mb-1 font-fredokaSemiBold text-sm text-primaryText"
                  numberOfLines={1}
                >
                  {activity.title}
                </Text>
                <Text className="font-fredokaMedium text-xs text-mutedText">
                  {activity.time}
                </Text>
              </View>
            </View>

            {activity.score && (
              <View
                className="ml-2 rounded-lg px-3 py-1.5"
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <Text className="font-fredokaBold text-sm text-primary">
                  {activity.score}%
                </Text>
              </View>
            )}

            {activity.type === "Battle Result" &&
              activity.battleResult === "win" && (
                <View
                  className="ml-2 rounded-lg px-3 py-1.5"
                  style={{ backgroundColor: `${colors.primary}15` }}
                >
                  <HomeSvgAssets.paw width={24} height={24} />
                </View>
              )}
          </Pressable>
        ))}

        {activities.length === 0 && (
          <View className="rounded-2xl bg-surface p-4">
            <Text className="font-fredokaMedium text-sm text-mutedText">
              {t("statistics.noDataYet")}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
