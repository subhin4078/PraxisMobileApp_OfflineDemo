import { IconImageAssets } from "@/src/constants/assets/iconAssets";
import useTheme from "@/src/hooks/useTheme";
import { useToast } from "@/src/hooks/useToast";
import { cn } from "@/src/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Image, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export function WelcomeHeader() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View className="mt-10 items-center">
      <Text className="font-fredokaSemiBold text-4xl tracking-tight text-white">
        {t("app.name")}
      </Text>
      <View className="mt-2 flex-row items-center opacity-90">
        <Ionicons name="sparkles" size={16} color={colors.whiteText} />
        <Text className="ml-2 font-fredokaSemiBold text-base text-white">
          {t("auth.tagline")}
        </Text>
      </View>
      <View className="mt-3 rounded-full border border-yellow-300/60 bg-yellow-400/20 px-4 py-1">
        <Text className="text-center font-fredokaMedium text-xs text-yellow-200">
          {t("auth.underDevelopment")}
        </Text>
      </View>
    </View>
  );
}

export function WelcomeMascot() {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 2000 }),
        withTiming(0, { duration: 2000 }),
      ),
      -1, // infinite
      true,
    );
  }, [translateY]);

  const animatedCatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedCatStyle} className="items-center">
      <View className="relative">
        <View className="absolute inset-0 scale-125 rounded-full bg-white/20 blur-3xl" />
        <Image
          source={IconImageAssets.icon}
          className="h-64 w-64 rounded-3xl"
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
}

export function WelcomeActions() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const toast = useToast();

  return (
    <View className="gap-4">
      <Pressable
        className={cn(
          "items-center justify-center rounded-2xl bg-white p-4 shadow-lg active:opacity-90",
        )}
        onPress={() => router.push("/auth/register")}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="book-outline" size={24} color={colors.primaryDark} />
          <Text
            style={{
              marginHorizontal: 8,
              fontFamily: "Fredoka_600SemiBold",
              fontSize: 18,
              color: colors.primary,
            }}
          >
            {t("auth.startLearning")}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={colors.primaryDark} />
        </View>
      </Pressable>

      <Pressable
        className="items-center justify-center rounded-2xl border-2 border-white/40 p-4 active:bg-white/10"
        onPress={() => router.push("/auth/login")}
      >
        <Text className="font-fredokaSemiBold text-lg text-white">
          {t("auth.alreadyHaveAccount")}
        </Text>
      </Pressable>

      <Text className="mt-4 text-center font-fredokaSemiBold text-xs text-white/60">
        {t("auth.agreeTerms")}
      </Text>
    </View>
  );
}
