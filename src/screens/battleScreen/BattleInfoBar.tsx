import { BattleRacingBar } from "@/src/components/BattleRacingBar";
import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Animated, type ImageSourcePropType, Text, View } from "react-native";

interface BattleInfoBarProps {
  committedProgress: number;
  totalQuestions: number;
  remainingSeconds: number;
  displayedOpponentProgress: number;
  myUsername: string;
  opponentUsername: string;
  displayedBattleImage: ImageSourcePropType;
  imageFadeAnim: Animated.Value;
}

export function BattleInfoBar({
  committedProgress,
  totalQuestions,
  remainingSeconds,
  displayedOpponentProgress,
  myUsername,
  opponentUsername,
  displayedBattleImage,
  imageFadeAnim,
}: BattleInfoBarProps) {
  const { colors } = useTheme();

  return (
    <>
      {/* Compact battle info bar */}
      <View
        className="mb-3 flex-row items-center rounded-2xl px-3 py-2"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.borderColor,
          borderWidth: 1,
        }}
      >
        {/* My progress */}
        <View className="flex-row items-center gap-1.5">
          <View
            className="h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.battleMyColor + "20" }}
          >
            <Ionicons name="person" size={14} color={colors.battleMyColor} />
          </View>
          <Text
            className="font-fredokaBold text-base"
            style={{ color: colors.battleMyColor }}
          >
            {committedProgress}/{totalQuestions}
          </Text>
        </View>

        {/* Timer in center */}
        <View className="flex-1 items-center">
          <View
            className="flex-row items-center gap-1 rounded-xl px-3 py-1"
            style={{
              backgroundColor:
                remainingSeconds <= 60
                  ? colors.battleTimerUrgent + "18"
                  : colors.battleTimerNormal + "18",
            }}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={
                remainingSeconds <= 60
                  ? colors.battleTimerUrgent
                  : colors.battleTimerNormal
              }
            />
            <Text
              className="font-fredokaBold text-lg"
              style={{
                color:
                  remainingSeconds <= 60
                    ? colors.battleTimerUrgent
                    : colors.battleTimerNormal,
              }}
            >
              {Math.floor(remainingSeconds / 60)
                .toString()
                .padStart(2, "0")}
              :{(remainingSeconds % 60).toString().padStart(2, "0")}
            </Text>
          </View>
        </View>

        {/* Opponent progress */}
        <View className="flex-row items-center gap-1.5">
          <Text
            className="font-fredokaBold text-base"
            style={{ color: colors.battleOpponentColor }}
          >
            {displayedOpponentProgress}/{totalQuestions}
          </Text>
          <View
            className="h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.battleOpponentColor + "20" }}
          >
            <Ionicons
              name="person-outline"
              size={14}
              color={colors.battleOpponentColor}
            />
          </View>
        </View>
      </View>

      {/* Battle momentum image */}
      <View className="mb-3 items-center">
        <Animated.Image
          source={displayedBattleImage}
          style={{ width: 240, height: 140, opacity: imageFadeAnim }}
          resizeMode="contain"
        />
      </View>

      {/* Racing bar */}
      <BattleRacingBar
        myProgress={committedProgress}
        opponentProgress={displayedOpponentProgress}
        totalQuestions={totalQuestions}
        myUsername={myUsername}
        opponentUsername={opponentUsername}
      />
    </>
  );
}
