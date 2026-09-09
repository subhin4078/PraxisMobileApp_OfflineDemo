import {
  type Difficulty,
  useCreatePractice,
} from "@/src/api/practice/useCreatePractice";
import useTheme from "@/src/hooks/useTheme";
import { useToast } from "@/src/hooks/useToast";
import useUserStore from "@/src/stores/useUserStore";
import { AVAILABLE_TOPICS, MathTopicsByArea } from "@/src/types/api";
import type { MathTopic } from "@/src/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  LayoutAnimation,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  View,
} from "react-native";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const MAX_TOPICS = 3;

const DIFFICULTIES: { key: Difficulty; color: string }[] = [
  { key: "easy", color: "bg-difficultyEasy" },
  { key: "hard", color: "bg-difficultyHard" },
  { key: "dse", color: "bg-difficultyDSE" },
];

export function PracticeCreateForm() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { userId } = useUserStore();
  const { mutateAsync: createPractice, isPending } = useCreatePractice(userId!);
  const toast = useToast();

  const [selectedTopics, setSelectedTopics] = useState<MathTopic[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [questionCount, setQuestionCount] = useState(10);
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState<"mc" | "wq">("mc");

  // Animation refs for each area
  const expandAnimations = useRef<Record<string, Animated.Value>>({});
  const getAnimationValue = (area: string) => {
    if (!expandAnimations.current[area]) {
      expandAnimations.current[area] = new Animated.Value(0);
    }
    return expandAnimations.current[area];
  };

  const toggleArea = useCallback(
    (area: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const isExpanding = expandedArea !== area;

      if (isExpanding) {
        Animated.timing(getAnimationValue(area), {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      } else {
        Animated.timing(getAnimationValue(area), {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }

      setExpandedArea((prev) => (prev === area ? null : area));
    },
    [expandedArea],
  );

  const toggleTopic = useCallback((topic: MathTopic) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topic)) return prev.filter((t) => t !== topic);
      if (prev.length >= MAX_TOPICS) return prev;
      return [...prev, topic];
    });
  }, []);

  const handleStart = useCallback(async () => {
    if (!userId) return;
    if (selectedTopics.length === 0) {
      toast.show(t("practice.selectAtLeastOne"), "warning");
      return;
    }
    try {
      const result = await createPractice({
        topics: selectedTopics,
        difficulty,
        questionType,
        amount: questionCount,
      });
      router.replace({
        pathname: "/practice/[id]",
        params: { id: result.practiceId },
      });
    } catch {
      // error handled by the hook's onError
    }
  }, [
    selectedTopics,
    difficulty,
    questionCount,
    questionType,
    userId,
    createPractice,
    router,
    toast,
    t,
  ]);

  const sliderTrackX = useRef(0);
  const sliderTrackWidth = useRef(0);
  const sliderTrackRef = useRef<View>(null);

  const questionCountRef = useRef(questionCount);
  questionCountRef.current = questionCount;

  const setQuestionCountRef = useRef(setQuestionCount);
  setQuestionCountRef.current = setQuestionCount;

  const computeQuestionCount = useCallback((pageX: number) => {
    const ratio =
      (pageX - sliderTrackX.current) / (sliderTrackWidth.current || 1);
    const clamped = Math.min(1, Math.max(0, ratio));
    return Math.round(clamped * 19) + 1;
  }, []);
  const computeRef = useRef(computeQuestionCount);
  computeRef.current = computeQuestionCount;

  const sliderPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        setQuestionCountRef.current(computeRef.current(e.nativeEvent.pageX));
      },
      onPanResponderMove: (e) => {
        setQuestionCountRef.current(computeRef.current(e.nativeEvent.pageX));
      },
    }),
  ).current;

  const isMaxReached = selectedTopics.length >= MAX_TOPICS;

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View className="px-5 pt-6">
        {/* Section: Topics */}
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="font-fredokaSemiBold text-lg text-primaryText">
            {t("practice.selectTopics")}
          </Text>
          <Text className="font-fredoka text-sm text-mutedText">
            {selectedTopics.length}/{MAX_TOPICS}
          </Text>
        </View>

        {/* Topics Grid - One Row */}
        <View className="mb-3 gap-2">
          {Object.entries(MathTopicsByArea).map(([area, topics]) => {
            const isExpanded = expandedArea === area;
            const areaTopicCount = topics.filter((t) =>
              selectedTopics.includes(t),
            ).length;
            const animationValue = getAnimationValue(area);
            const expandHeight = animationValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, topics.length * 48 + 16],
            });

            return (
              <View key={area}>
                {/* Area Header */}
                <Pressable
                  className={`flex-row items-center justify-between rounded-2xl p-4 active:opacity-70 ${
                    isExpanded
                      ? "bg-practiceAreaCardActiveBg"
                      : "bg-practiceAreaCardBg"
                  }`}
                  onPress={() => toggleArea(area)}
                >
                  <View className="flex-1 flex-row items-center gap-2">
                    <Text
                      className={`flex-1 font-fredokaSemiBold text-sm ${
                        isExpanded
                          ? "text-practiceAreaCardActiveText"
                          : "text-practiceAreaCardText"
                      }`}
                    >
                      {t(`mathAreas.${area}`, { defaultValue: area })}
                    </Text>
                    {areaTopicCount > 0 && (
                      <View className="rounded-full bg-practiceAreaBadgeBg px-2 py-0.5">
                        <Text className="font-fredokaBold text-xs text-practiceAreaBadgeText">
                          {areaTopicCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={
                      isExpanded
                        ? colors.practiceAreaCardActiveText
                        : colors.practiceAreaCardText
                    }
                  />
                </Pressable>

                {/* Expanded Topics List - Animated */}
                {isExpanded && (
                  <Animated.View
                    style={{
                      height: expandHeight,
                      overflow: "hidden",
                    }}
                  >
                    <View className="mt-2 gap-2 px-1 py-2">
                      {topics.map((topic) => {
                        const selected = selectedTopics.includes(topic);
                        const isSupported = AVAILABLE_TOPICS.includes(topic);
                        const disabled =
                          !isSupported || (!selected && isMaxReached);
                        return (
                          <Pressable
                            key={topic}
                            className={`flex-row items-center justify-between rounded-xl px-4 py-3 active:opacity-70 ${
                              disabled ? "opacity-40" : ""
                            }`}
                            style={{
                              backgroundColor: selected
                                ? colors.practiceTopicSelectedBg
                                : colors.practiceTopicDefaultBg,
                              borderWidth: 1,
                              borderColor: selected
                                ? colors.practiceTopicSelectedBorder
                                : colors.practiceTopicDefaultBorder,
                            }}
                            onPress={() => toggleTopic(topic)}
                            disabled={disabled}
                          >
                            <Text
                              className={`flex-1 font-fredokaSemiBold text-sm ${
                                selected
                                  ? "text-practiceTopicSelectedText"
                                  : "text-practiceTopicDefaultText"
                              }`}
                            >
                              {t(`mathTopics.${topic}`)}
                            </Text>
                            {selected && (
                              <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color={colors.practiceTopicSelectedText}
                              />
                            )}
                            {!isSupported && (
                              <Ionicons
                                name="lock-closed"
                                size={16}
                                color={colors.mutedText}
                              />
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  </Animated.View>
                )}
              </View>
            );
          })}
        </View>

        {/* Section: Difficulty */}
        <Text className="mb-3 mt-6 font-fredokaSemiBold text-lg text-primaryText">
          {t("practice.selectDifficulty")}
        </Text>
        <View className="flex-row gap-3">
          {DIFFICULTIES.map((d) => {
            const selected = difficulty === d.key;
            return (
              <Pressable
                key={d.key}
                className={`flex-1 items-center rounded-2xl py-3 active:opacity-70 ${
                  selected ? d.color : "bg-practiceDifficultyDefaultBg"
                }`}
                style={
                  !selected
                    ? {
                        borderWidth: 1,
                        borderColor: colors.borderColor,
                      }
                    : undefined
                }
                onPress={() => setDifficulty(d.key)}
              >
                <Text
                  className={`font-fredokaSemiBold text-sm ${
                    selected
                      ? "text-whiteText"
                      : "text-practiceDifficultyDefaultText"
                  }`}
                >
                  {t(`practice.difficulty.${d.key}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Section: Question Count Slider */}
        <Text className="mb-3 mt-6 font-fredokaSemiBold text-lg text-primaryText">
          {t("practice.questionCount")}
        </Text>
        <View className="mb-2 items-center gap-4 rounded-2xl bg-surface p-4">
          <View className="flex-row items-center gap-4">
            <Pressable
              className="items-center justify-center rounded-xl bg-practiceCountDefaultBg p-3 active:opacity-70"
              onPress={() => setQuestionCount(Math.max(1, questionCount - 1))}
            >
              <Ionicons name="remove" size={24} color={colors.primaryText} />
            </Pressable>
            <Text className="min-w-24 text-center font-fredokaBold text-4xl text-primary">
              {questionCount}
            </Text>
            <Pressable
              className="items-center justify-center rounded-xl bg-cardBackground p-3 active:opacity-70"
              onPress={() => setQuestionCount(Math.min(20, questionCount + 1))}
            >
              <Ionicons name="add" size={24} color={colors.primaryText} />
            </Pressable>
          </View>
          <View
            ref={sliderTrackRef}
            className="h-3 w-full rounded-full bg-borderColor"
            onLayout={(e) => {
              sliderTrackWidth.current = e.nativeEvent.layout.width;
              sliderTrackRef.current?.measureInWindow((x) => {
                sliderTrackX.current = x;
              });
            }}
            {...sliderPanResponder.panHandlers}
          >
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${((questionCount - 1) / 19) * 100}%` }}
            />
            <View
              style={{
                position: "absolute",
                left: `${((questionCount - 1) / 19) * 100}%`,
                top: -4,
                marginLeft: -10,
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: colors.primary,
                borderWidth: 2,
                borderColor: colors.whiteText,
              }}
            />
          </View>
          <View className="w-full flex-row justify-between gap-2">
            <Text className="font-fredoka text-xs text-mutedText">
              1 question
            </Text>
            <Text className="font-fredoka text-xs text-mutedText">
              20 questions
            </Text>
          </View>
        </View>

        {/* Section: Question Type */}
        <Text className="mb-3 mt-6 font-fredokaSemiBold text-lg text-primaryText">
          {t("practice.questionType")}
        </Text>
        <View className="flex-row gap-3">
          <Pressable
            className={`flex-1 items-center rounded-2xl py-3 active:opacity-70 ${
              questionType === "mc"
                ? "bg-primary"
                : "bg-practiceDifficultyDefaultBg"
            }`}
            style={
              questionType !== "mc"
                ? { borderWidth: 1, borderColor: colors.borderColor }
                : undefined
            }
            onPress={() => setQuestionType("mc")}
          >
            <Text
              className={`font-fredokaSemiBold text-sm ${
                questionType === "mc"
                  ? "text-whiteText"
                  : "text-practiceDifficultyDefaultText"
              }`}
            >
              {t("practice.multipleChoice")}
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 items-center rounded-2xl py-3 active:opacity-70 ${
              questionType === "wq"
                ? "bg-primary"
                : "bg-practiceDifficultyDefaultBg"
            }`}
            style={
              questionType !== "wq"
                ? { borderWidth: 1, borderColor: colors.borderColor }
                : undefined
            }
            onPress={() => setQuestionType("wq")}
          >
            <Text
              className={`font-fredokaSemiBold text-sm ${
                questionType === "wq"
                  ? "text-whiteText"
                  : "text-practiceDifficultyDefaultText"
              }`}
            >
              {t("practice.written")}
            </Text>
          </Pressable>
        </View>

        {/* Start Button */}
        <Pressable
          onPress={handleStart}
          disabled={selectedTopics.length === 0 || isPending}
          className={`mt-8 items-center rounded-2xl py-4 active:opacity-90 ${
            selectedTopics.length > 0
              ? "bg-practiceStartButtonBg"
              : "bg-practiceStartDisabledBg"
          }`}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons
              name="rocket"
              size={20}
              color={colors.practiceStartButtonText}
            />
            <Text className="font-fredokaBold text-lg text-practiceStartButtonText">
              {isPending
                ? t("practice.submitting")
                : t("practice.startPractice")}
            </Text>
          </View>
        </Pressable>

        {selectedTopics.length === 0 && (
          <Text className="mt-2 text-center font-fredoka text-sm text-mutedText">
            {t("practice.selectAtLeastOne")}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
