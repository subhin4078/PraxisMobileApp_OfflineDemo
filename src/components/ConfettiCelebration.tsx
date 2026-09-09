import useTheme from "@/src/hooks/useTheme";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, View } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CONFETTI_COUNT = 40;

interface ConfettiPiece {
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  swingRange: number;
}

function generatePieces(confettiColors: string[]): ConfettiPiece[] {
  return Array.from({ length: CONFETTI_COUNT }, () => ({
    x: Math.random() * SCREEN_WIDTH,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    size: 6 + Math.random() * 8,
    delay: Math.random() * 600,
    duration: 2000 + Math.random() * 1500,
    swingRange: 30 + Math.random() * 40,
  }));
}

function ConfettiPieceView({ piece }: { piece: ConfettiPiece }) {
  const fallAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fallAnim, {
        toValue: 1,
        duration: piece.duration,
        delay: piece.delay,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: piece.duration,
        delay: piece.delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fallAnim, rotateAnim, piece.duration, piece.delay]);

  const translateY = fallAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, SCREEN_HEIGHT + 20],
  });

  const translateX = rotateAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, piece.swingRange, 0, -piece.swingRange, 0],
  });

  const opacity = fallAnim.interpolate({
    inputRange: [0, 0.1, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", `${360 + Math.random() * 360}deg`],
  });

  return (
    <Animated.View
      style={[
        { position: "absolute", top: 0 },
        {
          left: piece.x,
          width: piece.size,
          height: piece.size * 1.4,
          backgroundColor: piece.color,
          borderRadius: piece.size * 0.2,
          transform: [{ translateY }, { translateX }, { rotate }],
          opacity,
        },
      ]}
    />
  );
}

export function ConfettiCelebration({
  confettiColors: overrideColors,
}: { confettiColors?: string[] } = {}) {
  const { colors } = useTheme();
  const pieces = useRef(
    generatePieces(overrideColors ?? colors.confettiColors),
  ).current;

  return (
    <View className="absolute inset-0 z-[999]" pointerEvents="none">
      {pieces.map((piece, i) => (
        <ConfettiPieceView key={i} piece={piece} />
      ))}
    </View>
  );
}
