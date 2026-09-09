import { ConfettiCelebration } from "@/src/components/ConfettiCelebration";
import { ExpandableQuestionCard } from "@/src/components/ExpandableQuestionCard";
import { RewardsSummary } from "@/src/components/RewardsSummary";
import {
  BattleGifAssets,
  BattleImageAssets,
} from "@/src/constants/assets/battleAssets";
import useTheme from "@/src/hooks/useTheme";
import type {
  BattleEndedPayload,
  BattleQuestion,
  BattleResultItem,
} from "@/src/types/battle";
import { useTranslation } from "react-i18next";
import { Image, Pressable, Text, View } from "react-native";

interface BattleResultScreenProps {
  myResult: BattleResultItem | undefined;
  endedPayload: BattleEndedPayload | null;
  hasWinner: boolean;
  userId: string | null | undefined;
  questions: BattleQuestion[];
  mySubmittedAnswers: string[];
  expandedResultIndex: number | null;
  onToggleResultCard: (index: number) => void;
  onExit: () => void;
}

const formatTime = (ms: number | null | undefined) => {
  if (ms == null) return "--";
  const totalSeconds = Math.round(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

export function BattleResultScreen({
  myResult,
  endedPayload,
  hasWinner,
  userId,
  questions,
  mySubmittedAnswers,
  expandedResultIndex,
  onToggleResultCard,
  onExit,
}: BattleResultScreenProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const totalMarks = myResult?.totalMarks ?? questions.length;
  const gainedMarks = myResult?.gainedMarks ?? 0;

  return (
    <View>
      {myResult?.isWinner && <ConfettiCelebration />}

      {/* Score Card */}
      <View className="items-center rounded-2xl bg-surface p-6">
        {myResult?.isWinner ? (
          <Image
            source={BattleGifAssets.winner}
            style={{ width: 140, height: 140 }}
            resizeMode="contain"
          />
        ) : hasWinner ? (
          <Image
            source={BattleGifAssets.loser}
            style={{ width: 140, height: 140 }}
            resizeMode="contain"
          />
        ) : (
          <Image
            source={BattleImageAssets.draw}
            style={{ width: 140, height: 140 }}
            resizeMode="contain"
          />
        )}

        <Text className="mt-2 font-fredokaBold text-2xl text-primaryText">
          {myResult?.isWinner
            ? t("battle.youWon")
            : hasWinner
              ? t("battle.youLost")
              : t("battle.draw")}
        </Text>

        <View className="mt-4 flex-row gap-6">
          <View className="items-center">
            <Text className="font-fredokaBold text-xl text-practiceReviewCorrectBg">
              {gainedMarks}
            </Text>
            <Text className="font-fredoka text-xs text-mutedText">
              {t("practice.correct")}
            </Text>
          </View>
          <View className="items-center">
            <Text className="font-fredokaBold text-xl text-practiceReviewWrongBg">
              {totalMarks - gainedMarks}
            </Text>
            <Text className="font-fredoka text-xs text-mutedText">
              {t("practice.wrong")}
            </Text>
          </View>
          <View className="items-center">
            <Text className="font-fredokaBold text-xl text-primaryText">
              {formatTime(myResult?.timeSpentMs)}
            </Text>
            <Text className="font-fredoka text-xs text-mutedText">
              {t("practice.time")}
            </Text>
          </View>
        </View>
      </View>

      {/* Opponent Comparison */}
      {(endedPayload?.results?.length ?? 0) > 1 && (
        <View className="mt-4 gap-2">
          {(endedPayload?.results || []).map((result) => (
            <View
              key={result.userId || result.username}
              className="flex-row items-center justify-between rounded-xl p-3"
              style={{
                backgroundColor:
                  result.userId === userId
                    ? colors.primary
                    : colors.cardBackground,
                borderWidth: result.userId === userId ? 0 : 1,
                borderColor: colors.borderColor,
              }}
            >
              <Text
                className="font-fredokaSemiBold text-sm"
                style={{
                  color:
                    result.userId === userId
                      ? colors.whiteText
                      : colors.primaryText,
                }}
              >
                {result.username}
                {result.userId === userId ? ` (${t("battle.you")})` : ""}
              </Text>
              <Text
                className="font-fredokaSemiBold text-sm"
                style={{
                  color:
                    result.userId === userId
                      ? colors.whiteText
                      : colors.primaryText,
                }}
              >
                {result.gainedMarks}/{result.totalMarks} ·{" "}
                {formatTime(result.timeSpentMs)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Rewards summary */}
      <View className="mt-4">
        <RewardsSummary rewards={myResult?.rewards} />
      </View>

      {/* Review answers */}
      {!!myResult?.questionResults?.length && questions.length > 0 && (
        <>
          <Text className="mb-3 mt-6 font-fredokaSemiBold text-lg text-primaryText">
            {t("battle.reviewAnswers")}
          </Text>

          <View className="gap-3">
            {questions.map((question, idx) => {
              const questionResult = myResult.questionResults?.[idx];
              const isCorrect =
                questionResult?.isCorrect ??
                (!!question.answer &&
                  mySubmittedAnswers[idx] === question.answer);
              const correctAnswer =
                questionResult?.correctAnswer || question.answer;
              return (
                <ExpandableQuestionCard
                  key={`${question.question}-${idx}`}
                  questionText={question.question}
                  index={idx}
                  isExpanded={expandedResultIndex === idx}
                  onToggle={() => onToggleResultCard(idx)}
                  isCorrect={isCorrect}
                  studentAnswer={mySubmittedAnswers[idx]}
                  correctAnswer={correctAnswer}
                  solution={question.solution}
                  i18nNamespace="battle"
                />
              );
            })}
          </View>
        </>
      )}

      {/* Exit button */}
      <View className="mt-6">
        <Pressable
          className="items-center rounded-2xl bg-practiceStartButtonBg py-4 active:opacity-90"
          onPress={onExit}
        >
          <Text className="font-fredokaBold text-lg text-practiceStartButtonText">
            {t("battle.backHome")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
