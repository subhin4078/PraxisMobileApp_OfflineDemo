import {
  ProfileImageAssets,
  ProfileSvgAssets,
} from "@/src/constants/assets/profileAssets";
import type { ThemeColors } from "@/src/constants/theme";
import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { TFunction } from "i18next";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Achievement {
  id: string;
  nameKey: string;
  descKey: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
}

function AchievementCard({
  achievement,
  index,
  colors,
  t,
}: {
  achievement: Achievement;
  index: number;
  colors: ThemeColors;
  t: TFunction;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 150,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 150,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 150,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
    >
      <View
        className="overflow-hidden rounded-2xl border bg-surface p-4"
        style={{
          borderColor: colors.borderColor,
          opacity: achievement.unlocked ? 1 : 0.5,
        }}
      >
        <View className="flex-row items-center">
          {/* Icon */}
          <View
            className="mr-4 h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${achievement.color}20` }}
          >
            <ProfileSvgAssets.easyAchievementIcon width={28} height={28} />
          </View>

          {/* Text */}
          <View className="flex-1">
            <Text className="font-fredokaBold text-base text-primaryText">
              {t(achievement.nameKey)}
            </Text>
            <Text className="mt-0.5 font-fredoka text-xs text-secondaryText">
              {t(achievement.descKey)}
            </Text>
          </View>

          {/* Badge */}
          {achievement.unlocked && (
            <View className="h-8 w-8 items-center justify-center">
              <ProfileSvgAssets.paw width={30} height={30} />
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default function AchievementScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const achievements: Achievement[] = [
    {
      id: "first_join",
      nameKey: "achievement.firstJoin.name",
      descKey: "achievement.firstJoin.description",
      color: colors.achievementColorBlue,
      unlocked: true,
    },
    {
      id: "first_practice",
      nameKey: "achievement.firstPractice.name",
      descKey: "achievement.firstPractice.description",
      color: colors.achievementColorGreen,
      unlocked: false,
    },
    {
      id: "first_battle",
      nameKey: "achievement.firstBattle.name",
      descKey: "achievement.firstBattle.description",
      color: colors.primary,
      unlocked: false,
    },
  ];

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
          {t("achievement.title")}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Hero */}
        <View
          style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}
        >
          <View className="items-center">
            <Image
              source={ProfileImageAssets.achievement}
              className="h-36 w-72"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Achievement List */}
        <View className="gap-3 px-5 pt-2">
          {achievements.map((achievement, idx) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              index={idx}
              colors={colors}
              t={t}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
