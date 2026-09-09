import { useGetPractice } from "@/src/api/practice/useGetPractice";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import useTheme from "@/src/hooks/useTheme";
import { PracticeQuiz } from "@/src/screens/practiceScreen/PracticeQuiz";
import { PracticeReview } from "@/src/screens/practiceScreen/PracticeReview";
import { usePracticeStore } from "@/src/stores/usePracticeStore";
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

export default function PracticeSessionScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const { userId } = useUserStore();
  const isHistoryMode = mode === "history";

  const {
    data: practice,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetPractice(userId!, id);

  const errorStatus = getHttpStatus(error);

  const startSession = usePracticeStore((s) => s.startSession);
  const activeSession = usePracticeStore((s) => s.getSession(id));

  const isCompleted = practice?.secondsSpent !== undefined;

  // Log errors for debugging
  useEffect(() => {
    if (isError) {
      logger.error("useGetPractice failed:", String(error));
    }
  }, [isError, error]);

  // Start local quiz session when practice is loaded (and not yet completed)
  useEffect(() => {
    if (practice && !isCompleted && !isHistoryMode) {
      startSession(id, practice.questions.length);
    }
  }, [practice, isCompleted, isHistoryMode, id, startSession]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <LoadingSpinner size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError || !practice) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="relative items-center justify-center bg-surface px-5 py-4">
          <Pressable
            className="absolute left-5 active:opacity-70"
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.primaryText}
            />
          </Pressable>
          <Text className="font-fredokaSemiBold text-lg text-primaryText">
            {t("practice.quizTitle")}
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
          <Text className="mt-2 text-center font-fredoka text-sm text-mutedText">
            {error?.message ?? t("common.unknownError")}
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
              {t("practice.backToList")}
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
            ? t("practice.reviewTitle")
            : t("practice.quizTitle")}
        </Text>
      </View>

      {isCompleted || isHistoryMode ? (
        <PracticeReview practiceContent={practice} />
      ) : activeSession ? (
        <PracticeQuiz
          questions={practice.questions}
          session={activeSession}
          userId={userId!}
          practiceId={id}
          difficulty={practice.difficulty}
        />
      ) : (
        <SafeAreaView className="flex-1 items-center justify-center bg-background">
          <LoadingSpinner size="large" color={colors.primary} />
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
}
