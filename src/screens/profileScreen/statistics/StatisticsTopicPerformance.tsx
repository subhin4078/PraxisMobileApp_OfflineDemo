import { CommonSvgAssets } from "@/src/constants/assets/commonAssets";
import useTheme from "@/src/hooks/useTheme";
import { StatisticsData } from "@/src/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Easing, Text, View } from "react-native";

interface StatisticsTopicPerformanceProps {
  topicPerformance: StatisticsData["byTopicPerformance"];
}

function AnimatedProgressBar({
  percentage,
  color,
  bgColor,
  delay,
}: {
  percentage: number;
  color: string;
  bgColor: string;
  delay: number;
}) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percentage,
      duration: 900,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [percentage, delay]);

  return (
    <View
      className="h-2 overflow-hidden rounded-full"
      style={{ backgroundColor: bgColor }}
    >
      <Animated.View
        className="h-full rounded-full"
        style={{
          width: widthAnim.interpolate({
            inputRange: [0, 100],
            outputRange: ["0%", "100%"],
          }),
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export function StatisticsTopicPerformance({
  topicPerformance,
}: StatisticsTopicPerformanceProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  type TopicPerformanceEntry = {
    averageScore: number;
    averageDifficultyScore: number;
    questionsCompleted: number;
  };

  const topics = Object.entries(topicPerformance || {}).filter(
    (entry): entry is [string, TopicPerformanceEntry] => entry[1] !== undefined,
  ) as [string, TopicPerformanceEntry][];

  if (topics.length === 0) {
    return (
      <View>
        <View className="mb-3 flex-row items-center gap-2">
          <Ionicons name="book" size={18} color={colors.primary} />
          <Text className="font-fredokaSemiBold text-lg text-primaryText">
            {t("statistics.topicPerformance")}
          </Text>
        </View>
        <View className="items-center rounded-2xl bg-surface py-8">
          <View style={{ opacity: 0.5 }}>
            <CommonSvgAssets.questionSquare width={36} height={36} />
          </View>
          <Text
            style={{
              fontFamily: "Fredoka_400Regular",
              fontSize: 14,
              color: colors.emptyStateDescriptionText,
              marginTop: 8,
            }}
          >
            {t("statistics.noDataYet")}
          </Text>
        </View>
      </View>
    );
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 0.8) return colors.topicPerformanceHigh;
    if (score >= 0.5) return colors.topicPerformanceMid;
    return colors.topicPerformanceLow;
  };

  const sortedTopics = topics.sort(
    (a, b) => b[1].averageScore - a[1].averageScore,
  );

  return (
    <View>
      <View className="mb-3 flex-row items-center gap-2">
        <Ionicons name="book" size={18} color={colors.primary} />
        <Text className="font-fredokaSemiBold text-lg text-primaryText">
          {t("statistics.topicPerformance")}
        </Text>
      </View>
      <View
        className="overflow-hidden rounded-2xl bg-surface"
        style={{ borderWidth: 1, borderColor: colors.borderColor }}
      >
        {sortedTopics.map(([topic, performance], idx) => {
          const scorePercentage = Math.round(performance.averageScore * 100);
          const performanceColor = getPerformanceColor(
            performance.averageScore,
          );

          return (
            <View
              key={topic}
              className="px-4 py-3.5"
              style={
                idx < sortedTopics.length - 1
                  ? {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.borderColor,
                    }
                  : undefined
              }
            >
              <View className="mb-2 flex-row items-center gap-2.5">
                <Text
                  className="flex-1 font-fredokaMedium text-sm text-primaryText"
                  numberOfLines={1}
                >
                  {t(`mathTopics.${topic}`)}
                </Text>
                <Text
                  className="font-fredokaBold text-sm"
                  style={{ color: performanceColor }}
                >
                  {scorePercentage}%
                </Text>
              </View>
              <AnimatedProgressBar
                percentage={scorePercentage}
                color={performanceColor}
                bgColor={performanceColor + "15"}
                delay={idx * 80}
              />
              <View className="mt-1.5 flex-row items-center gap-3">
                <Text className="font-fredoka text-[10px] text-mutedText">
                  {performance.questionsCompleted}{" "}
                  {t("statistics.completedQuestions")}
                </Text>
                <Text className="font-fredoka text-[10px] text-mutedText">
                  {t("statistics.difficultyScore")}:{" "}
                  {Math.round(performance.averageDifficultyScore)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
