import type { PracticeQuestionItem } from "@/src/api/practice/useGetPractice";
import { useMarkAnswers } from "@/src/api/practice/useMarkAnswers";
import { MarkdownMathText } from "@/src/components/MarkdownMathText";
import { ErrorImageAssets } from "@/src/constants/assets/errorAssets";
import { PracticeSvgAssets } from "@/src/constants/assets/practiceAssets";
import useTheme from "@/src/hooks/useTheme";
import type { ActiveSession } from "@/src/stores/usePracticeStore";
import { usePracticeStore } from "@/src/stores/usePracticeStore";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PracticeQuizProps {
  questions: PracticeQuestionItem[];
  session: ActiveSession;
  userId: string;
  practiceId: string;
  difficulty: string;
}

export function PracticeQuiz({
  questions,
  session,
  userId,
  practiceId,
  difficulty,
}: PracticeQuizProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const setAnswer = usePracticeStore((s) => s.setAnswer);
  const setCurrentQuestion = usePracticeStore((s) => s.setCurrentQuestion);
  const storeSetElapsedSeconds = usePracticeStore((s) => s.setElapsedSeconds);
  const storeSetRevealedHints = usePracticeStore((s) => s.setRevealedHints);
  const clearSession = usePracticeStore((s) => s.clearSession);
  const setLastRewards = usePracticeStore((s) => s.setLastRewards);

  const {
    mutate: markAnswers,
    isPending,
    data: mutationData,
  } = useMarkAnswers(userId, practiceId);

  const [elapsedSeconds, setElapsedSeconds] = useState(
    session.elapsedSeconds || 0,
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [hintsVisible, setHintsVisible] = useState(false);
  // Track how many hints have been revealed per question index
  const [revealedHints, setRevealedHints] = useState<Record<number, number>>(
    session.revealedHints || {},
  );
  const [markingCompleted, setMarkingCompleted] = useState(false);
  const [submitConfirmVisible, setSubmitConfirmVisible] = useState(false);

  // Timer - only update local state
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Sync elapsed seconds to store - separate effect to avoid state update during render
  useEffect(() => {
    storeSetElapsedSeconds(practiceId, elapsedSeconds);
  }, [elapsedSeconds, practiceId, storeSetElapsedSeconds]);

  // Sync revealed hints to store
  useEffect(() => {
    storeSetRevealedHints(practiceId, revealedHints);
  }, [revealedHints, practiceId, storeSetRevealedHints]);

  // Handle mutation success – update store when marking is complete
  useEffect(() => {
    if (!isPending && mutationData && !markingCompleted) {
      setMarkingCompleted(true);
      setLastRewards(mutationData.rewards ?? null);
      clearSession(practiceId);
    }
  }, [
    isPending,
    mutationData,
    markingCompleted,
    practiceId,
    setLastRewards,
    clearSession,
  ]);

  const currentIndex = session.currentQuestionIndex;
  const question = questions[currentIndex];

  // Fade animation on question change
  const questionFadeAnim = useRef(new Animated.Value(1)).current;
  const prevIndexRef = useRef(currentIndex);
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      prevIndexRef.current = currentIndex;
      questionFadeAnim.setValue(0);
      Animated.timing(questionFadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [currentIndex, questionFadeAnim]);

  const revealedCount = revealedHints[currentIndex] ?? 0;
  const totalHints = question?.hints?.length ?? 0;
  const totalQuestions = questions.length;
  const currentAnswer = session.answers[currentIndex];

  const answeredCount = session.answers.filter(
    (a) => a !== null && a !== "",
  ).length;
  const allAnswered = answeredCount === totalQuestions;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleSelectOption = useCallback(
    (option: string) => {
      setAnswer(practiceId, currentIndex, option);
    },
    [currentIndex, practiceId, setAnswer],
  );

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentQuestion(practiceId, currentIndex + 1);
    }
  }, [currentIndex, practiceId, totalQuestions, setCurrentQuestion]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentQuestion(practiceId, currentIndex - 1);
    }
  }, [currentIndex, practiceId, setCurrentQuestion]);

  const handleGoToQuestion = useCallback(
    (index: number) => {
      setCurrentQuestion(practiceId, index);
    },
    [practiceId, setCurrentQuestion],
  );

  const doSubmit = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    markAnswers({
      answers: session.answers.map((a) => a ?? ""),
      secondsSpent: elapsedSeconds,
    });
  }, [session.answers, elapsedSeconds, markAnswers]);

  const handleSubmit = useCallback(() => {
    if (!allAnswered) {
      setSubmitConfirmVisible(true);
      return;
    }
    doSubmit();
  }, [allAnswered, doSubmit]);

  if (!question) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Image
          source={ErrorImageAssets.error4xx}
          style={{ width: 160, height: 160 }}
          resizeMode="contain"
        />
        <Text className="mt-4 text-center font-fredokaSemiBold text-lg text-primaryText">
          {t("practice.errors.noQuestions")}
        </Text>
      </View>
    );
  }

  const hasHints = question.hints && question.hints.length > 0;

  return (
    <View className="flex-1 bg-background">
      {/* Top bar: timer + progress + hints button */}
      <View className="relative flex-row items-center justify-center bg-surface px-5 py-3">
        <View className="absolute left-5 flex-row items-center gap-2">
          <PracticeSvgAssets.clock width={20} height={20} />
          <Text className="font-fredokaSemiBold text-base text-practiceTimerText">
            {formatTime(elapsedSeconds)}
          </Text>
        </View>
        <Text className="font-fredokaSemiBold text-base text-practiceTimerText">
          {answeredCount}/{totalQuestions} {t("practice.answered")}
        </Text>
        {hasHints && (
          <Pressable
            className="absolute right-5 flex-row items-center gap-1 rounded-xl bg-practiceHintBg px-3 py-1.5 active:opacity-70"
            onPress={() => {
              // Reveal the first hint if none revealed yet, then open modal
              if (revealedCount === 0) {
                setRevealedHints((prev) => ({ ...prev, [currentIndex]: 1 }));
              }
              setHintsVisible(true);
            }}
          >
            <PracticeSvgAssets.lightbulb width={18} height={18} />
            <Text className="font-fredokaSemiBold text-xs text-black">
              {t("practice.hints")}{" "}
              {revealedCount > 0 ? `(${revealedCount}/${totalHints})` : ""}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Question navigator dots */}
      <View className="items-center bg-surface px-5 pb-2">
        {Array.from(
          { length: Math.ceil(questions.length / 10) },
          (_, rowIdx) => (
            <View
              key={rowIdx}
              className="flex-row items-center justify-center gap-1.5 py-0.5"
            >
              {questions
                .slice(rowIdx * 10, rowIdx * 10 + 10)
                .map((_, colIdx) => {
                  const idx = rowIdx * 10 + colIdx;
                  const isAnswered = session.answers[idx] !== null;
                  const isCurrent = idx === currentIndex;
                  return (
                    <Pressable
                      key={idx}
                      className={`h-8 w-8 items-center justify-center rounded-full active:opacity-70 ${
                        isCurrent
                          ? "bg-practiceNavCurrent"
                          : isAnswered
                            ? "bg-practiceNavAnswered"
                            : "bg-practiceNavDefault"
                      }`}
                      style={
                        !isCurrent && !isAnswered
                          ? {
                              borderWidth: 1,
                              borderColor: colors.practiceNavDefaultBorder,
                            }
                          : undefined
                      }
                      onPress={() => handleGoToQuestion(idx)}
                    >
                      <Text
                        className={`font-fredokaSemiBold text-xs ${
                          isCurrent
                            ? "text-practiceNavCurrentText"
                            : isAnswered
                              ? "text-practiceNavAnsweredText"
                              : "text-practiceNavDefaultText"
                        }`}
                      >
                        {idx + 1}
                      </Text>
                    </Pressable>
                  );
                })}
            </View>
          ),
        )}
      </View>

      {/* Question body */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <Animated.View style={{ opacity: questionFadeAnim }}>
          {/* Difficulty badge + topic */}
          <View className="mb-4 flex-row items-center gap-2">
            <View
              className={`rounded-full px-3 py-1 ${
                difficulty === "easy"
                  ? "bg-difficultyEasy"
                  : difficulty === "hard"
                    ? "bg-difficultyHard"
                    : "bg-difficultyDSE"
              }`}
            >
              <Text className="font-fredokaSemiBold text-xs text-whiteText">
                {t(`practice.difficulty.${difficulty}`)}
              </Text>
            </View>
            {question.topic && (
              <Text className="font-fredoka text-xs text-mutedText">
                {t(`mathTopics.${question.topic}`)}
              </Text>
            )}
          </View>

          {/* Question text */}
          <View className="mb-6 rounded-2xl bg-surface p-5">
            <MarkdownMathText
              content={question.question}
              fontFamily="Fredoka_400Regular"
              fontSize={18}
              color={colors.blackText}
              containerStyle={{ minHeight: 48, paddingVertical: 4 }}
            />
          </View>

          {/* Options — MC or Written */}
          {question.options && question.options.length > 0 ? (
            <View className="gap-3">
              {question.options.map((option, idx) => {
                const isSelected = currentAnswer === option;
                return (
                  <Pressable
                    key={`opt-${idx}`}
                    className="rounded-xl px-3 py-3 active:opacity-70"
                    style={{
                      width: "100%",
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.practiceOptionDefaultBg,
                      borderWidth: 1,
                      borderColor: isSelected
                        ? colors.primary
                        : colors.practiceOptionDefaultBorder,
                    }}
                    onPress={() => handleSelectOption(option)}
                  >
                    <MarkdownMathText
                      content={option}
                      fontFamily="Fredoka_400Regular"
                      fontSize={14}
                      color={isSelected ? colors.whiteText : colors.primaryText}
                    />
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View>
              <Text className="mb-3 font-fredokaSemiBold text-sm text-mutedText">
                {t("practice.writeYourAnswer")}
              </Text>
              <TextInput
                multiline
                value={currentAnswer ?? ""}
                onChangeText={(text) => handleSelectOption(text)}
                placeholder={t("practice.answerPlaceholder")}
                placeholderTextColor={colors.mutedText}
                style={{
                  minHeight: 140,
                  fontFamily: "Fredoka_400Regular",
                  fontSize: 16,
                  color: colors.blackText,
                  textAlignVertical: "top",
                  padding: 16,
                  backgroundColor: colors.practiceOptionDefaultBg,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: currentAnswer
                    ? colors.primary
                    : colors.practiceOptionDefaultBorder,
                }}
              />
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom navigation */}
      <View
        className="flex-row items-center justify-between bg-surface px-5 py-4"
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.borderColor,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <Pressable
          className={`flex-row items-center gap-1 rounded-xl px-5 py-3 active:opacity-70 ${
            currentIndex > 0 ? "bg-cardBackground" : "opacity-30"
          }`}
          style={
            currentIndex > 0
              ? { borderWidth: 1, borderColor: colors.borderColor }
              : undefined
          }
          onPress={handlePrev}
          disabled={currentIndex === 0}
        >
          <Ionicons name="chevron-back" size={18} color={colors.primaryText} />
          <Text className="font-fredokaSemiBold text-sm text-primaryText">
            {t("practice.prev")}
          </Text>
        </Pressable>

        {currentIndex < totalQuestions - 1 ? (
          <Pressable
            className="flex-row items-center gap-1 rounded-xl bg-cardBackground px-5 py-3 active:opacity-70"
            style={{ borderWidth: 1, borderColor: colors.borderColor }}
            onPress={handleNext}
          >
            <Text className="font-fredokaSemiBold text-sm text-primaryText">
              {t("practice.next")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.primaryText}
            />
          </Pressable>
        ) : (
          <Pressable
            className="flex-row items-center gap-2 rounded-xl bg-practiceSubmitBg px-6 py-3 active:opacity-90 disabled:opacity-60"
            onPress={handleSubmit}
            disabled={isPending}
          >
            {!isPending && (
              <Ionicons
                name="flag"
                size={18}
                color={colors.practiceSubmitText}
              />
            )}
            <Text className="font-fredokaBold text-sm text-practiceSubmitText">
              {isPending ? t("practice.submitting") : t("practice.submit")}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Submit Confirmation Modal */}
      <Modal
        visible={submitConfirmVisible}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setSubmitConfirmVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/50 px-5"
          onPress={() => setSubmitConfirmVisible(false)}
        >
          <Pressable
            className="w-full rounded-2xl bg-surface p-6"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="mb-2 text-center font-fredokaSemiBold text-lg text-primaryText">
              {t("practice.submitConfirmTitle")}
            </Text>
            <Text className="mb-5 text-left font-fredoka text-sm text-secondaryText">
              {t("practice.submitConfirmMessage", {
                answered: answeredCount,
                total: totalQuestions,
              })}
            </Text>
            <View className="flex-row justify-end gap-3">
              <Pressable
                className="rounded-xl px-5 py-2.5 active:opacity-70"
                onPress={() => setSubmitConfirmVisible(false)}
              >
                <Text className="font-fredokaMedium text-base text-secondaryText">
                  {t("practice.submitConfirmCancel")}
                </Text>
              </Pressable>
              <Pressable
                className="rounded-xl px-5 py-2.5 active:opacity-70"
                style={{ backgroundColor: colors.primary }}
                onPress={() => {
                  setSubmitConfirmVisible(false);
                  doSubmit();
                }}
              >
                <Text className="font-fredokaSemiBold text-base text-whiteText">
                  {t("practice.submitConfirmOk")}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Hints Modal */}
      <Modal
        visible={hintsVisible}
        transparent
        statusBarTranslucent
        animationType="slide"
        onRequestClose={() => setHintsVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-3xl bg-surface pb-10 pt-5">
            {/* Handle bar */}
            <View className="mb-4 items-center">
              <View className="bg-mutedText/40 h-1 w-10 rounded-full" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pb-4">
              <View className="flex-row items-center gap-2">
                <PracticeSvgAssets.lightbulb width={22} height={22} />
                <Text className="font-fredokaBold text-lg text-primaryText">
                  {t("practice.hintsTitle")}
                </Text>
              </View>
              <Pressable
                className="active:opacity-70"
                onPress={() => setHintsVisible(false)}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={26}
                  color={colors.mutedText}
                />
              </Pressable>
            </View>

            {/* Hints list – only show revealed hints */}
            <View className="gap-3 px-5">
              {question.hints.slice(0, revealedCount).map((hint, hIdx) => (
                <View
                  key={hIdx}
                  className="flex-row gap-3 rounded-2xl bg-practiceHintCardBg p-4"
                >
                  <View className="mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-practiceHintBg">
                    <Text className="font-fredokaBold text-xs text-black">
                      {hIdx + 1}
                    </Text>
                  </View>
                  <MarkdownMathText
                    content={hint}
                    fontFamily="Fredoka_400Regular"
                    fontSize={16}
                    color={colors.blackText}
                    containerStyle={{ flex: 1 }}
                  />
                </View>
              ))}

              {/* Reveal next hint button */}
              {revealedCount < totalHints && (
                <Pressable
                  className="mt-1 flex-row items-center justify-center gap-2 rounded-2xl bg-practiceHintBg py-3 active:opacity-70"
                  onPress={() => {
                    setRevealedHints((prev) => ({
                      ...prev,
                      [currentIndex]: (prev[currentIndex] ?? 0) + 1,
                    }));
                  }}
                >
                  <Text className="font-fredokaSemiBold text-sm text-black">
                    {t("practice.revealNextHint")} ({revealedCount}/{totalHints}
                    )
                  </Text>
                </Pressable>
              )}

              {revealedCount >= totalHints && (
                <Text className="mt-1 text-center font-fredoka text-sm text-mutedText">
                  {t("practice.allHintsRevealed")}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
