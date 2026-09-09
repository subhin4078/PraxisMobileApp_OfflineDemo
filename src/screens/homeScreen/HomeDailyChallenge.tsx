import { useGetLatestDailyExercise } from "@/src/api/practice/useGetLatestDailyExercise";
import { MathBackground } from "@/src/components/MathBackground";
import { HomeImageAssets } from "@/src/constants/assets/homeAssets";
import useTheme from "@/src/hooks/useTheme";
import useUserStore from "@/src/stores/useUserStore";
import { shouldNavigate } from "@/src/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Image, Pressable, Text, View } from "react-native";

export function HomeDailyChallenge() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { userId } = useUserStore();

  const { data, isLoading } = useGetLatestDailyExercise(userId || "");

  const isCompleted = data?.dailyExercise
    ? "secondsSpent" in data.dailyExercise
    : false;

  const total = data?.dailyExercise?.questions?.length ?? 0;
  const progress = isCompleted
    ? total
    : (data?.dailyExercise?.questions?.filter(
        (q) => "studentAnswer" in q && q.studentAnswer,
      ).length ?? 0);
  const progressPercentage = total > 0 ? (progress / total) * 100 : 0;

  const handlePress = () => {
    if (data?.dailyExerciseId && shouldNavigate()) {
      router.push(`/daily-exercise/${data.dailyExerciseId}` as never);
    }
  };

  if (isLoading || !data) {
    return (
      <View className="mb-5">
        <View className="overflow-hidden rounded-3xl">
          <MathBackground />
          <View className="items-center p-6">
            <Image
              source={HomeImageAssets.teacher}
              className="h-40 w-40"
              resizeMode="contain"
            />
            <Text className="mt-4 text-center font-fredokaSemiBold text-sm text-whiteText opacity-90">
              {isLoading
                ? t("home.dailyChallengeLoading")
                : t("home.dailyChallengeNone")}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-5">
      <View className="overflow-hidden rounded-3xl">
        <MathBackground />
        <View className="p-6">
          {/* Daily Challenge Header */}
          <View className="mb-4 flex-row items-center gap-2">
            <Ionicons name="paw" size={20} color={colors.whiteText} />
            <Text className="font-fredokaSemiBold text-sm text-whiteText">
              {t("home.dailyChallenge").toUpperCase()}
            </Text>
          </View>

          {/* Teacher Cat Image — hidden when completed */}
          {!isCompleted && (
            <View className="mb-4 items-center">
              <Image
                source={HomeImageAssets.teacher}
                className="h-40 w-40"
                resizeMode="contain"
              />
            </View>
          )}

          {/* Challenge Title */}
          <Text className="mb-1 text-center font-fredokaBold text-xl text-whiteText">
            {isCompleted
              ? t("home.dailyChallengeCompleted")
              : t("home.dailyChallengeTitle", { count: total })}
          </Text>

          {/* Challenge Description — hidden when completed */}
          {!isCompleted && (
            <Text className="mb-5 text-center font-fredokaSemiBold text-sm text-whiteText opacity-90">
              {t("home.dailyChallengeDesc")}
            </Text>
          )}

          {/* Progress — hidden when completed */}
          {!isCompleted && (
            <View className="mb-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="font-fredokaSemiBold text-xs text-whiteText opacity-90">
                  {t("home.progress")}
                </Text>
                <Text className="font-fredokaBold text-sm text-whiteText">
                  {progress}/{total}
                </Text>
              </View>
              <View className="h-2.5 w-full overflow-hidden rounded-full bg-white/25">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${progressPercentage}%`,
                    backgroundColor: colors.whiteText,
                  }}
                />
              </View>
            </View>
          )}

          <Pressable
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-whiteText py-3.5 active:opacity-90"
            accessibilityLabel={
              isCompleted ? t("home.dailyChallengeReview") : t("home.continue")
            }
            accessibilityHint={t("home.progressHint", { progress, total })}
            onPress={handlePress}
          >
            <Text className="font-fredokaBold text-base text-primary">
              {isCompleted
                ? t("home.dailyChallengeReview")
                : t("home.continue")}
            </Text>
            <Ionicons
              name={isCompleted ? "eye" : "arrow-forward"}
              size={20}
              color={colors.primary}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
