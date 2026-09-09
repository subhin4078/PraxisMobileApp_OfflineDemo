import { useGetDailyStreak } from "@/src/api/user/useGetDailyStreak";
import { HomeImageAssets } from "@/src/constants/assets/homeAssets";
import { ShopImageAssets } from "@/src/constants/assets/shopAssets";
import useTheme from "@/src/hooks/useTheme";
import useUserStore from "@/src/stores/useUserStore";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Image, Pressable, Text, View } from "react-native";

const DAY_BONUS = [5, 5, 5, 10, 10, 15, 20];

function formatStartDate(dateStr: string | null, lang: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString(
    lang.toLowerCase().startsWith("zh") ? "zh-HK" : "en-US",
    { month: "short", day: "numeric", year: "numeric" },
  );
}

export function HomeStatsGrid() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { userId } = useUserStore();

  const rawDayLabels = t("home.dayLabels", { returnObjects: true });
  const DAY_LABELS: string[] = Array.isArray(rawDayLabels)
    ? rawDayLabels
    : ["M", "T", "W", "T", "F", "S", "S"];

  const { data: streakData } = useGetDailyStreak(userId || "");

  const streak = streakData?.currentStreak ?? 0;
  const longestStreak = streakData?.longestStreak ?? 0;
  const startDate = streakData?.startDate ?? null;
  const weekCompleted = streakData?.weekCompletedExercises ?? 0;

  const formattedStart = formatStartDate(startDate, i18n.language);
  const [expanded, setExpanded] = useState(true);
  const animated = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded, animated]);

  return (
    <View className="mb-5">
      <View
        className="overflow-hidden rounded-3xl"
        style={{ backgroundColor: colors.surface }}
      >
        {/* ── Top: streak number + cat image ────────────────── */}
        <View className="flex-row items-start justify-between px-5 pt-5">
          {/* Left: text info */}
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text
              className="font-fredokaSemiBold text-mutedText"
              style={{
                fontSize: 11,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              {t("home.dayStreak")}
            </Text>

            <View
              style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}
            >
              <Text
                className="font-fredokaBold text-primary"
                style={{ fontSize: 52, lineHeight: 56 }}
              >
                {streak}
              </Text>
              <Text className="font-fredokaSemiBold text-xl text-primaryText">
                {t("home.streakDays")}
              </Text>
            </View>

            {formattedStart ? (
              <Text
                className="font-fredoka text-mutedText"
                style={{ fontSize: 12, marginTop: 2 }}
              >
                {t("home.streakSince", { date: formattedStart })}
              </Text>
            ) : null}

            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: colors.primary + "1A",
                  borderRadius: 99,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text
                  className="font-fredokaSemiBold text-primary"
                  style={{ fontSize: 12 }}
                >
                  {t("home.longestRecord", { count: longestStreak })}
                </Text>
              </View>
            </View>
          </View>

          {/* Right: cat image */}
          <View style={{ alignItems: "center" }}>
            <Image
              source={HomeImageAssets.daystreak}
              style={{ width: 150, height: 130, marginTop: -4 }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ── Divider + expand toggle ───────────────────────── */}
        <Pressable
          onPress={() => setExpanded((v) => !v)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 20,
            marginTop: 14,
            marginBottom: expanded ? 14 : 16,
            gap: 8,
          }}
        >
          <View
            style={{ flex: 1, height: 1, backgroundColor: colors.borderColor }}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: colors.background,
              borderRadius: 99,
              borderWidth: 1,
              borderColor: colors.borderColor,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text
              className="font-fredokaMedium text-mutedText"
              style={{ fontSize: 11 }}
            >
              {expanded ? t("common.hide") : t("home.weeklyBonus")}
            </Text>
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={12}
              color={colors.mutedText}
            />
          </View>
          <View
            style={{ flex: 1, height: 1, backgroundColor: colors.borderColor }}
          />
        </Pressable>

        {/* ── Weekly bonus (animated collapse) ─────────────── */}
        {/* maxHeight animation avoids the onLayout chicken-and-egg problem
            (height:0 + overflow:hidden prevents children from being laid out
            on Fabric, so onLayout never fires and measured height stays 0). */}
        <Animated.View
          style={{
            maxHeight: animated.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 400],
            }),
            opacity: animated,
            overflow: "hidden",
          }}
        >
          <View>
            <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  className="font-fredokaSemiBold text-primaryText"
                  style={{ fontSize: 13, flex: 1 }}
                >
                  {t("home.weeklyBonusDesc")}
                </Text>
                <Text
                  className="font-fredokaBold text-primary"
                  style={{ fontSize: 13, marginLeft: 8 }}
                >
                  {weekCompleted}/7
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                {DAY_LABELS.map((label, i) => {
                  const done = i < weekCompleted;
                  const bonus = DAY_BONUS[i];
                  return (
                    <View
                      key={i}
                      style={{ alignItems: "center", gap: 3, flex: 1 }}
                    >
                      <Text
                        className="font-fredokaMedium"
                        style={{
                          fontSize: 11,
                          color: done ? colors.primary : colors.mutedText,
                        }}
                      >
                        {label}
                      </Text>
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          backgroundColor: done
                            ? colors.primary
                            : colors.mutedText + "20",
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: done ? 0 : 1,
                          borderColor: colors.borderColor,
                        }}
                      >
                        {done ? (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color={colors.whiteText}
                          />
                        ) : (
                          <Image
                            source={ShopImageAssets.pawCoin5x}
                            style={{ width: 30, height: 30 }}
                            resizeMode="contain"
                          />
                        )}
                      </View>
                      <Text
                        className="font-fredokaSemiBold"
                        style={{
                          fontSize: 11,
                          color: done
                            ? colors.dailyBonusEarnedText
                            : colors.mutedText,
                        }}
                      >
                        +{bonus}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
