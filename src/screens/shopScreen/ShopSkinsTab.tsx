import type { InventoryItem } from "@/src/api/game/useGetInventory";
import type { ShopItem } from "@/src/api/game/useGetShopItems";
import type { ThemeColors } from "@/src/constants/theme";
import { SkinCard } from "@/src/screens/shopScreen/SkinCard";
import { CLOTHING_ITEM_CONFIGS } from "@/src/screens/shopScreen/shopConstants";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

interface ShopSkinsTabProps {
  items: ShopItem[];
  colors: ThemeColors;
  ownedItems: Record<string, InventoryItem>;
  isPending: boolean;
  onPurchase: (item: ShopItem) => void;
  onEquip: (item: ShopItem) => void;
}

export function ShopSkinsTab({
  items,
  colors,
  ownedItems,
  isPending,
  onPurchase,
  onEquip,
}: ShopSkinsTabProps) {
  const { t } = useTranslation();
  const clothingItems = items.filter((it) => it.type === "clothing");

  return (
    <View>
      <Text className="mb-3 font-fredokaSemiBold text-base text-primaryText">
        {t("shop.seriesname1")}
      </Text>
      <View className="gap-3">
        {clothingItems.map((item) => {
          const config = CLOTHING_ITEM_CONFIGS[item.id];
          if (!config) return null;
          const isOwned = !!ownedItems[item.id];
          return (
            <SkinCard
              key={item.id}
              item={item}
              config={config}
              colors={colors}
              isOwned={isOwned}
              isPending={isPending}
              onPurchase={onPurchase}
              onEquip={onEquip}
            />
          );
        })}
      </View>
      <View
        className="mt-6 items-center rounded-2xl bg-surface p-5"
        style={{ borderWidth: 1, borderColor: colors.borderColor }}
      >
        <Ionicons name="paw" size={32} color={colors.primary} />
        <Text className="mt-2 text-center font-fredokaSemiBold text-sm text-mutedText">
          {t("shop.moreSkinsSoon")}
        </Text>
      </View>
    </View>
  );
}
