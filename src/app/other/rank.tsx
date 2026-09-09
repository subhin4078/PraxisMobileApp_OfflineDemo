import {
  type BattleRankingItem,
  useGetBattleRanking,
} from "@/src/api/ranking/useGetBattleRanking";
import {
  type PracticeRankingItem,
  useGetPracticeRanking,
} from "@/src/api/ranking/useGetPracticeRanking";
import {
  type StreakRankingItem,
  useGetStreakRanking,
} from "@/src/api/ranking/useGetStreakRanking";
import { HomeImageAssets } from "@/src/constants/assets/homeAssets";
import { LeaderboardSvgAssets } from "@/src/constants/assets/leaderboardAssets";
import type { ThemeColors } from "@/src/constants/theme";
import useTheme from "@/src/hooks/useTheme";
import useUserStore from "@/src/stores/useUserStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import type { TFunction } from "i18next";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabKey = "battle" | "practice" | "streak";

function MedalIcon({ rank }: { rank: number }) {
  const { colors } = useTheme();
  if (rank > 3) return null;
  const medalBg =
    rank === 1
      ? colors.rankMedalGold
      : rank === 2
        ? colors.rankMedalSilver
        : colors.rankMedalBronze;
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: medalBg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{ fontSize: 13, fontWeight: "700", color: colors.whiteText }}
      >
        {rank}
      </Text>
    </View>
  );
}

function RankRow({
  rank,
  username,
  stat,
  statLabel,
  isMe,
  colors,
}: {
  rank: number;
  username: string;
  stat: string;
  statLabel: string;
  isMe: boolean;
  colors: ThemeColors;
}) {
  const { t } = useTranslation();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: isMe ? colors.primary + "12" : "transparent",
        borderRadius: isMe ? 14 : 0,
        marginBottom: 2,
      }}
    >
      {/* Rank number or medal */}
      <View style={{ width: 36, alignItems: "center" }}>
        {rank <= 3 ? (
          <MedalIcon rank={rank} />
        ) : (
          <Text
            className="font-fredokaSemiBold text-mutedText"
            style={{ fontSize: 15 }}
          >
            {rank}
          </Text>
        )}
      </View>

      {/* Avatar circle */}
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colors.primary + "20",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: 8,
        }}
      >
        <Text
          className="font-fredokaBold text-primary"
          style={{ fontSize: 14 }}
        >
          {username.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Name */}
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text
          className="font-fredokaSemiBold text-primaryText"
          style={{ fontSize: 14 }}
          numberOfLines={1}
        >
          {username}
          {isMe ? ` ${t("rank.you")}` : ""}
        </Text>
      </View>

      {/* Stat */}
      <View style={{ alignItems: "flex-end" }}>
        <Text
          className="font-fredokaBold text-primary"
          style={{ fontSize: 14 }}
        >
          {stat}
        </Text>
        <Text className="font-fredoka text-mutedText" style={{ fontSize: 10 }}>
          {statLabel}
        </Text>
      </View>
    </View>
  );
}

export default function RankScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { userId } = useUserStore();

  const [activeTab, setActiveTab] = useState<TabKey>("battle");

  const {
    data: battleData,
    isLoading: battleLoading,
    refetch: refetchBattle,
  } = useGetBattleRanking();
  const {
    data: practiceData,
    isLoading: practiceLoading,
    refetch: refetchPractice,
  } = useGetPracticeRanking();
  const {
    data: streakData,
    isLoading: streakLoading,
    refetch: refetchStreak,
  } = useGetStreakRanking();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchBattle(), refetchPractice(), refetchStreak()]);
    setRefreshing(false);
  }, [refetchBattle, refetchPractice, refetchStreak]);

  const isLoading =
    (activeTab === "battle" && battleLoading) ||
    (activeTab === "practice" && practiceLoading) ||
    (activeTab === "streak" && streakLoading);

  const tabs: {
    key: TabKey;
    label: string;
    svgSource: React.ComponentType<{
      width?: number;
      height?: number;
      fill?: string;
    }>;
  }[] = [
    {
      key: "battle",
      label: t("rank.battle"),
      svgSource: LeaderboardSvgAssets.battle,
    },
    {
      key: "practice",
      label: t("rank.practice"),
      svgSource: LeaderboardSvgAssets.practice,
    },
    {
      key: "streak",
      label: t("rank.streak"),
      svgSource: LeaderboardSvgAssets.checkmark,
    },
  ];

  const renderList = () => {
    if (isLoading) {
      return (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 40 }}
        />
      );
    }

    if (activeTab === "battle") {
      const items = battleData?.ranking ?? [];
      if (items.length === 0) return <EmptyState colors={colors} t={t} />;
      return items.map((item: BattleRankingItem, i: number) => (
        <RankRow
          key={item.userId}
          rank={i + 1}
          username={item.username}
          stat={`${Math.round(item.winRate * 100)}%`}
          statLabel={t("rank.winRate")}
          isMe={item.userId === userId}
          colors={colors}
        />
      ));
    }

    if (activeTab === "practice") {
      const items = practiceData?.ranking ?? [];
      if (items.length === 0) return <EmptyState colors={colors} t={t} />;
      return items.map((item: PracticeRankingItem, i: number) => (
        <RankRow
          key={item.userId}
          rank={i + 1}
          username={item.username}
          stat={`${Math.round(item.avgAccuracy * 100)}%`}
          statLabel={t("rank.accuracy")}
          isMe={item.userId === userId}
          colors={colors}
        />
      ));
    }

    // streak
    const items = streakData?.ranking ?? [];
    if (items.length === 0) return <EmptyState colors={colors} t={t} />;
    return items.map((item: StreakRankingItem, i: number) => (
      <RankRow
        key={item.userId}
        rank={i + 1}
        username={item.username}
        stat={`${item.longestStreak}`}
        statLabel={t("rank.days")}
        isMe={item.userId === userId}
        colors={colors}
      />
    ));
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top"]}
    >
      {/* ── Header ── */}
      <View className="relative items-center justify-center px-5 py-4">
        <Pressable
          className="absolute left-5 active:opacity-70"
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primaryText} />
        </Pressable>
        <Text className="font-fredokaSemiBold text-lg text-primaryText">
          {t("rank.title")}
        </Text>
      </View>

      {/* ── Hero Banner (image only) ── */}
      <View
        className="mx-5 mb-4 overflow-hidden rounded-3xl"
        style={{ borderWidth: 1, borderColor: colors.borderColor }}
      >
        <Image
          source={HomeImageAssets.leaderboard}
          style={{ width: "100%", height: 160 }}
          resizeMode="cover"
        />
      </View>

      {/* ── Tab Switcher ── */}
      <View
        className="mx-5 mb-4 flex-row rounded-2xl bg-surface p-1"
        style={{ borderWidth: 1, borderColor: colors.borderColor }}
      >
        {tabs.map((tab) => {
          const SvgIcon = tab.svgSource;
          return (
            <Pressable
              key={tab.key}
              className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5"
              style={
                activeTab === tab.key
                  ? { backgroundColor: colors.primary }
                  : undefined
              }
              onPress={() => setActiveTab(tab.key)}
            >
              <SvgIcon
                width={14}
                height={14}
                fill={
                  activeTab === tab.key ? colors.whiteText : colors.mutedText
                }
              />
              <Text
                className="font-fredokaSemiBold"
                style={{
                  fontSize: 12,
                  color:
                    activeTab === tab.key ? colors.whiteText : colors.mutedText,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Ranking List ── */}
      <ScrollView
        className="mx-5 flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        <View
          className="overflow-hidden rounded-3xl bg-surface"
          style={{ borderWidth: 1, borderColor: colors.borderColor }}
        >
          {/* Column Header */}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderColor,
            }}
          >
            <Text
              className="font-fredokaMedium text-mutedText"
              style={{ fontSize: 11, width: 36, textAlign: "center" }}
            >
              #
            </Text>
            <Text
              className="font-fredokaMedium text-mutedText"
              style={{ fontSize: 11, flex: 1, marginLeft: 44 }}
            >
              {t("rank.player")}
            </Text>
            <Text
              className="font-fredokaMedium text-mutedText"
              style={{ fontSize: 11, textAlign: "right" }}
            >
              {activeTab === "battle"
                ? t("rank.winRate")
                : activeTab === "practice"
                  ? t("rank.accuracy")
                  : t("rank.days")}
            </Text>
          </View>
          {renderList()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyState({ colors, t }: { colors: ThemeColors; t: TFunction }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 40 }}>
      <Ionicons name="trophy-outline" size={48} color={colors.mutedText} />
      <Text className="mt-3 font-fredokaSemiBold text-base text-mutedText">
        {t("rank.noData")}
      </Text>
    </View>
  );
}
