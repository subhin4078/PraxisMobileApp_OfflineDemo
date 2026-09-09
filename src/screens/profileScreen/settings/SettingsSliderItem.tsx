import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef } from "react";
import {
  type GestureResponderEvent,
  type LayoutChangeEvent,
  PanResponder,
  Text,
  View,
} from "react-native";

interface SettingsSliderItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function SettingsSliderItem({
  icon,
  label,
  value,
  onValueChange,
  min = 0,
  max = 1,
}: SettingsSliderItemProps) {
  const { colors } = useTheme();
  const trackWidth = useRef(0);
  const trackX = useRef(0);
  const trackRef = useRef<View>(null);

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const fraction = (value - min) / (max - min);

  const computeValue = useCallback(
    (pageX: number) => {
      const ratio = (pageX - trackX.current) / (trackWidth.current || 1);
      return clamp(min + ratio * (max - min));
    },
    [min, max],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        onValueChange(
          Math.round(computeValue(e.nativeEvent.pageX) * 100) / 100,
        );
      },
      onPanResponderMove: (e: GestureResponderEvent) => {
        onValueChange(
          Math.round(computeValue(e.nativeEvent.pageX) * 100) / 100,
        );
      },
    }),
  ).current;

  const onTrackLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
    trackRef.current?.measureInWindow((x) => {
      trackX.current = x;
    });
  };

  return (
    <View className="mb-3 rounded-2xl bg-surface px-5 py-4">
      <View className="mb-3 flex-row items-center gap-3">
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: `${colors.primary}20` }}
        >
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <Text className="flex-1 font-fredokaMedium text-base text-primaryText">
          {label}
        </Text>
        <Text className="font-fredokaSemiBold text-sm text-secondaryText">
          {Math.round(fraction * 100)}%
        </Text>
      </View>
      <View style={{ paddingHorizontal: 12 }}>
        <View
          ref={trackRef}
          className="h-8 justify-center"
          onLayout={onTrackLayout}
          {...panResponder.panHandlers}
        >
          <View className="h-2 overflow-hidden rounded-full bg-background">
            <View
              className="h-full rounded-full"
              style={{
                width: `${fraction * 100}%`,
                backgroundColor: colors.primary,
              }}
            />
          </View>
          <View
            className="absolute h-6 w-6 items-center justify-center rounded-full bg-primary"
            style={{
              left: `${fraction * 100}%`,
              marginLeft: -12,
              elevation: 3,
              shadowColor: colors.sliderThumbShadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
            }}
          >
            <View className="h-2 w-2 rounded-full bg-whiteText" />
          </View>
        </View>
      </View>
    </View>
  );
}
