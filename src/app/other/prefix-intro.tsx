import { useGetProgression } from "@/src/api/game/useGetProgression";
import { MathBackground } from "@/src/components/MathBackground";
import { PrefixImageAssets } from "@/src/constants/assets/homeAssets";
import { ALL_CAT_LEVELS, type CatKey } from "@/src/constants/catConstants";
import useTheme from "@/src/hooks/useTheme";
import useUserStore from "@/src/stores/useUserStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

// Index 0 = newbornCat (rank 1), index 8 = meowthematician (rank 9)
// Only non-color metadata lives here — colors are defined in theme.ts
const RANK_META: {
  titleSize: number;
  stars: number;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { titleSize: 16, stars: 0, icon: "paw" }, // 0 – Newborn Cat
  { titleSize: 17, stars: 1, icon: "search" }, // 1 – Curious Cat
  { titleSize: 17, stars: 1, icon: "bulb" }, // 2 – Smart Cat
  { titleSize: 18, stars: 2, icon: "flash" }, // 3 – Hunter Cat
  { titleSize: 18, stars: 2, icon: "book" }, // 4 – Scholar Cat
  { titleSize: 19, stars: 3, icon: "telescope" }, // 5 – Thinker Cat
  { titleSize: 19, stars: 3, icon: "shield" }, // 6 – Master Cat
  { titleSize: 20, stars: 4, icon: "skull" }, // 7 – Predator Cat
  { titleSize: 22, stars: 5, icon: "trophy" }, // 8 – Meowthematician
];

export default function PrefixIntroScreen() {
  const { colors } = useTheme();
  const c = colors as any;

  // All per-rank color data comes from theme
  const rankColors: {
    gradient: string[];
    borderColor: string;
    accentColor: string;
    iconColor: string;
    labelBg: string;
    labelText: string;
  }[] = c.prefixRankColors;

  const rainbowColors: string[] = c.prefixRainbowColors;

  // Smooth rainbow animation for legendary locked title
  const anim = useRef(new Animated.Value(0)).current;
  const stops = rainbowColors.length;
  const inputRange = rainbowColors.map((_, i) => i / stops).concat(1);
  const outputRange = [...rainbowColors, rainbowColors[0]];
  const animatedColor = anim.interpolate({ inputRange, outputRange });

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ).start();
  }, [anim]);

  const router = useRouter();
  const { t } = useTranslation();
  const { userId } = useUserStore();
  const { data } = useGetProgression(userId ?? "");
  const currentLevel = data?.progression?.level ?? 1;

  // Determine which cat key the user currently has
  function getCatIndex(level: number) {
    for (let i = ALL_CAT_LEVELS.length - 1; i >= 0; i--) {
      if (level >= ALL_CAT_LEVELS[i].minLevel) return i;
    }
    return 0;
  }
  const currentCatIndex = getCatIndex(currentLevel);

  // Show from highest to lowest (most epic at top)
  const reversed = [...ALL_CAT_LEVELS].reverse();

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top"]}
    >
      {/* Header */}
      <View
        className="flex-row items-center px-5 py-4"
        style={{ borderBottomWidth: 1, borderBottomColor: colors.borderColor }}
      >
        <Pressable className="active:opacity-70" onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.primaryText} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text className="font-fredokaSemiBold text-lg text-primaryText">
            {t("prefix.title")}
          </Text>
          <Text className="font-fredoka text-xs text-mutedText">
            {t("prefix.subtitle")}
          </Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingVertical: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {reversed.map((level) => {
          const idx = ALL_CAT_LEVELS.indexOf(level);
          const visual = RANK_META[idx];
          const rc = rankColors[idx];
          const isCurrentRank = idx === currentCatIndex;
          const isUnlocked = currentLevel >= level.minLevel;

          return (
            <Animated.View
              key={level.key}
              style={{
                borderRadius: 20,
                overflow: "hidden",
                borderWidth: isCurrentRank ? 2.5 : 1.5,
                borderColor:
                  idx === 8 && isUnlocked
                    ? animatedColor // Rainbow border for Meowthematician
                    : isCurrentRank
                      ? rc.borderColor
                      : isUnlocked
                        ? rc.borderColor + "99"
                        : colors.borderColor,
                shadowColor:
                  isCurrentRank && idx !== 8 ? rc.accentColor : "transparent",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isCurrentRank && idx !== 8 ? 0.4 : 0,
                shadowRadius: 12,
                elevation: isCurrentRank ? 8 : 2,
                opacity: isUnlocked ? 1 : 0.45,
              }}
            >
              {idx === 8 && isUnlocked ? (
                // MathBackground for Meowthematician
                <View style={{ position: "relative" }}>
                  <MathBackground
                    backgroundColor={[rc.gradient[0], rc.gradient[1]]}
                    symbolColor={colors.whiteText}
                  />
                  <View style={{ padding: 16, zIndex: 1 }}>
                    {/* Current rank indicator */}
                    {isCurrentRank && currentLevel < 80 && (
                      <View
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          backgroundColor: rc.accentColor,
                          borderRadius: 20,
                          paddingHorizontal: 10,
                          paddingVertical: 3,
                          zIndex: 2,
                        }}
                      >
                        <Text
                          style={{
                            color: colors.primaryText,
                            fontSize: 10,
                            fontFamily: "Fredoka_600SemiBold",
                          }}
                        >
                          {t("prefix.yourRank")}
                        </Text>
                      </View>
                    )}

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: 14,
                      }}
                    >
                      {/* Prefix image */}
                      <View
                        style={{
                          width: 96,
                          height: 96,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Image
                          source={PrefixImageAssets[idx]}
                          style={{
                            width: 96,
                            height: 96,
                            opacity: isUnlocked ? 1 : 0.4,
                          }}
                          resizeMode="contain"
                        />
                      </View>

                      {/* Text content */}
                      <View style={{ flex: 1 }}>
                        <Animated.Text
                          style={{
                            fontFamily: "Fredoka_700Bold",
                            fontSize: visual.titleSize,
                            color: animatedColor,
                            lineHeight: visual.titleSize + 4,
                            alignSelf: "flex-start",
                          }}
                        >
                          {t(`catLevel.${level.key}` as never)}
                        </Animated.Text>

                        <Text
                          style={{
                            fontFamily: "Fredoka_400Regular",
                            fontSize: 12,
                            color: colors.mutedText,
                            marginTop: 4,
                            lineHeight: 17,
                          }}
                        >
                          {t(`catLevel.${level.key}Desc` as never)}
                        </Text>

                        {/* Level range badge */}
                        <View
                          style={{
                            marginTop: 8,
                            alignSelf: "flex-start",
                            backgroundColor: rc.labelBg,
                            borderRadius: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "Fredoka_500Medium",
                              fontSize: 11,
                              color: rc.labelText,
                            }}
                          >
                            {t("prefix.levelRange", {
                              min: level.minLevel,
                              max: level.maxLevel ?? "∞",
                            })}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Shimmer bar */}
                    <View
                      style={{
                        marginTop: 12,
                        height: 3,
                        borderRadius: 2,
                        backgroundColor: rainbowColors[0] + "80",
                      }}
                    />

                    {/* Congratulatory message for highest rank (level >= 80) */}
                    {isCurrentRank && currentLevel >= 80 && (
                      <View style={{ marginTop: 10, paddingHorizontal: 8 }}>
                        <Text
                          style={{
                            fontFamily: "Fredoka_600SemiBold",
                            fontSize: 13,
                            color: rc.accentColor,
                            textAlign: "center",
                          }}
                        >
                          {t("prefix.congratsHighestRank")}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ) : (
                // LinearGradient for other ranks
                <LinearGradient
                  colors={
                    isUnlocked
                      ? (rc.gradient as [string, string])
                      : ([
                          c.prefixLockedGradientStart,
                          c.prefixLockedGradientEnd,
                        ] as [string, string])
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: 16 }}
                >
                  {/* Current rank indicator */}
                  {isCurrentRank && (
                    <View
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        backgroundColor: rc.accentColor,
                        borderRadius: 20,
                        paddingHorizontal: 10,
                        paddingVertical: 3,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.primaryText,
                          fontSize: 10,
                          fontFamily: "Fredoka_600SemiBold",
                        }}
                      >
                        {t("prefix.yourRank")}
                      </Text>
                    </View>
                  )}

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: 14,
                    }}
                  >
                    {/* Prefix image */}
                    <View
                      style={{
                        width: 96,
                        height: 96,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        source={PrefixImageAssets[idx]}
                        style={{
                          width: 96,
                          height: 96,
                          opacity: isUnlocked ? 1 : 0.4,
                        }}
                        resizeMode="contain"
                      />
                    </View>

                    {/* Text content */}
                    <View style={{ flex: 1 }}>
                      {idx === 8 ? (
                        <Animated.Text
                          style={{
                            fontFamily: "Fredoka_700Bold",
                            fontSize: visual.titleSize,
                            color: animatedColor,
                            lineHeight: visual.titleSize + 4,
                            alignSelf: "flex-start",
                          }}
                        >
                          {t(`catLevel.${level.key}` as never)}
                        </Animated.Text>
                      ) : (
                        <Text
                          style={{
                            fontFamily: "Fredoka_700Bold",
                            fontSize: visual.titleSize,
                            color: isUnlocked
                              ? rc.accentColor
                              : rc.accentColor + "66",
                            lineHeight: visual.titleSize + 4,
                          }}
                        >
                          {t(`catLevel.${level.key}` as never)}
                        </Text>
                      )}

                      <Text
                        style={{
                          fontFamily: "Fredoka_400Regular",
                          fontSize: 12,
                          color: isUnlocked
                            ? colors.mutedText
                            : c.prefixLockedDescText,
                          marginTop: 4,
                          lineHeight: 17,
                        }}
                      >
                        {t(`catLevel.${level.key}Desc` as never)}
                      </Text>

                      {/* Level range badge */}
                      <View
                        style={{
                          marginTop: 8,
                          alignSelf: "flex-start",
                          backgroundColor: isUnlocked
                            ? rc.labelBg
                            : c.prefixLockedBadgeBg,
                          borderRadius: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Fredoka_500Medium",
                            fontSize: 11,
                            color: isUnlocked
                              ? rc.labelText
                              : c.prefixLockedBadgeText,
                          }}
                        >
                          {t("prefix.levelRange", {
                            min: level.minLevel,
                            max: level.maxLevel ?? "∞",
                          })}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Legendary shimmer bar for top tiers */}
                  {idx >= 8 && (
                    <View
                      style={{
                        marginTop: 12,
                        height: 3,
                        borderRadius: 2,
                        backgroundColor: rc.borderColor + "80",
                      }}
                    />
                  )}
                </LinearGradient>
              )}
            </Animated.View>
          );
        })}

        {/* Footer note */}
        <View
          style={{
            alignItems: "center",
            paddingVertical: 8,
            paddingHorizontal: 16,
          }}
        >
          <Text
            style={{
              fontFamily: "Fredoka_400Regular",
              fontSize: 12,
              color: colors.mutedText,
              textAlign: "center",
            }}
          >
            {t("prefix.footer")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
