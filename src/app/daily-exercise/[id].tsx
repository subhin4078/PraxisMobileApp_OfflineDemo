import { useGetLatestDailyExercise } from "@/src/api/practice/useGetLatestDailyExercise";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import useTheme from "@/src/hooks/useTheme";
import { DailyExerciseQuiz } from "@/src/screens/dailyExerciseScreen/DailyExerciseQuiz";
import { DailyExerciseReview } from "@/src/screens/dailyExerciseScreen/DailyExerciseReview";
import { useDailyExerciseStore } from "@/src/stores/useDailyExerciseStore";
import useUserStore from "@/src/stores/useUserStore";
import {
  getHttpErrorImage,
  getHttpErrorMessage,
  getHttpStatus,
} from "@/src/utils/httpError";
import logger from "@/src/utils/logger";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DailyExerciseScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const { userId } = useUserStore();
  const isHistoryMode = mode === "history";

  const { data, isLoading, isError, error, refetch } =
    useGetLatestDailyExercise(userId!);

  const errorStatus = getHttpStatus(error);

  const startSession = useDailyExerciseStore((s) => s.startSession);
  const activeSession = useDailyExerciseStore((s) => s.getSession(id));

  const exercise = data?.dailyExercise;
  const isCompleted = exercise ? "secondsSpent" in exercise : false;

  useEffect(() => {
    if (isError) {
      logger.error("useGetLatestDailyExercise failed:", String(error));
    }
  }, [isError, error]);

  useEffect(() => {
    if (exercise && !isCompleted && !isHistoryMode) {
      startSession(id, exercise.questions.length);
    }
  }, [exercise, isCompleted, isHistoryMode, id, startSession]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <LoadingSpinner size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError || !data || !exercise) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="relative items-center justify-center bg-surface px-5 py-4">
          <Pressable
            className="absolute left-4 active:opacity-70"
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.primaryText}
            />
          </Pressable>
          <Text className="font-fredokaSemiBold text-lg text-primaryText">
            {t("dailyExercise.title")}
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Image
            source={getHttpErrorImage(errorStatus)}
            style={{ width: 160, height: 160 }}
            resizeMode="contain"
          />
          <Text className="mt-4 text-center font-fredokaSemiBold text-lg text-primaryText">
            {getHttpErrorMessage(errorStatus, t)}
          </Text>
          <Pressable
            className="mt-6 flex-row items-center gap-2 rounded-full border-2 border-primary px-6 py-3 active:opacity-70"
            onPress={() => refetch()}
          >
            <Ionicons name="refresh-outline" size={18} color={colors.primary} />
            <Text className="font-fredokaSemiBold text-base text-primary">
              {t("common.tryAgain")}
            </Text>
          </Pressable>
          <Pressable
            className="mt-3 rounded-xl px-6 py-3 active:opacity-80"
            onPress={() => router.back()}
          >
            <Text className="font-fredokaSemiBold text-sm text-secondaryText">
              {t("dailyExercise.backToHome")}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
          {isCompleted || isHistoryMode
            ? t("dailyExercise.reviewTitle")
            : t("dailyExercise.quizTitle")}
        </Text>
      </View>

      {isCompleted || isHistoryMode ? (
        <DailyExerciseReview exercise={exercise} />
      ) : activeSession ? (
        <DailyExerciseQuiz
          questions={exercise.questions}
          session={activeSession}
          userId={userId!}
          dailyExerciseId={id}
          difficulty={exercise.difficulty}
        />
      ) : (
        <SafeAreaView className="flex-1 items-center justify-center bg-background">
          <LoadingSpinner size="large" color={colors.primary} />
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
}
