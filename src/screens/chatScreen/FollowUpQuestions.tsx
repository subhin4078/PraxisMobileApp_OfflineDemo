import {
  type FollowUpQuestion,
  type GenerateFollowUpResponse,
} from "@/src/api/chat/useGenerateFollowUp";
import type { MarkedQuestion } from "@/src/api/chat/useMarkFollowUp";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import { MarkdownMathText } from "@/src/components/MarkdownMathText";
import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, TextInput, View } from "react-native";

interface FollowUpQuestionsProps {
  data: GenerateFollowUpResponse;
  onSubmitAnswers: (answers: string[], messageId: string) => void;
  isSubmitting: boolean;
  markingResult?: MarkedQuestion[] | null;
}

export function FollowUpQuestions({
  data,
  onSubmitAnswers,
  isSubmitting,
  markingResult,
}: FollowUpQuestionsProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<string[]>(
    Array(data.questions.length).fill(""),
  );

  const isMultipleChoice = data.questions.some(
    (q) => q.options && q.options.length > 0,
  );

  const handleSelectOption = (qIndex: number, option: string) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = option;
    setAnswers(newAnswers);
  };

  const handleTextAnswer = (qIndex: number, text: string) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = text;
    setAnswers(newAnswers);
  };

  const allAnswered = answers.every((a) => a.trim().length > 0);
  const isMarked = !!markingResult;

  const handleSubmit = () => {
    if (allAnswered && !isSubmitting) {
      onSubmitAnswers(answers, data.messageId);
    }
  };

  return (
    <View
      className="mb-4 overflow-hidden rounded-2xl"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primary + "40",
      }}
    >
      {/* Header */}
      <View
        className="flex-row items-center gap-2 px-4 py-3"
        style={{ backgroundColor: colors.primary + "10" }}
      >
        <Ionicons name="help-circle" size={18} color={colors.primary} />
        <Text
          className="font-fredokaSemiBold text-sm"
          style={{ color: colors.primary }}
        >
          {t("chat.followUpQuestions")}
        </Text>
      </View>

      {/* Questions */}
      <View className="px-4 py-3">
        {data.questions.map((q: FollowUpQuestion, qIndex: number) => {
          const marked = markingResult?.[qIndex];

          return (
            <View
              key={qIndex}
              className="mb-4"
              style={
                qIndex < data.questions.length - 1
                  ? {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.borderColor,
                      paddingBottom: 16,
                    }
                  : undefined
              }
            >
              {/* Question */}
              <View className="mb-2 flex-row">
                <Text
                  className="mr-2 font-fredokaSemiBold text-sm"
                  style={{ color: colors.primaryText }}
                >
                  {qIndex + 1}.
                </Text>
                <View className="flex-1">
                  <MarkdownMathText
                    content={q.question}
                    fontFamily="Fredoka_400Regular"
                    fontSize={14}
                    color={colors.primaryText}
                  />
                </View>
              </View>

              {/* Options (MC) or Text Input (WQ) */}
              {q.options && q.options.length > 0 ? (
                <View className="gap-2">
                  {q.options.map((option, oIndex) => {
                    // When marked, use the stored studentAnswer so the wrong
                    // selection is highlighted even after re-loading from server
                    // (where the `answers` state is empty).
                    const isSelected = marked
                      ? marked.studentAnswer === option
                      : answers[qIndex] === option;
                    const isCorrectAnswer = marked?.answer === option;
                    const isWrongSelection =
                      marked && isSelected && !marked.isStudentCorrect;

                    let optionBg = colors.background;
                    let optionBorder = colors.borderColor;
                    if (marked) {
                      if (isCorrectAnswer) {
                        optionBg = colors.chatQuizCorrectColor + "20";
                        optionBorder = colors.chatQuizCorrectColor;
                      } else if (isWrongSelection) {
                        optionBg = colors.chatQuizWrongColor + "20";
                        optionBorder = colors.chatQuizWrongColor;
                      }
                    } else if (isSelected) {
                      optionBg = colors.primary + "15";
                      optionBorder = colors.primary;
                    }

                    return (
                      <Pressable
                        key={oIndex}
                        className="flex-row items-center rounded-xl px-3 py-2.5"
                        style={{
                          backgroundColor: optionBg,
                          borderWidth: 1,
                          borderColor: optionBorder,
                        }}
                        onPress={() =>
                          !isMarked && handleSelectOption(qIndex, option)
                        }
                        disabled={isMarked || isSubmitting}
                      >
                        <View className="flex-1">
                          <MarkdownMathText
                            content={option.replace(
                              /\$\$([\s\S]*?)\$\$/g,
                              (_, inner) => `$${inner.trim()}$`,
                            )}
                            fontFamily="Fredoka_400Regular"
                            fontSize={13}
                            color={colors.primaryText}
                            selectable={false}
                          />
                        </View>
                        {marked && isCorrectAnswer && (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={colors.chatQuizCorrectColor}
                          />
                        )}
                        {marked && isWrongSelection && (
                          <Ionicons
                            name="close-circle"
                            size={18}
                            color={colors.chatQuizWrongColor}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <View>
                  <TextInput
                    className="rounded-xl px-3 py-2.5 font-fredoka text-sm"
                    style={{
                      backgroundColor: isMarked
                        ? colors.background
                        : colors.background,
                      borderWidth: 1,
                      borderColor: marked
                        ? marked.isStudentCorrect
                          ? colors.chatQuizCorrectColor
                          : colors.chatQuizWrongColor
                        : colors.borderColor,
                      color: colors.primaryText,
                    }}
                    value={marked ? marked.studentAnswer : answers[qIndex]}
                    onChangeText={(text) => handleTextAnswer(qIndex, text)}
                    placeholder={t("chat.typeYourAnswer")}
                    placeholderTextColor={colors.mutedText}
                    editable={!isMarked && !isSubmitting}
                    multiline
                  />
                </View>
              )}

              {/* Marking Result */}
              {marked && (
                <View className="mt-2">
                  {/* Correct/Wrong indicator */}
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons
                      name={
                        marked.isStudentCorrect
                          ? "checkmark-circle"
                          : "close-circle"
                      }
                      size={16}
                      color={
                        marked.isStudentCorrect
                          ? colors.chatQuizCorrectColor
                          : colors.chatQuizWrongColor
                      }
                    />
                    <Text
                      className="font-fredokaSemiBold text-xs"
                      style={{
                        color: marked.isStudentCorrect
                          ? colors.chatQuizCorrectColor
                          : colors.chatQuizWrongColor,
                      }}
                    >
                      {marked.isStudentCorrect
                        ? t("practice.correct")
                        : t("practice.wrong")}
                    </Text>
                  </View>

                  {/* Solution */}
                  {marked.solution && !marked.isStudentCorrect && (
                    <View
                      className="mt-2 rounded-lg px-3 py-2"
                      style={{ backgroundColor: colors.primary + "08" }}
                    >
                      <Text
                        className="mb-1 font-fredokaSemiBold text-xs"
                        style={{ color: colors.primary }}
                      >
                        {t("practice.solution")}
                      </Text>
                      <MarkdownMathText
                        content={marked.solution}
                        fontFamily="Fredoka_400Regular"
                        fontSize={13}
                        color={colors.primaryText}
                        colonDisplayMath
                      />
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Submit Button */}
      {!isMarked && (
        <View className="px-4 pb-4">
          <Pressable
            className="items-center rounded-xl py-3 active:opacity-70"
            style={{
              backgroundColor:
                allAnswered && !isSubmitting
                  ? colors.primary
                  : colors.mutedText + "40",
            }}
            onPress={handleSubmit}
            disabled={!allAnswered || isSubmitting}
          >
            {isSubmitting ? (
              <View className="flex-row items-center gap-2">
                <LoadingSpinner size="small" color={colors.whiteText} />
                <Text className="font-fredokaSemiBold text-sm text-white">
                  {t("chat.submittingAnswers")}
                </Text>
              </View>
            ) : (
              <Text
                className="font-fredokaSemiBold text-sm"
                style={{ color: allAnswered ? "white" : colors.mutedText }}
              >
                {t("chat.submitAnswers")}
              </Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}
