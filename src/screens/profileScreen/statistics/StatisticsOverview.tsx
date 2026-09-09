import { StatisticsSvgAssets } from "@/src/constants/assets/statisticsAssets";
import useTheme from "@/src/hooks/useTheme";
import { StatisticsData } from "@/src/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Easing, Text, View } from "react-native";

interface StatisticsOverviewProps {
  overview: StatisticsData["overview"];
}

function AnimatedStatCard({
  SvgIcon,
  label,
  value,
  index,
}: {
  SvgIcon: React.ComponentType<{ width?: number; height?: number }>;
  label: string;
  value: string;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const { colors } = useTheme();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 120,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 120,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      className="min-w-[45%] flex-1 overflow-hidden rounded-2xl bg-surface p-4"
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        borderWidth: 1,
        borderColor: colors.borderColor,
      }}
    >
      <View className="mb-2 flex-row items-center justify-between">
        <View className="h-8 w-8 items-center justify-center">
          <SvgIcon width={22} height={22} />
        </View>
        <Text className="font-fredokaBold text-lg text-primaryText">
          {value}
        </Text>
      </View>
      <Text className="font-fredokaSemiBold text-xs text-primaryText">
        {label}
      </Text>
    </Animated.View>
  );
}

export function StatisticsOverview({ overview }: StatisticsOverviewProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const stats = [
    {
      SvgIcon: StatisticsSvgAssets.scoreIcon,
      label: t("statistics.averageScore"),
      value: `${Math.round(overview.averageScore * 100)}%`,
    },
    {
      SvgIcon: StatisticsSvgAssets.speedIcon,
      label: t("statistics.averageSpeed"),
      value: `${Math.round(overview.averageSpeed)}s`,
    },
    {
      SvgIcon: StatisticsSvgAssets.difficultyIcon,
      label: t("statistics.difficultyScore"),
      value: `${Math.round(overview.averageDifficultyScore)}`,
    },
    {
      SvgIcon: StatisticsSvgAssets.topicIcon,
      label: t("statistics.topicsCovered"),
      value: `${Math.round(overview.topicsCovered * 100)}%`,
    },
  ];

  return (
    <View>
      <View className="mb-3 flex-row items-center gap-2">
        <Ionicons name="stats-chart" size={18} color={colors.primary} />
        <Text className="font-fredokaSemiBold text-lg text-primaryText">
          {t("statistics.overview")}
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-3">
        {stats.map((stat, idx) => (
          <AnimatedStatCard key={stat.label} {...stat} index={idx} />
        ))}
      </View>
    </View>
  );
}
