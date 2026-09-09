import { CommonSvgAssets } from "@/src/constants/assets/commonAssets";
import type { ThemeColors } from "@/src/constants/theme";
import useTheme from "@/src/hooks/useTheme";
import { StatisticsData } from "@/src/types/api";
import { formatActivityDate } from "@/src/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Easing, Text, View } from "react-native";

interface StatisticsActivityChartProps {
  activityLogs: StatisticsData["activityLogs"];
}

export function StatisticsActivityChart({
  activityLogs,
}: StatisticsActivityChartProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();

  if (activityLogs.length === 0) {
    return (
      <View>
        <View className="mb-3 flex-row items-center gap-2">
          <Ionicons name="calendar" size={18} color={colors.primary} />
          <Text className="font-fredokaSemiBold text-lg text-primaryText">
            {t("statistics.activityLog")}
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

  const recentActivity = activityLogs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)
    .reverse();
  const maxTotal = Math.max(
    ...recentActivity.map(
      (log) =>
        (log.activity.completedQuestions || 0) +
        (log.activity.participatedBattles || 0) +
        (log.activity.chatAsked || 0),
    ),
    1,
  );

  const formatDate = (dateString: string) =>
    formatActivityDate(dateString, i18n.language);

  return (
    <View>
      <View className="mb-3 flex-row items-center gap-2">
        <Ionicons name="calendar" size={18} color={colors.primary} />
        <Text className="font-fredokaSemiBold text-lg text-primaryText">
          {t("statistics.activityLog")}
        </Text>
      </View>
      <View
        className="overflow-hidden rounded-2xl bg-surface p-4"
        style={{ borderWidth: 1, borderColor: colors.borderColor }}
      >
        {/* Vertical bar chart */}
        <View
          className="mb-3 flex-row items-end justify-between"
          style={{ height: 120 }}
        >
          {recentActivity.map((log, idx) => {
            const {
              completedQuestions = 0,
              participatedBattles = 0,
              chatAsked = 0,
            } = log.activity;
            const total = completedQuestions + participatedBattles + chatAsked;
            const barHeight =
              total > 0 ? Math.max((total / maxTotal) * 100, 12) : 4;

            return (
              <AnimatedBar
                key={log.date}
                height={barHeight}
                total={total}
                completedQuestions={completedQuestions}
                participatedBattles={participatedBattles}
                chatAsked={chatAsked}
                colors={colors}
                index={idx}
              />
            );
          })}
        </View>

        {/* Day labels */}
        <View className="mb-4 flex-row justify-between">
          {recentActivity.map((log) => {
            const formattedDate = formatDate(log.date);
            return (
              <View key={log.date} className="flex-1 items-center">
                <Text className="font-fredokaMedium text-[10px] text-secondaryText">
                  {formattedDate.weekday.slice(0, 3)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View
          className="flex-row items-center justify-center gap-5 border-t pt-3"
          style={{ borderTopColor: colors.borderColor }}
        >
          <View className="flex-row items-center gap-1.5">
            <View
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: colors.chartQuestionsBar }}
            />
            <Text className="font-fredoka text-[11px] text-secondaryText">
              {t("statistics.completedQuestions")}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: colors.chartBattlesBar }}
            />
            <Text className="font-fredoka text-[11px] text-secondaryText">
              {t("statistics.participatedBattles")}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: colors.chartChatBar }}
            />
            <Text className="font-fredoka text-[11px] text-secondaryText">
              {t("statistics.chatAsked")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function AnimatedBar({
  height,
  total,
  completedQuestions,
  participatedBattles,
  chatAsked,
  colors,
  index,
}: {
  height: number;
  total: number;
  completedQuestions: number;
  participatedBattles: number;
  chatAsked: number;
  colors: ThemeColors;
  index: number;
}) {
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: height,
      duration: 700,
      delay: index * 80,
      easing: Easing.out(Easing.back(1.1)),
      useNativeDriver: false,
    }).start();
  }, [height]);

  const questionsRatio = total > 0 ? completedQuestions / total : 0;
  const battlesRatio = total > 0 ? participatedBattles / total : 0;
  const chatRatio = total > 0 ? chatAsked / total : 0;

  return (
    <View className="flex-1 items-center px-1">
      <Animated.View
        className="w-full overflow-hidden rounded-t-lg"
        style={{
          height: heightAnim.interpolate({
            inputRange: [0, 100],
            outputRange: [0, 100],
          }),
          minHeight: total > 0 ? 12 : 4,
        }}
      >
        {total > 0 ? (
          <View style={{ flex: 1, flexDirection: "column" }}>
            {questionsRatio > 0 && (
              <View
                style={{
                  flex: questionsRatio,
                  backgroundColor: colors.chartQuestionsBar,
                  borderTopLeftRadius: 6,
                  borderTopRightRadius: 6,
                }}
              />
            )}
            {battlesRatio > 0 && (
              <View
                style={{
                  flex: battlesRatio,
                  backgroundColor: colors.chartBattlesBar,
                  borderTopLeftRadius: questionsRatio === 0 ? 6 : 0,
                  borderTopRightRadius: questionsRatio === 0 ? 6 : 0,
                }}
              />
            )}
            {chatRatio > 0 && (
              <View
                style={{
                  flex: chatRatio,
                  backgroundColor: colors.chartChatBar,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  borderTopLeftRadius:
                    questionsRatio === 0 && battlesRatio === 0 ? 6 : 0,
                  borderTopRightRadius:
                    questionsRatio === 0 && battlesRatio === 0 ? 6 : 0,
                  minHeight: 2,
                }}
              />
            )}
          </View>
        ) : (
          <View
            className="flex-1 rounded-t-lg"
            style={{ backgroundColor: colors.borderColor }}
          />
        )}
      </Animated.View>
      {total > 0 && (
        <Text className="mt-1 font-fredokaBold text-[9px] text-secondaryText">
          {total}
        </Text>
      )}
    </View>
  );
}
