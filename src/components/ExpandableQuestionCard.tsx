import { MarkdownMathText } from "@/src/components/MarkdownMathText";
import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

interface ExpandableQuestionCardProps {
  questionText: string;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  isCorrect: boolean;
  /** Undefined means the question has no student answer yet (e.g. unmarked daily exercise) */
  studentAnswer?: string;
  correctAnswer?: string;
  solution?: string;
  awardedSteps?: string[];
  /** Which i18n namespace to use for yourAnswer / correctAnswer / noAnswer keys */
  i18nNamespace?: "practice" | "battle";
}

export function ExpandableQuestionCard({
  questionText,
  index,
  isExpanded,
  onToggle,
  isCorrect,
  studentAnswer,
  correctAnswer,
  solution,
  awardedSteps,
  i18nNamespace = "practice",
}: ExpandableQuestionCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const hasStudentAnswer = studentAnswer !== undefined;

  return (
    <Pressable
      className="rounded-2xl bg-cardBackground active:opacity-70"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: isCorrect
          ? colors.practiceReviewCorrectBg
          : colors.practiceReviewWrongBg,
      }}
      onPress={onToggle}
    >
      {/* Question header */}
      <View className="flex-row items-start gap-3 p-4">
        <View
          className="mt-0.5 h-8 w-8 items-center justify-center rounded-full"
          style={{
            backgroundColor: isCorrect
              ? colors.practiceReviewCorrectBg
              : colors.practiceReviewWrongBg,
          }}
        >
          <Ionicons
            name={isCorrect ? "checkmark" : "close"}
            size={18}
            color={colors.practiceReviewIconColor}
          />
        </View>

        <MarkdownMathText
          content={`Q${index + 1}. ${questionText}`}
          fontFamily="Fredoka_400Regular"
          fontSize={14}
          color={colors.primaryText}
          containerStyle={{
            flex: 1,
            paddingVertical: 4,
          }}
        />

        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.mutedText}
          style={{ marginTop: 4 }}
        />
      </View>

      {/* Expanded details — only shown when student answer data is available */}
      {isExpanded && hasStudentAnswer && (
        <View className="gap-3 border-t border-borderColor px-4 pb-4 pt-3">
          {/* Your answer */}
          <View>
            <Text className="mb-1 font-fredokaSemiBold text-xs text-mutedText">
              {t(`${i18nNamespace}.yourAnswer`)}
            </Text>
            <View
              className="rounded-xl p-3"
              style={{
                backgroundColor: isCorrect
                  ? colors.practiceReviewCorrectOptionBg
                  : colors.practiceReviewWrongOptionBg,
              }}
            >
              <MarkdownMathText
                content={studentAnswer || t(`${i18nNamespace}.noAnswer`)}
                fontFamily="Fredoka_400Regular"
                fontSize={14}
                color={colors.practiceReviewOptionText}
                containerStyle={{ paddingVertical: 4 }}
              />
            </View>
          </View>

          {/* Correct answer — only when student was wrong */}
          {!isCorrect && !!correctAnswer && (
            <View>
              <Text className="mb-1 font-fredokaSemiBold text-xs text-mutedText">
                {t(`${i18nNamespace}.correctAnswer`)}
              </Text>
              <View
                className="rounded-xl p-3"
                style={{
                  backgroundColor: colors.practiceReviewCorrectOptionBg,
                }}
              >
                <MarkdownMathText
                  content={correctAnswer}
                  fontFamily="Fredoka_400Regular"
                  fontSize={14}
                  color={colors.practiceReviewOptionText}
                  containerStyle={{ paddingVertical: 4 }}
                />
              </View>
            </View>
          )}

          {/* Solution */}
          {!!solution && (
            <View>
              <Text className="mb-1 font-fredokaSemiBold text-xs text-mutedText">
                {t("practice.solution")}
              </Text>
              <View className="rounded-xl bg-surface p-3">
                <MarkdownMathText
                  content={solution}
                  fontFamily="Fredoka_400Regular"
                  fontSize={14}
                  color={colors.primaryText}
                  containerStyle={{ paddingVertical: 4 }}
                />
              </View>
            </View>
          )}

          {/* Awarded steps */}
          {!!awardedSteps && awardedSteps.length > 0 && (
            <View>
              <Text className="mb-1 font-fredokaSemiBold text-xs text-mutedText">
                {t("practice.awardedSteps")}
              </Text>
              <View className="gap-1.5 rounded-xl bg-surface p-3">
                {awardedSteps.map((step, sIdx) => (
                  <View key={sIdx} className="flex-row gap-2">
                    <Text className="font-fredokaBold text-xs text-mutedText">
                      {sIdx + 1}.
                    </Text>
                    <MarkdownMathText
                      content={step}
                      fontFamily="Fredoka_400Regular"
                      fontSize={14}
                      color={colors.primaryText}
                      containerStyle={{ flex: 1 }}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}
