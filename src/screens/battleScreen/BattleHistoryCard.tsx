import { useGetBattle } from "@/src/api/battle/useGetBattle";
import { MarkdownMathText } from "@/src/components/MarkdownMathText";
import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

export function BattleHistoryCard({
  battleId,
  userId,
}: {
  battleId: string;
  userId: string;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { data, isLoading } = useGetBattle(userId, battleId);
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.borderColor,
        }}
      >
        <Text
          style={{
            fontFamily: "Fredoka_400Regular",
            fontSize: 13,
            color: colors.mutedText,
          }}
        >
          {t("common.loading")}
        </Text>
      </View>
    );
  }

  if (!data) return null;

  const participants = data.participants ?? [];
  const me = participants.find((p) => p.userId === userId);
  const opponent = participants.find((p) => p.userId !== userId);

  // Determine winner: try isWinner field first, then metadata.winner, then score comparison
  let isWinner: boolean;
  if (me?.isWinner !== undefined) {
    isWinner = me.isWinner;
  } else if (data.metadata?.winner) {
    isWinner = data.metadata.winner === userId;
  } else if (
    me &&
    opponent &&
    me.gainedMarks !== undefined &&
    me.gainedMarks !== null &&
    opponent.gainedMarks !== undefined &&
    opponent.gainedMarks !== null
  ) {
    isWinner = me.gainedMarks > opponent.gainedMarks;
  } else {
    isWinner = false;
  }

  const isDraw =
    !isWinner &&
    participants.length === 2 &&
    !participants[0]?.isWinner &&
    !participants[1]?.isWinner;

  const resultColor = isDraw
    ? colors.battleDraw
    : isWinner
      ? colors.battleWinColor
      : colors.battleLossColor;
  const resultLabel = isDraw
    ? t("battle.draw")
    : isWinner
      ? t("battle.victory")
      : t("battle.defeat");

  const formatTime = (ms?: number | null) => {
    if (!ms) return "--";
    const s = Math.round(ms / 1000);
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  const formatTimeAgo = (isoStringOrDate?: string | null) => {
    if (!isoStringOrDate) return "--";
    try {
      const date =
        typeof isoStringOrDate === "string"
          ? new Date(isoStringOrDate)
          : isoStringOrDate;
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (seconds < 60) return `${seconds}s ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return "--";
    }
  };

  // Extract topics from questions (deduplicate) or use top-level topics if available
  const topicsFromQuestions = Array.from(
    new Set(data.questions?.map((q) => q.topic).filter(Boolean) || []),
  );
  const topicDisplay =
    (data.topics?.length ? data.topics : topicsFromQuestions).join(", ") ||
    "--";
  const difficultyDisplay =
    data.difficulty || data.metadata?.difficulty || "--";
  const timeAgoDisplay = formatTimeAgo(data.metadata?.endedAt || data.endedAt);

  return (
    <Pressable onPress={() => setExpanded(!expanded)}>
      <View
        style={{
          backgroundColor: colors.battleHistoryCardBg,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1.5,
          borderColor: resultColor + "40",
          overflow: "hidden",
        }}
      >
        {/* Colored top accent bar */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: resultColor,
          }}
        />

        {/* Battle info: Topic, Difficulty, Time ago */}
        <View
          style={{
            marginBottom: 12,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderColor,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text
                style={{
                  fontFamily: "Fredoka_500Medium",
                  fontSize: 12,
                  color: colors.mutedText,
                }}
              >
                {t("battle.topic")}
              </Text>
              <View
                style={{
                  backgroundColor: colors.battleDifficultyBadgeColor + "20",
                  borderRadius: 2,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Fredoka_500Medium",
                    fontSize: 10,
                    color: colors.battleDifficultyBadgeColor,
                  }}
                >
                  {t("battle.difficulty")}: {difficultyDisplay}
                </Text>
              </View>
            </View>
            <Text
              style={{
                fontFamily: "Fredoka_500Medium",
                fontSize: 12,
                color: colors.mutedText,
              }}
            >
              {timeAgoDisplay}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 8,
            }}
          >
            {topicsFromQuestions.length > 0 ? (
              topicsFromQuestions.map((topic, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: colors.primary + "40",
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderWidth: 1,
                    borderColor: colors.primary + "60",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Fredoka_500Medium",
                      fontSize: 10,
                      color: colors.primary,
                    }}
                  >
                    {topic}
                  </Text>
                </View>
              ))
            ) : (
              <Text
                style={{
                  fontFamily: "Fredoka_400Regular",
                  fontSize: 10,
                  color: colors.mutedText,
                }}
              >
                --
              </Text>
            )}
          </View>
        </View>

        {/* Top row: us vs opponent */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          {/* Us */}
          <View style={{ alignItems: "center", flex: 1 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.battleMyColor + "20",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2.5,
                borderColor: colors.battleMyColor + "80",
              }}
            >
              <Ionicons name="person" size={24} color={colors.battleMyColor} />
            </View>
            <Text
              style={{
                fontFamily: "Fredoka_600SemiBold",
                fontSize: 11,
                color: colors.battleMyColor,
                marginTop: 6,
                fontWeight: "bold",
              }}
            >
              {t("battle.you")}
            </Text>
            <Text
              style={{
                fontFamily: "Fredoka_700Bold",
                fontSize: 18,
                color: colors.battleMyColor,
                marginTop: 2,
              }}
            >
              {me?.gainedMarks ?? 0}/{data.questions?.length ?? 0}
            </Text>
            <Text
              style={{
                fontFamily: "Fredoka_500Medium",
                fontSize: 10,
                color: colors.battleMyColor,
                marginTop: 2,
              }}
            >
              (
              {data.questions?.length
                ? `${Math.round(((me?.gainedMarks ?? 0) / data.questions.length) * 100)}%`
                : "--"}
              )
            </Text>
            <Text
              style={{
                fontFamily: "Fredoka_500Medium",
                fontSize: 9,
                color: colors.mutedText,
                marginTop: 6,
              }}
            >
              {formatTime(me?.timeSpentMs)}
            </Text>
          </View>

          {/* Result badge */}
          <View style={{ alignItems: "center", paddingHorizontal: 12 }}>
            <View>
              <Text
                style={{
                  fontFamily: "Fredoka_700Bold",
                  fontSize: 16,
                  color: resultColor,
                }}
              >
                {resultLabel}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: "Fredoka_400Regular",
                fontSize: 9,
                color: colors.mutedText,
                marginTop: 6,
              }}
            >
              {t("battle.historyVs")}
            </Text>
          </View>

          {/* Opponent */}
          <View style={{ alignItems: "center", flex: 1 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.battleOpponentColor + "20",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2.5,
                borderColor: colors.battleOpponentColor + "80",
              }}
            >
              <Ionicons
                name="person"
                size={24}
                color={colors.battleOpponentColor}
              />
            </View>
            <Text
              style={{
                fontFamily: "Fredoka_600SemiBold",
                fontSize: 11,
                color: colors.battleOpponentColor,
                marginTop: 6,
                fontWeight: "bold",
                marginRight: 2,
              }}
              numberOfLines={1}
            >
              {opponent?.username || "Opponent"}
            </Text>
            <Text
              style={{
                fontFamily: "Fredoka_700Bold",
                fontSize: 18,
                color: colors.battleOpponentColor,
                marginTop: 2,
              }}
            >
              {opponent?.gainedMarks ?? 0}/{data.questions?.length ?? 0}
            </Text>
            <Text
              style={{
                fontFamily: "Fredoka_500Medium",
                fontSize: 10,
                color: colors.battleOpponentColor,
                marginTop: 2,
              }}
            >
              (
              {data.questions?.length
                ? `${Math.round(((opponent?.gainedMarks ?? 0) / data.questions.length) * 100)}%`
                : "--"}
              )
            </Text>
            <Text
              style={{
                fontFamily: "Fredoka_500Medium",
                fontSize: 9,
                color: colors.mutedText,
                marginTop: 6,
              }}
            >
              {formatTime(opponent?.timeSpentMs)}
            </Text>
          </View>
        </View>

        {/* Expand indicator */}
        <View style={{ alignItems: "center", marginTop: 8 }}>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.mutedText}
          />
        </View>

        {/* Expanded: question details */}
        {expanded && data.questions && (
          <View
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: colors.borderColor,
            }}
          >
            {data.questions.map((q, idx) => {
              const myResult =
                me?.studentAnswers?.[idx] !== undefined
                  ? me.studentAnswers[idx]
                  : null;
              const isCorrect = q.answer ? myResult === q.answer : undefined;
              return (
                <View
                  key={idx}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: colors.borderColor,
                    borderLeftWidth: 4,
                    borderLeftColor:
                      isCorrect === true
                        ? colors.battleQuizCorrectColor
                        : isCorrect === false
                          ? colors.battleQuizWrongColor
                          : colors.primary,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor:
                          isCorrect === true
                            ? colors.battleQuizCorrectColor
                            : isCorrect === false
                              ? colors.battleQuizWrongColor
                              : colors.primary,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons
                        name={
                          isCorrect === true
                            ? "checkmark"
                            : isCorrect === false
                              ? "close"
                              : "help"
                        }
                        size={14}
                        color={colors.whiteText}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <MarkdownMathText
                        content={`Q${idx + 1}: ${q.question}`}
                        fontFamily="Fredoka_400Regular"
                        fontSize={12}
                        color={colors.blackText}
                      />
                    </View>
                  </View>
                  {q.answer && (
                    <View style={{ marginTop: 8, marginLeft: 32 }}>
                      <MarkdownMathText
                        content={
                          `Answer: ${q.answer}` +
                          (myResult && myResult !== q.answer
                            ? ` (Yours: ${myResult})`
                            : "")
                        }
                        fontFamily="Fredoka_400Regular"
                        fontSize={11}
                        color={colors.blackText}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </Pressable>
  );
}
