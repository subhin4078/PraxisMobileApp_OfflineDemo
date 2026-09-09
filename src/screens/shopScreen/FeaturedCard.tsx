import { PriceTag } from "@/src/screens/shopScreen/PriceTag";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  Text,
  View,
} from "react-native";

interface FeaturedCardProps {
  accentColor: string;
  gradientColors: [string, string];
  image: ImageSourcePropType | null;
  badgeLabel: string;
  name: string;
  description: string;
  price: number;
  onRedeem: () => void;
  disabled?: boolean;
  redeemLabel: string;
}

export function FeaturedCard({
  accentColor,
  gradientColors,
  image,
  badgeLabel,
  name,
  description,
  price,
  onRedeem,
  disabled,
  redeemLabel,
}: FeaturedCardProps) {
  return (
    <View
      className="overflow-hidden rounded-2xl"
      style={{ borderWidth: 1.5, borderColor: accentColor + "60" }}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 14,
          gap: 14,
          minHeight: 120,
        }}
      >
        {/* Image box */}
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundColor: accentColor + "15",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: accentColor + "40",
          }}
        >
          {image ? (
            <Image
              source={image}
              style={{ width: 50, height: 50 }}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="cube" size={28} color={accentColor} />
          )}
        </View>

        {/* Text */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: accentColor + "20",
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 2,
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontFamily: "Fredoka_600SemiBold",
                fontSize: 10,
                color: accentColor,
              }}
            >
              {badgeLabel}
            </Text>
          </View>
          <Text
            className="font-fredokaBold text-sm text-primaryText"
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text
            className="mt-0.5 font-fredoka text-xs text-mutedText"
            numberOfLines={2}
          >
            {description}
          </Text>
        </View>

        {/* Price + button */}
        <View style={{ alignItems: "flex-end", gap: 6 }}>
          <PriceTag price={price} />
          <Pressable
            style={{
              backgroundColor: accentColor,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 5,
              opacity: disabled ? 0.5 : 1,
            }}
            onPress={onRedeem}
            disabled={disabled}
          >
            <Text
              className="font-fredokaSemiBold text-whiteText"
              style={{ fontSize: 12 }}
            >
              {redeemLabel}
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}
