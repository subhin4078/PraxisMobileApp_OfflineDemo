import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

type Props = {
  size?: number;
  color?: string;
};

export function RunningCatLoader({ size = 24, color }: Props) {
  const { colors } = useTheme();
  const iconColor = color ?? colors.whiteText;
  const translateX = useRef(new Animated.Value(-10)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Horizontal running animation
    const runAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 10,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -10,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    );

    // Vertical bounce animation
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -4,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    );

    runAnimation.start();
    bounceAnimation.start();

    return () => {
      runAnimation.stop();
      bounceAnimation.stop();
    };
  }, [translateX, bounce]);

  return (
    <View style={{ width: size * 2, alignItems: "center" }}>
      <Animated.View
        style={{
          transform: [{ translateX }, { translateY: bounce }],
        }}
      >
        <Ionicons name="paw" size={size} color={iconColor} />
      </Animated.View>
    </View>
  );
}
