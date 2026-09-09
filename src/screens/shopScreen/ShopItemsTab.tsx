import type { ShopItem } from "@/src/api/game/useGetShopItems";
import type { ThemeColors } from "@/src/constants/theme";
import { FeaturedCard } from "@/src/screens/shopScreen/FeaturedCard";
import { BOOST_ITEM_CONFIGS } from "@/src/screens/shopScreen/shopConstants";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";

interface ShopItemsTabProps {
  items: ShopItem[];
  isLoading: boolean;
  pawCoins: number;
  isPending: boolean;
  onPurchase: (item: ShopItem) => void;
  colors: ThemeColors;
}

export function ShopItemsTab({
  items,
  isLoading,
  pawCoins,
  isPending,
  onPurchase,
  colors,
}: ShopItemsTabProps) {
  const { t } = useTranslation();
  const boostItems = items.filter((it) => it.type === "boost");

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={{ marginTop: 40 }}
      />
    );
  }

  return (
    <>
      <View className="mb-3" style={{ marginTop: 4 }}>
        <Text className="font-fredokaBold text-base text-primaryText">
          {t("shop.featured")}
        </Text>
      </View>

      <View className="gap-3">
        {boostItems.map((item) => {
          const config = BOOST_ITEM_CONFIGS[item.id];
          if (!config) return null;
          const accentColor = colors.shopItemOrange;
          const gradientColors = [
            colors.shopItemOrange + "18",
            colors.shopItemOrange + "08",
          ] as [string, string];
          return (
            <FeaturedCard
              key={item.id}
              accentColor={accentColor}
              gradientColors={gradientColors}
              image={config.image}
              badgeLabel={t(config.badgeKey as never)}
              name={t(config.nameKey as never)}
              description={t(config.descKey as never)}
              price={item.price}
              onRedeem={() => onPurchase(item)}
              disabled={isPending || !item.purchasable}
              redeemLabel={t("home.shopRedeem")}
            />
          );
        })}
      </View>
    </>
  );
}
