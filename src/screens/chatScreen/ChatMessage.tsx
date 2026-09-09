import pawLoadingLottie from "@/assets/animations/common/paw_loading.json";
import { Message, StructuredContent } from "@/src/api/chat/useGetMessages";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import { MarkdownMathText } from "@/src/components/MarkdownMathText";
import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Easing, Pressable, Text, View } from "react-native";

function WaveText({ text, color }: { text: string; color: string }) {
  const letters = text.split("");
  const anims = useRef(letters.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 80),
          Animated.timing(anim, {
            toValue: -4,
            duration: 250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(Math.max(0, (letters.length - i - 1) * 80 + 400)),
        ]),
      ),
    );
    Animated.parallel(animations).start();
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={{ flexDirection: "row" }}>
      {letters.map((char, i) => (
        <Animated.Text
          key={i}
          style={{
            fontFamily: "Fredoka_400Regular",
            fontSize: 14,
            color,
            transform: [{ translateY: anims[i] }],
          }}
        >
          {char}
        </Animated.Text>
      ))}
    </View>
  );
}

interface DisplayMessage extends Message {
  isLoading?: boolean;
}

interface ChatMessageProps {
  message: DisplayMessage;
  index: number;
  onGenerateFollowUp?: () => void;
  isGeneratingFollowUp?: boolean;
}

/** Collapsible card section */
function CollapsibleCard({
  title,
  count,
  children,
  defaultOpen = false,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { colors } = useTheme();

  return (
    <View
      className="mt-3 overflow-hidden rounded-xl"
      style={{
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.borderColor,
      }}
    >
      <Pressable
        className="flex-row items-center justify-between px-4 py-3"
        onPress={() => setIsOpen(!isOpen)}
      >
        <View className="flex-row items-center gap-2">
          <Text
            className="font-fredokaSemiBold text-xs tracking-wider"
            style={{ color: colors.primaryText }}
          >
            {title}
          </Text>
          {count !== undefined && (
            <Text
              className="font-fredoka text-xs"
              style={{ color: colors.mutedText }}
            >
              ({count})
            </Text>
          )}
        </View>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.mutedText}
        />
      </Pressable>
      {isOpen && (
        <View
          className="px-4 pb-4"
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.borderColor,
          }}
        >
          {children}
        </View>
      )}
    </View>
  );
}

/** A static (non-collapsible) card section */
function StaticCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <View
      className="mt-3 overflow-hidden rounded-xl"
      style={{
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.borderColor,
      }}
    >
      <View className="px-4 py-3">
        <Text
          className="mb-2 font-fredokaSemiBold text-xs tracking-wider"
          style={{ color: colors.primaryText }}
        >
          {title}
        </Text>
        {children}
      </View>
    </View>
  );
}

/** Renders the structured problem-solving response */
function ProblemSolvingContent({
  content,
  onGenerateFollowUp,
  isGeneratingFollowUp,
}: {
  content: StructuredContent;
  onGenerateFollowUp?: () => void;
  isGeneratingFollowUp?: boolean;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const ps = content.problemSolving;
  const [showKeyTerms, setShowKeyTerms] = useState(false);
  const [showCommonMistakes, setShowCommonMistakes] = useState(false);

  if (!ps) return null;

  return (
    <View>
      {/* Type Badge */}
      <View className="mb-2 flex-row items-center gap-1.5">
        <Ionicons name="book-outline" size={14} color={colors.primary} />
        <Text
          className="font-fredokaSemiBold text-xs"
          style={{ color: colors.primary }}
        >
          {t("chat.responseType.problemSolving")}
        </Text>
      </View>

      {/* Restated Problem */}
      {ps.restatedProblem && (
        <MarkdownMathText
          content={ps.restatedProblem}
          fontFamily="Fredoka_400Regular"
          fontSize={15}
          color={colors.primaryText}
        />
      )}

      {/* Solution Steps */}
      {ps.solutionSteps && ps.solutionSteps.length > 0 && (
        <CollapsibleCard
          title={t("chat.solutionSteps")}
          count={ps.solutionSteps.length}
          defaultOpen
        >
          {ps.solutionSteps.map((step: string, i: number) => {
            // Extract the first complete $$...$$ block (possibly multi-line) from the step.
            // Splitting at \n$$ was incorrect for steps that ARE the formula block
            // (e.g. "$$\n5(h - 3) = k(h + k)\n$$"), causing the opening $$ to end
            // up in headerPart and the closing $$ in formulaPart (both broken).
            const mathBlockRegex = /^([\s\S]*?)(\$\$[\s\S]*?\$\$)/;
            const match = step.match(mathBlockRegex);
            const headerPart = match ? match[1] : step;
            const formulaPart = match ? match[2] : null;

            return (
              <View key={i} className="mt-3">
                {headerPart.trim().length > 0 && (
                  <MarkdownMathText
                    content={headerPart}
                    fontFamily="Fredoka_400Regular"
                    fontSize={14}
                    color={colors.primaryText}
                  />
                )}
                {formulaPart && (
                  <MarkdownMathText
                    content={formulaPart}
                    fontFamily="Fredoka_400Regular"
                    fontSize={14}
                    color={colors.primaryText}
                  />
                )}
              </View>
            );
          })}
        </CollapsibleCard>
      )}

      {/* Final Answer */}
      {ps.finalAnswer && (
        <StaticCard title={t("chat.finalAnswer")}>
          <MarkdownMathText
            content={`${ps.finalAnswer}`}
            fontFamily="Fredoka_400Regular"
            fontSize={15}
            color={colors.primaryText}
          />
        </StaticCard>
      )}

      {/* Key Terms (toggled) */}
      {showKeyTerms && ps.termExplanation && (
        <StaticCard title={t("chat.keyTerms")}>
          <MarkdownMathText
            content={ps.termExplanation}
            fontFamily="Fredoka_400Regular"
            fontSize={14}
            color={colors.primaryText}
          />
        </StaticCard>
      )}

      {/* Common Mistakes (toggled) */}
      {showCommonMistakes &&
        ps.commonMistakes &&
        ps.commonMistakes.length > 0 && (
          <StaticCard title={t("chat.commonMistakes")}>
            {ps.commonMistakes.map((mistake: string, i: number) => (
              <View key={i} className="mt-2 flex-row items-start gap-2">
                <Ionicons
                  name="alert-circle-outline"
                  size={14}
                  color={colors.primary}
                  style={{ marginTop: 2 }}
                />
                <View className="flex-1">
                  <MarkdownMathText
                    content={mistake}
                    fontFamily="Fredoka_400Regular"
                    fontSize={14}
                    color={colors.primaryText}
                  />
                </View>
              </View>
            ))}
          </StaticCard>
        )}

      {/* Action Buttons */}
      <View className="mt-4 flex-row flex-wrap gap-2">
        <Pressable
          className="flex-row items-center gap-1.5 rounded-full px-4 py-2 active:opacity-70"
          style={{
            backgroundColor: showKeyTerms
              ? colors.primary
              : `${colors.primary}15`,
          }}
          onPress={() => setShowKeyTerms(!showKeyTerms)}
        >
          <Ionicons
            name="book-outline"
            size={13}
            color={showKeyTerms ? colors.whiteText : colors.primary}
          />
          <Text
            className="font-fredokaSemiBold text-xs"
            style={{
              color: showKeyTerms ? colors.whiteText : colors.primary,
            }}
          >
            {t("chat.keyTerms")}
          </Text>
        </Pressable>

        <Pressable
          className="flex-row items-center gap-1.5 rounded-full px-4 py-2 active:opacity-70"
          style={{
            backgroundColor: showCommonMistakes
              ? colors.primary
              : `${colors.primary}15`,
          }}
          onPress={() => setShowCommonMistakes(!showCommonMistakes)}
        >
          <Ionicons
            name="warning-outline"
            size={13}
            color={showCommonMistakes ? colors.whiteText : colors.primary}
          />
          <Text
            className="font-fredokaSemiBold text-xs"
            style={{
              color: showCommonMistakes ? colors.whiteText : colors.primary,
            }}
          >
            {t("chat.commonMistakes")}
          </Text>
        </Pressable>

        <Pressable
          className="flex-row items-center gap-1.5 rounded-full px-4 py-2 active:opacity-70"
          style={{
            backgroundColor: colors.primary,
            opacity: isGeneratingFollowUp ? 0.6 : 1,
          }}
          onPress={onGenerateFollowUp}
          disabled={!onGenerateFollowUp || isGeneratingFollowUp}
        >
          <Ionicons
            name="help-circle-outline"
            size={13}
            color={colors.whiteText}
          />
          <Text
            className="font-fredokaSemiBold text-xs"
            style={{ color: colors.whiteText }}
          >
            {isGeneratingFollowUp
              ? t("chat.generating")
              : t("chat.generateFollowUp")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Renders the structured concept explanation response */
function ConceptExplanationContent({
  content,
}: {
  content: StructuredContent;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const ce = content.conceptExplanation;
  const [showKeyTerms, setShowKeyTerms] = useState(false);
  const [showCommonMistakes, setShowCommonMistakes] = useState(false);

  if (!ce) return null;

  return (
    <View>
      {/* Type Badge */}
      <View className="mb-2 flex-row items-center gap-1.5">
        <Ionicons name="bulb-outline" size={14} color={colors.primary} />
        <Text
          className="font-fredokaSemiBold text-xs"
          style={{ color: colors.primary }}
        >
          {t("chat.responseType.conceptExplanation")}
        </Text>
      </View>

      {/* Concept Overview */}
      {ce.conceptOverview && (
        <MarkdownMathText
          content={ce.conceptOverview}
          fontFamily="Fredoka_400Regular"
          fontSize={15}
          color={colors.primaryText}
        />
      )}

      {/* Equations */}
      {ce.equations && (
        <StaticCard title={t("chat.equations")}>
          <MarkdownMathText
            content={ce.equations}
            fontFamily="Fredoka_400Regular"
            fontSize={14}
            color={colors.primaryText}
          />
        </StaticCard>
      )}

      {/* Example Problem */}
      {ce.exampleProblem && (
        <StaticCard title={t("chat.exampleProblem")}>
          <MarkdownMathText
            content={ce.exampleProblem}
            fontFamily="Fredoka_400Regular"
            fontSize={14}
            color={colors.primaryText}
          />
        </StaticCard>
      )}

      {/* Key Terms (toggled) */}
      {showKeyTerms && ce.keyTerms && (
        <StaticCard title={t("chat.keyTerms")}>
          <MarkdownMathText
            content={ce.keyTerms}
            fontFamily="Fredoka_400Regular"
            fontSize={14}
            color={colors.primaryText}
          />
        </StaticCard>
      )}

      {/* Common Mistakes (toggled) */}
      {showCommonMistakes &&
        ce.commonMistakes &&
        ce.commonMistakes.length > 0 && (
          <StaticCard title={t("chat.commonMistakes")}>
            {ce.commonMistakes.map((mistake: string, i: number) => (
              <View key={i} className="mt-2 flex-row items-start gap-2">
                <Ionicons
                  name="alert-circle-outline"
                  size={14}
                  color={colors.primary}
                  style={{ marginTop: 2 }}
                />
                <View className="flex-1">
                  <MarkdownMathText
                    content={mistake}
                    fontFamily="Fredoka_400Regular"
                    fontSize={14}
                    color={colors.primaryText}
                  />
                </View>
              </View>
            ))}
          </StaticCard>
        )}

      {/* Action Buttons */}
      <View className="mt-4 flex-row flex-wrap gap-2">
        {ce.keyTerms && (
          <Pressable
            className="flex-row items-center gap-1.5 rounded-full px-4 py-2 active:opacity-70"
            style={{
              backgroundColor: showKeyTerms
                ? colors.primary
                : `${colors.primary}15`,
            }}
            onPress={() => setShowKeyTerms(!showKeyTerms)}
          >
            <Ionicons
              name="book-outline"
              size={13}
              color={showKeyTerms ? colors.whiteText : colors.primary}
            />
            <Text
              className="font-fredokaSemiBold text-xs"
              style={{
                color: showKeyTerms ? colors.whiteText : colors.primary,
              }}
            >
              {t("chat.keyTerms")}
            </Text>
          </Pressable>
        )}

        {ce.commonMistakes && ce.commonMistakes.length > 0 && (
          <Pressable
            className="flex-row items-center gap-1.5 rounded-full px-4 py-2 active:opacity-70"
            style={{
              backgroundColor: showCommonMistakes
                ? colors.primary
                : `${colors.primary}15`,
            }}
            onPress={() => setShowCommonMistakes(!showCommonMistakes)}
          >
            <Ionicons
              name="warning-outline"
              size={13}
              color={showCommonMistakes ? colors.whiteText : colors.primary}
            />
            <Text
              className="font-fredokaSemiBold text-xs"
              style={{
                color: showCommonMistakes ? colors.whiteText : colors.primary,
              }}
            >
              {t("chat.commonMistakes")}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function ChatMessage({
  message,
  onGenerateFollowUp,
  isGeneratingFollowUp,
}: ChatMessageProps) {
  const { colors } = useTheme();
  const { i18n, t } = useTranslation();

  const isUser = message.role === "user";

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(i18n.language, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle loading state
  if (message.isLoading) {
    return (
      <View className="mb-3 flex-row justify-start">
        <View className="max-w-[80%] items-start">
          <View
            className="flex-row items-center gap-1 rounded-2xl rounded-bl-sm px-3 py-2"
            style={{ backgroundColor: colors.surface }}
          >
            <LottieView
              source={pawLoadingLottie}
              style={{ width: 24, height: 24 }}
              autoPlay
              loop
            />
            <WaveText text={t("chat.thinking")} color={colors.secondaryText} />
          </View>
        </View>
      </View>
    );
  }

  // Check if content is structured
  const isStructured =
    !isUser &&
    typeof message.content === "object" &&
    message.content !== null &&
    "inputType" in message.content;

  const structuredContent = isStructured
    ? (message.content as unknown as StructuredContent)
    : null;

  // Detect math-unrelated response
  if (structuredContent?.inputType === "mathUnrelated") {
    return (
      <View className="mb-3 flex-row justify-start" style={{ minWidth: 0 }}>
        <View
          className="max-w-[85%] items-start"
          style={{ minWidth: 0, flexShrink: 1 }}
        >
          <View
            className="rounded-2xl rounded-bl-sm px-4 py-3"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="font-fredokaRegular text-base text-primaryText">
              {t("chat.mathUnrelatedResponse")}
            </Text>
          </View>
          <View className="mt-1 flex-row items-center gap-1">
            <Ionicons name="sparkles" size={12} color={colors.secondaryText} />
            <Text className="font-fredokaRegular text-xs text-secondaryText">
              {formatTime(message.timestamp)}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Render structured AI response with cards
  if (structuredContent && !isUser) {
    const hasProblemSolving =
      structuredContent.inputType === "problemSolving" &&
      structuredContent.problemSolving;
    const hasConceptExplanation =
      structuredContent.inputType === "conceptExplanation" &&
      structuredContent.conceptExplanation;

    if (hasProblemSolving || hasConceptExplanation) {
      return (
        <View className="mb-4" style={{ minWidth: 0 }}>
          <View
            className="rounded-2xl px-4 py-4"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.borderColor,
            }}
          >
            {hasProblemSolving && (
              <ProblemSolvingContent
                content={structuredContent}
                onGenerateFollowUp={onGenerateFollowUp}
                isGeneratingFollowUp={isGeneratingFollowUp}
              />
            )}
            {hasConceptExplanation && (
              <ConceptExplanationContent content={structuredContent} />
            )}
          </View>
          <View className="mt-1 flex-row items-center gap-1 px-1">
            <Ionicons name="sparkles" size={12} color={colors.secondaryText} />
            <Text className="font-fredokaRegular text-xs text-secondaryText">
              {formatTime(message.timestamp)}
            </Text>
          </View>
        </View>
      );
    }

    // Flat structured response (has inputType + response string, but no sub-objects)
    const flatResponse =
      "response" in structuredContent &&
      typeof structuredContent.response === "string"
        ? structuredContent.response
        : null;

    if (flatResponse) {
      return (
        <View className="mb-4" style={{ minWidth: 0 }}>
          <View
            className="rounded-2xl px-4 py-4"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.borderColor,
            }}
          >
            {/* Type Badge */}
            <View className="mb-2 flex-row items-center gap-1.5">
              <Ionicons
                name={
                  structuredContent.inputType === "conceptExplanation"
                    ? "bulb-outline"
                    : "book-outline"
                }
                size={14}
                color={colors.primary}
              />
              <Text
                className="font-fredokaSemiBold text-xs"
                style={{ color: colors.primary }}
              >
                {structuredContent.inputType === "conceptExplanation"
                  ? t("chat.responseType.conceptExplanation")
                  : t("chat.responseType.problemSolving")}
              </Text>
            </View>

            <MarkdownMathText
              content={flatResponse}
              fontFamily="Fredoka_400Regular"
              fontSize={15}
              color={colors.primaryText}
            />

            {/* Generate Follow-up Button — only for problemSolving */}
            {onGenerateFollowUp &&
              structuredContent.inputType === "problemSolving" && (
                <View className="mt-4 flex-row flex-wrap gap-2">
                  <Pressable
                    className="flex-row items-center gap-1.5 rounded-lg px-3 py-2 active:opacity-70"
                    style={{
                      backgroundColor: colors.primary + "15",
                      borderWidth: 1,
                      borderColor: colors.primary,
                    }}
                    onPress={onGenerateFollowUp}
                    disabled={isGeneratingFollowUp}
                  >
                    <Ionicons
                      name="help-circle-outline"
                      size={14}
                      color={colors.primary}
                    />
                    <Text
                      className="font-fredokaMedium text-xs"
                      style={{ color: colors.primary }}
                    >
                      {isGeneratingFollowUp
                        ? t("chat.generating")
                        : t("chat.generateFollowUp")}
                    </Text>
                  </Pressable>
                </View>
              )}
          </View>
          <View className="mt-1 flex-row items-center gap-1 px-1">
            <Ionicons name="sparkles" size={12} color={colors.secondaryText} />
            <Text className="font-fredokaRegular text-xs text-secondaryText">
              {formatTime(message.timestamp)}
            </Text>
          </View>
        </View>
      );
    }
  }

  // Fallback: plain text for user messages or simple AI responses
  const getMessageText = () => {
    if (typeof message.content === "string") {
      return message.content;
    }
    if (typeof message.content === "object" && message.content !== null) {
      if (
        "response" in message.content &&
        typeof message.content.response === "string"
      ) {
        return message.content.response;
      }
      return JSON.stringify(message.content, null, 2);
    }
    return "No content";
  };

  return (
    <View
      className={`mb-3 flex-row ${isUser ? "justify-end" : "justify-start"}`}
      style={{ minWidth: 0 }}
    >
      <View
        className={`max-w-[80%] ${isUser ? "items-end" : "items-start"}`}
        style={{ minWidth: 0, flexShrink: 1 }}
      >
        <View
          className={`rounded-2xl px-4 py-3 ${
            isUser ? "rounded-br-sm" : "rounded-bl-sm"
          }`}
          style={{
            backgroundColor: isUser ? colors.primary : colors.surface,
            maxWidth: "100%",
            minWidth: 0,
            flexShrink: 1,
            alignSelf: "stretch",
          }}
        >
          <MarkdownMathText
            content={getMessageText()}
            fontFamily="Fredoka_400Regular"
            fontSize={16}
            color={isUser ? colors.whiteText : colors.primaryText}
            containerStyle={{ width: "100%", minWidth: 0, flexShrink: 1 }}
            flavor={isUser ? "commonmark" : "github"}
          />
        </View>
        <View className="mt-1 flex-row items-center gap-1">
          {!isUser && (
            <Ionicons name="sparkles" size={12} color={colors.secondaryText} />
          )}
          <Text className="font-fredokaRegular text-xs text-secondaryText">
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    </View>
  );
}
