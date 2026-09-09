import type { ShopItem } from "@/src/api/game/useGetShopItems";
import type { ThemeColors } from "@/src/constants/theme";
import { PriceTag } from "@/src/screens/shopScreen/PriceTag";
import type { ClothingItemConfig } from "@/src/screens/shopScreen/shopConstants";
import { useTranslation } from "react-i18next";
import { Image, Pressable, Text, View } from "react-native";

interface SkinCardProps {
  item: ShopItem;
  config: ClothingItemConfig;
  colors: ThemeColors;
  isOwned: boolean;
  isPending: boolean;
  onPurchase: (item: ShopItem) => void;
  onEquip: (item: ShopItem) => void;
}

export function SkinCard({
  item,
  config,
  colors,
  isOwned,
  isPending,
  onPurchase,
  onEquip,
}: SkinCardProps) {
  const { t } = useTranslation();

  const handleButtonPress = () => {
    if (isOwned) {
      onEquip(item);
    } else {
      onPurchase(item);
    }
  };

  return (
    <View
      className="flex-row items-center overflow-hidden rounded-2xl bg-surface"
      style={{ borderWidth: 1, borderColor: colors.borderColor }}
    >
      <View
        style={{
          width: 100,
          height: 100,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.surface,
        }}
      >
        <Image
          source={config.image}
          style={{ width: 70, height: 70 }}
          resizeMode="contain"
        />
      </View>
      <View style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 10 }}>
        <Text className="font-fredokaSemiBold text-base text-primaryText">
          {t(config.nameKey as never)}
        </Text>
        <Text className="mt-0.5 font-fredokaMedium text-xs text-mutedText">
          {t(config.descKey as never)}
        </Text>
        <View className="mt-2 flex-row items-center justify-between">
          <PriceTag price={item.price} />
          <Pressable
            className="active:opacity-70"
            style={{
              backgroundColor: colors.primary,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 5,
              opacity: isPending ? 0.6 : 1,
            }}
            onPress={handleButtonPress}
            disabled={isPending}
          >
            <Text
              className="font-fredokaSemiBold text-whiteText"
              style={{ fontSize: 12 }}
            >
              {isOwned ? t("shop.equip") : t("home.shopRedeem")}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
