import pawLoadingLottie from "@/assets/animations/common/paw_loading.json";
import { useGetStatistics } from "@/src/api/user/useGetStatistics";
import { ProfileImageAssets } from "@/src/constants/assets/profileAssets";
import { useDelayedLoading } from "@/src/hooks/useDelayedLoading";
import useTheme from "@/src/hooks/useTheme";
import { StatisticsActivityChart } from "@/src/screens/profileScreen/statistics/StatisticsActivityChart";
import { StatisticsOverview } from "@/src/screens/profileScreen/statistics/StatisticsOverview";
import { StatisticsTopicPerformance } from "@/src/screens/profileScreen/statistics/StatisticsTopicPerformance";
import useUserStore from "@/src/stores/useUserStore";
import {
  getHttpErrorImage,
  getHttpErrorMessage,
  getHttpStatus,
} from "@/src/utils/httpError";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StatisticsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { userId } = useUserStore();
  const showDelayedLoading = useDelayedLoading(300); // Reduced artificial delay to 300ms

  const {
    data: statistics,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetStatistics(userId!);
  const errorStatus = getHttpStatus(error);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="relative items-center justify-center bg-surface px-5 py-4">
        <Pressable
          className="absolute left-5 active:opacity-70"
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primaryText} />
        </Pressable>
        <Text className="font-fredokaSemiBold text-lg text-primaryText">
          {t("statistics.title")}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Hero Banner */}
        <View
          style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}
        >
          <View className="items-center">
            <Image
              source={ProfileImageAssets.statistics}
              className="h-36 w-72"
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {showDelayedLoading || isLoading ? (
            <View className="items-center justify-center py-20">
              <LottieView
                source={pawLoadingLottie}
                style={{ width: 80, height: 80 }}
                autoPlay
                loop
              />
            </View>
          ) : isError ? (
            <View className="items-center justify-center py-10">
              <Image
                source={getHttpErrorImage(errorStatus)}
                style={{ width: 140, height: 140 }}
                resizeMode="contain"
              />
              <Text className="mt-4 text-center font-fredokaSemiBold text-lg text-primaryText">
                {getHttpErrorMessage(errorStatus, t)}
              </Text>
              <Pressable
                className="mt-6 flex-row items-center gap-2 rounded-full border-2 border-primary px-6 py-3 active:opacity-70"
                onPress={() => refetch()}
              >
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text className="font-fredokaSemiBold text-base text-primary">
                  {t("common.tryAgain")}
                </Text>
              </Pressable>
            </View>
          ) : statistics ? (
            <View className="gap-6 pt-2">
              <StatisticsOverview overview={statistics.overview} />
              <StatisticsTopicPerformance
                topicPerformance={statistics.byTopicPerformance}
              />
              <StatisticsActivityChart activityLogs={statistics.activityLogs} />
            </View>
          ) : (
            <View className="items-center justify-center py-10">
              <Ionicons
                name="analytics-outline"
                size={48}
                color={colors.mutedText}
              />
              <Text className="mt-3 font-fredoka text-base text-secondaryText">
                {t("statistics.noDataYet")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
