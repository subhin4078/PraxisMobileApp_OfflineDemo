import { HomeImageAssets } from "@/src/constants/assets/homeAssets";
import useTheme from "@/src/hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type HomeFeatureButtonsProps = {
  onPressShop?: () => void;
  onPressBattle?: () => void;
  onPressRank?: () => void;
};

export function HomeFeatureButtons({
  onPressShop,
  onPressBattle,
  onPressRank,
}: HomeFeatureButtonsProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ]),
    ).start();
  }, [glowAnim]);

  const glowTranslateX = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, SCREEN_WIDTH],
  });

  const BATTLE_ORANGE = colors.battleOrange;

  return (
    <View className="mb-5">
      {/* Battle Card — full-width with orange outline */}
      <View className="mb-3">
        <View
          className="overflow-hidden rounded-2xl"
          style={{
            borderWidth: 2,
            borderColor: BATTLE_ORANGE,
            shadowColor: BATTLE_ORANGE,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          {/* Flowing highlight overlay */}
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -2,
              left: 0,
              right: 0,
              bottom: -2,
              zIndex: 10,
              overflow: "hidden",
              borderRadius: 16,
            }}
          >
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 120,
                transform: [{ translateX: glowTranslateX }],
              }}
            >
              <LinearGradient
                colors={["transparent", colors.overlayLight55, "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flex: 1,
                  borderRadius: 16,
                }}
              />
            </Animated.View>
          </Animated.View>

          <Pressable
            className="flex-row items-center rounded-2xl bg-surface p-2"
            onPress={onPressBattle}
          >
            <Image
              source={HomeImageAssets.battleCat}
              className="h-32 w-32"
              resizeMode="contain"
            />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <View className="flex-row items-center gap-2">
                <Text className="font-fredokaSemiBold text-base text-primaryText">
                  {t("home.battle")}
                </Text>
                <LinearGradient
                  colors={[BATTLE_ORANGE, colors.battleGradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 99,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    className="font-fredokaSemiBold text-whiteText"
                    style={{ fontSize: 10 }}
                  >
                    {t("home.pvpBadge")}
                  </Text>
                </LinearGradient>
              </View>
              <Text className="font-fredokaMedium text-xs text-mutedText">
                {t("home.battleCardDesc")}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      <View className="flex-row gap-3" style={{ height: 220 }}>
        {/* Shop – left large card */}
        <Pressable
          className="flex-1 items-center justify-center rounded-2xl bg-surface p-1 active:opacity-70"
          onPress={onPressShop}
          style={{ height: "100%" }}
        >
          <Image
            source={HomeImageAssets.shop}
            className="h-36 w-36"
            resizeMode="contain"
          />
          <Text
            className="font-fredokaSemiBold text-base text-primaryText"
            style={{ marginTop: -10 }}
          >
            {t("home.shop")}
          </Text>
          <Text className="text-center font-fredokaMedium text-xs text-mutedText">
            {t("home.shopDescription")}
          </Text>
        </Pressable>

        {/* Right column – stacked small cards */}
        <View className="flex-1" style={{ gap: 6 }}>
          {/* Rank */}
          <Pressable
            className="items-center justify-center rounded-2xl bg-surface p-1 active:opacity-70"
            onPress={onPressRank}
            style={{ flex: 1.6 }}
          >
            <Image
              source={HomeImageAssets.leaderboardHomepage}
              style={{ width: 120, height: 120 }}
              resizeMode="contain"
            />
            <Text className="text-center font-fredokaSemiBold text-sm text-primaryText">
              {t("home.rank")}
            </Text>
          </Pressable>

          {/* Notes */}
          <Pressable
            className="items-center justify-center rounded-2xl bg-surface p-1 active:opacity-70"
            style={{ flex: 0.6 }}
          >
            <Image
              source={HomeImageAssets.book}
              className="h-8 w-8"
              resizeMode="contain"
            />
            <Text
              className="text-center font-fredokaSemiBold text-sm text-primaryText"
              style={{ marginTop: -6 }}
            >
              {t("home.notes")}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
