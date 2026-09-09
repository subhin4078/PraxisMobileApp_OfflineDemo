import { MarkdownMathText } from "@/src/components/MarkdownMathText";
import useTheme from "@/src/hooks/useTheme";
import type { BattleQuestion } from "@/src/types/battle";
import { playBattleSubmitAnswerSfx } from "@/src/utils/sfx";
import { useTranslation } from "react-i18next";
import { Animated, Pressable, Text, View } from "react-native";

interface BattleQuestionCardProps {
  question: BattleQuestion | undefined;
  answers: string[];
  currentQuestionIndex: number;
  totalQuestions: number;
  isInteractionLocked: boolean;
  hasSubmitted: boolean;
  questionFadeAnim: Animated.Value;
  onChooseOption: (option: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
}

export function BattleQuestionCard({
  question,
  answers,
  currentQuestionIndex,
  totalQuestions,
  isInteractionLocked,
  hasSubmitted,
  questionFadeAnim,
  onChooseOption,
  onNext,
  onPrev,
  onSubmit,
}: BattleQuestionCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (!question) {
    return (
      <View
        className="rounded-2xl bg-surface p-4"
        style={{ borderColor: colors.borderColor, borderWidth: 1 }}
      >
        <Text className="font-fredokaMedium text-sm text-mutedText">
          {t("battle.noBattleData")}
        </Text>
      </View>
    );
  }

  return (
    <Animated.View
      className="rounded-2xl bg-surface p-4"
      style={{
        borderColor: colors.borderColor,
        borderWidth: 1,
        opacity: questionFadeAnim,
      }}
    >
      <Text className="font-fredokaSemiBold text-sm text-secondaryText">
        {t("battle.questionNumber", {
          current: currentQuestionIndex + 1,
          total: totalQuestions,
        })}
      </Text>
      <MarkdownMathText
        content={question.question}
        fontFamily="Fredoka_400Regular"
        fontSize={16}
        color={colors.primaryText}
        containerStyle={{ marginTop: 8 }}
      />

      <View className="mt-4 gap-3">
        {question.options.map((option, idx) => {
          const isSelected = answers[currentQuestionIndex] === option;
          return (
            <Pressable
              key={option}
              onPress={() => onChooseOption(option)}
              className="rounded-xl px-3 py-3 active:opacity-70 disabled:opacity-60"
              disabled={isInteractionLocked}
              style={{
                width: "100%",
                backgroundColor: isSelected
                  ? colors.primary
                  : colors.background,
                borderColor: isSelected ? colors.primary : colors.borderColor,
                borderWidth: 1,
              }}
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

      <View className="mt-4 flex-row justify-between">
        <Pressable
          className="rounded-xl bg-background px-4 py-2.5 active:opacity-70"
          style={{ borderColor: colors.borderColor, borderWidth: 1 }}
          onPress={onPrev}
          disabled={currentQuestionIndex === 0 || isInteractionLocked}
        >
          <Text className="font-fredokaSemiBold text-sm text-primaryText">
            {t("battle.prev")}
          </Text>
        </Pressable>

        {currentQuestionIndex < totalQuestions - 1 ? (
          <Pressable
            className="rounded-xl bg-primary px-4 py-2.5 active:opacity-70 disabled:opacity-60"
            onPress={onNext}
            disabled={isInteractionLocked}
          >
            <Text className="font-fredokaSemiBold text-sm text-whiteText">
              {t("battle.next")}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            className="rounded-xl bg-primary px-4 py-2.5 active:opacity-70 disabled:opacity-60"
            onPressIn={playBattleSubmitAnswerSfx}
            onPress={onSubmit}
            disabled={isInteractionLocked}
          >
            <Text className="font-fredokaSemiBold text-sm text-whiteText">
              {hasSubmitted ? t("battle.waitingForResult") : t("battle.submit")}
            </Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}
