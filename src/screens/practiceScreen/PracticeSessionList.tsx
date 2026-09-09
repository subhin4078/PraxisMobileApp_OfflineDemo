import type { PracticeListItem } from "@/src/api/practice/useGetPractices";
import { CommonSvgAssets } from "@/src/constants/assets/commonAssets";
import {
  PracticeImageAssets,
  PracticeSvgAssets,
} from "@/src/constants/assets/practiceAssets";
import useTheme from "@/src/hooks/useTheme";
import { shouldNavigate } from "@/src/utils";
import { formatRelativeDate } from "@/src/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Image, Pressable, Text, View } from "react-native";

interface PracticeSessionListProps {
  practices: PracticeListItem[];
}

export function PracticeSessionList({ practices }: PracticeSessionListProps) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const formatDate = (dateString: string) =>
    formatRelativeDate(dateString, i18n.language, t);

  if (practices.length === 0) {
    return (
      <View className="w-full items-center justify-center px-8">
        <CommonSvgAssets.ghost width={80} height={80} />
        <Text className="mt-6 text-center font-fredokaSemiBold text-xl text-practiceEmptyTitle">
          {t("practice.noSessions")}
        </Text>
        <Text
          style={{
            fontFamily: "Fredoka_400Regular",
            fontSize: 14,
            color: colors.emptyStateDescriptionText,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          {t("practice.noSessionsDescription")}
        </Text>
      </View>
    );
  }

  const sortedPractices = [...practices].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <View className="flex-1 gap-3 px-5">
      {sortedPractices.map((practice) => (
        <Pressable
          key={practice.practiceId}
          className="flex-row items-center gap-4 rounded-2xl bg-practiceSessionCardBg p-4 active:opacity-70"
          onPress={() => {
            if (!shouldNavigate()) return;
            router.push({
              pathname: "/practice/[id]",
              params: { id: practice.practiceId },
            });
          }}
        >
          {/* Status icon */}
          <View
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{
              backgroundColor: practice.completed
                ? colors.practiceScoreHigh
                : colors.practiceInProgressBg,
            }}
          >
            {practice.completed ? (
              <PracticeSvgAssets.tickmarkIcon width={32} height={32} />
            ) : (
              <PracticeSvgAssets.playIcon width={32} height={32} />
            )}
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="mb-1 flex-row items-center justify-between">
              <View className="flex-1 flex-row flex-wrap items-center gap-1">
                {practice.topics.map((topic, index) => (
                  <Text
                    key={topic}
                    className="font-fredokaSemiBold text-sm text-practiceSessionTitle"
                  >
                    {t(`mathTopics.${topic}`, { defaultValue: topic })}
                    {index < practice.topics.length - 1 ? "," : ""}
                  </Text>
                ))}
              </View>
              <Text className="ml-2 font-fredoka text-xs text-practiceSessionSubtitle">
                {formatDate(practice.createdAt)}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <View
                className="rounded-full px-2 py-0.5"
                style={{
                  backgroundColor: practice.completed
                    ? colors.practiceScoreHigh + "20"
                    : colors.practiceHintBg,
                }}
              >
                <Text
                  className="font-fredokaSemiBold text-xs"
                  style={{
                    color: practice.completed
                      ? colors.practiceScoreHigh
                      : colors.practiceHintText,
                  }}
                >
                  {practice.completed
                    ? t("practice.completed")
                    : t("practice.inProgress")}
                </Text>
              </View>
            </View>
          </View>

          {/* Chevron */}
          <Ionicons name="chevron-forward" size={20} color={colors.mutedText} />
        </Pressable>
      ))}
    </View>
  );
}
