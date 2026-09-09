import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Easing, Text, View } from "react-native";

interface BattleRacingBarProps {
  myProgress: number;
  opponentProgress: number;
  totalQuestions: number;
  myUsername: string;
  opponentUsername: string;
}

export function BattleRacingBar({
  myProgress,
  opponentProgress,
  totalQuestions,
  myUsername,
  opponentUsername,
}: BattleRacingBarProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const myAnim = useRef(new Animated.Value(0)).current;
  const opponentAnim = useRef(new Animated.Value(0)).current;

  const safeTotal = Math.max(totalQuestions, 1);
  const myFraction = Math.min(myProgress / safeTotal, 1);
  const opponentFraction = Math.min(opponentProgress / safeTotal, 1);

  useEffect(() => {
    Animated.timing(myAnim, {
      toValue: myFraction,
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [myFraction, myAnim]);

  useEffect(() => {
    Animated.timing(opponentAnim, {
      toValue: opponentFraction,
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [opponentFraction, opponentAnim]);

  const myWidth = myAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const opponentWidth = opponentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      className="mb-3 rounded-2xl bg-surface p-3"
      style={{ borderColor: colors.borderColor, borderWidth: 1 }}
    >
      <Text className="mb-2 text-center font-fredokaSemiBold text-xs text-secondaryText">
        {t("battle.racingBar")}
      </Text>

      {/* My progress */}
      <View className="mb-1 flex-row items-center gap-2">
        <View className="w-20 flex-row items-center gap-1">
          <Ionicons name="person" size={12} color={colors.battleMyColor} />
          <Text
            className="font-fredokaMedium text-xs text-primaryText"
            numberOfLines={1}
          >
            {myUsername}
          </Text>
        </View>
        <View className="h-5 flex-1 overflow-hidden rounded-full bg-background">
          <Animated.View
            className="h-full rounded-full"
            style={{
              width: myWidth,
              backgroundColor: colors.battleMyColor,
            }}
          />
        </View>
        <Text className="w-8 text-right font-fredokaSemiBold text-xs text-primaryText">
          {myProgress}/{totalQuestions}
        </Text>
      </View>

      {/* Opponent progress */}
      <View className="flex-row items-center gap-2">
        <View className="w-20 flex-row items-center gap-1">
          <Ionicons
            name="person"
            size={12}
            color={colors.battleOpponentColor}
          />
          <Text
            className="font-fredokaMedium text-xs text-primaryText"
            numberOfLines={1}
          >
            {opponentUsername}
          </Text>
        </View>
        <View className="h-5 flex-1 overflow-hidden rounded-full bg-background">
          <Animated.View
            className="h-full rounded-full"
            style={{
              width: opponentWidth,
              backgroundColor: colors.battleOpponentColor,
            }}
          />
        </View>
        <Text className="w-8 text-right font-fredokaSemiBold text-xs text-primaryText">
          {opponentProgress}/{totalQuestions}
        </Text>
      </View>
    </View>
  );
}
