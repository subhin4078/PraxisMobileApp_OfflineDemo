import type { PracticeContent } from "@/src/api/practice/useGetPractice";
import { ConfettiCelebration } from "@/src/components/ConfettiCelebration";
import { ExpandableQuestionCard } from "@/src/components/ExpandableQuestionCard";
import { RewardsSummary } from "@/src/components/RewardsSummary";
import useTheme from "@/src/hooks/useTheme";
import { usePracticeStore } from "@/src/stores/usePracticeStore";
import { useSettingsStore } from "@/src/stores/useSettingsStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

interface PracticeReviewProps {
  practiceContent: PracticeContent;
}

export function PracticeReview({ practiceContent }: PracticeReviewProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const lastRewards = usePracticeStore((s) => s.lastRewards);
  const setLastRewards = usePracticeStore((s) => s.setLastRewards);

  // Clear rewards once displayed
  useEffect(() => {
    return () => {
      setLastRewards(null);
    };
  }, [setLastRewards]);

  // Vibrate on practice completion
  useEffect(() => {
    if (useSettingsStore.getState().vibrationEnabled) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const { questions } = practiceContent;
  const totalQuestions = questions.length;
  const correctCount = questions.filter((q) => q.isStudentCorrect).length;
  const scorePercent =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const timeSpentSeconds = practiceContent.secondsSpent ?? 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const getScoreColor = () => {
    if (scorePercent >= 70) return colors.practiceScoreHigh;
    if (scorePercent >= 40) return colors.practiceScoreMid;
    return colors.practiceScoreLow;
  };

  const toggleExpand = useCallback((index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleBackToList = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {scorePercent >= 70 && <ConfettiCelebration />}
      {/* Score Card */}
      <View className="mx-5 mt-6 items-center rounded-2xl bg-surface p-6">
        <View
          className="mb-4 h-24 w-24 items-center justify-center rounded-full"
          style={{ backgroundColor: getScoreColor() }}
        >
          <Text className="font-fredokaBold text-3xl text-practiceScoreText">
            {scorePercent}%
          </Text>
        </View>

        <Text className="font-fredokaBold text-2xl text-primaryText">
          {scorePercent >= 70
            ? t("practice.resultGreat")
            : scorePercent >= 40
              ? t("practice.resultGood")
              : t("practice.resultKeepTrying")}
        </Text>

        <View className="mt-4 flex-row gap-6">
          <View className="items-center">
            <Text className="font-fredokaBold text-xl text-practiceReviewCorrectBg">
              {correctCount}
            </Text>
            <Text className="font-fredoka text-xs text-mutedText">
              {t("practice.correct")}
            </Text>
          </View>
          <View className="items-center">
            <Text className="font-fredokaBold text-xl text-practiceReviewWrongBg">
              {totalQuestions - correctCount}
            </Text>
            <Text className="font-fredoka text-xs text-mutedText">
              {t("practice.wrong")}
            </Text>
          </View>
          <View className="items-center">
            <Text className="font-fredokaBold text-xl text-primaryText">
              {formatTime(timeSpentSeconds)}
            </Text>
            <Text className="font-fredoka text-xs text-mutedText">
              {t("practice.time")}
            </Text>
          </View>
        </View>
      </View>

      {/* Rewards Card */}
      <View className="mx-5 mt-4">
        <RewardsSummary rewards={lastRewards} />
      </View>

      {/* Question Review List */}
      <Text className="mb-3 mt-6 px-5 font-fredokaSemiBold text-lg text-primaryText">
        {t("practice.reviewAnswers")}
      </Text>

      <View className="gap-3 px-5">
        {questions.map((question, idx) => (
          <ExpandableQuestionCard
            key={idx}
            questionText={question.question}
            index={idx}
            isExpanded={expandedIndex === idx}
            onToggle={() => toggleExpand(idx)}
            isCorrect={question.isStudentCorrect ?? false}
            studentAnswer={question.studentAnswer}
            correctAnswer={question.answer}
            solution={question.solution}
            awardedSteps={question.awardedSteps}
          />
        ))}
      </View>

      {/* Back button */}
      <View className="mt-6 px-5">
        <Pressable
          className="items-center rounded-2xl bg-practiceStartButtonBg py-4 active:opacity-90"
          onPress={handleBackToList}
        >
          <Text className="font-fredokaBold text-lg text-practiceStartButtonText">
            {t("practice.backToList")}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
