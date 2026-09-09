import { type ShopItem, useGetShopItems } from "@/src/api/game/useGetShopItems";
import { usePurchaseItem } from "@/src/api/game/usePurchaseItem";
import { ShopImageAssets } from "@/src/constants/assets/shopAssets";
import useTheme from "@/src/hooks/useTheme";
import { useToast } from "@/src/hooks/useToast";
import { ALL_ITEM_CONFIGS } from "@/src/screens/shopScreen/shopConstants";
import useUserStore from "@/src/stores/useUserStore";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  type ImageSourcePropType,
  Pressable,
  Text,
  View,
} from "react-native";

const ITEM_IMAGES: Record<string, ImageSourcePropType> = {
  piggy_bank: ShopImageAssets.coinBooster2x,
  coin_booster: ShopImageAssets.coinBooster2x,
  ancient_magic_bottle: ShopImageAssets.xpBooster2x,
  xp_booster: ShopImageAssets.xpBooster2x,
  mysterious_hourglass: ShopImageAssets.daystreakMakeupHourglass,
  daystreak_makeup: ShopImageAssets.daystreakMakeupHourglass,
};

const getItemImage = (item: ShopItem): ImageSourcePropType | null => {
  const typeMap: Record<string, ImageSourcePropType> = {
    boost: ShopImageAssets.xpBooster2x,
    pet: ShopImageAssets.coinBooster2x,
    clothing: ShopImageAssets.daystreakMakeupHourglass,
  };

  // Try matching by ID substring first
  const id = item.id.toLowerCase();
  for (const [key, img] of Object.entries(ITEM_IMAGES)) {
    if (id.includes(key)) return img;
  }

  // Try matching by name keywords
  const name = item.name.toLowerCase();
  if (name.includes("coin") || name.includes("piggy"))
    return ShopImageAssets.coinBooster2x;
  if (name.includes("xp") || name.includes("magic") || name.includes("bottle"))
    return ShopImageAssets.xpBooster2x;
  if (name.includes("hourglass") || name.includes("streak"))
    return ShopImageAssets.daystreakMakeupHourglass;

  return typeMap[item.type] ?? null;
};

export function HomeShopSection() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const toast = useToast();
  const { userId } = useUserStore();

  const { data: shopData, isLoading } = useGetShopItems();
  const { mutate: purchaseItem, isPending: isPurchasing } = usePurchaseItem(
    userId || "",
  );

  const items = shopData?.items ?? [];

  const handlePurchase = (item: ShopItem) => {
    if (!userId || isPurchasing) return;
    // Get display name from config or fallback to API name
    const config = ALL_ITEM_CONFIGS[item.id];
    const displayName = config ? t(config.nameKey as never) : item.name;
    purchaseItem(
      { itemId: item.id },
      {
        onSuccess: () => {
          toast.show(
            t("home.shopPurchaseSuccess", { name: displayName }),
            "success",
          );
        },
      },
    );
  };

  return (
    <View
      className="mb-5 rounded-3xl bg-surface p-4"
      style={{ borderWidth: 1, borderColor: colors.borderColor }}
    >
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="font-fredokaSemiBold text-base text-primaryText">
          {t("home.shopPlaceholderTag")}
        </Text>
        <View className="bg-primary/15 rounded-full px-3 py-1">
          <Text className="font-fredokaSemiBold text-xs text-primaryText">
            {t("home.shopItemsCount", { count: items.length })}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : items.length === 0 ? (
        <Text className="py-4 text-center font-fredokaMedium text-sm text-mutedText">
          {t("home.shopNoItems")}
        </Text>
      ) : (
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {items.map((item) => {
            const imageSource = getItemImage(item);
            return (
              <View
                key={item.id}
                className="w-[48%] rounded-2xl bg-background p-4"
                style={{ borderWidth: 1, borderColor: colors.borderColor }}
              >
                {imageSource ? (
                  <View className="mb-3 items-center">
                    <View className="h-28 w-full rounded-xl bg-surface px-2 py-2">
                      <Image
                        source={imageSource}
                        className="h-full w-full"
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                ) : (
                  <View className="bg-primary/15 mb-3 h-10 w-10 items-center justify-center rounded-full">
                    <Ionicons name="cube" size={18} color={colors.primary} />
                  </View>
                )}

                <View className="bg-primary/15 mb-2 self-start rounded-full px-2.5 py-1">
                  <Text className="font-fredokaSemiBold text-[10px] uppercase tracking-wide text-primaryText">
                    {item.type}
                  </Text>
                </View>

                <Text className="font-fredokaSemiBold text-sm text-primaryText">
                  {(() => {
                    const config = ALL_ITEM_CONFIGS[item.id];
                    return config ? t(config.nameKey as never) : item.name;
                  })()}
                </Text>

                <View className="mb-3 mt-1 h-12">
                  <Text
                    className="font-fredokaMedium text-xs text-mutedText"
                    numberOfLines={3}
                  >
                    {(() => {
                      const config = ALL_ITEM_CONFIGS[item.id];
                      return config
                        ? t(config.descKey as never)
                        : item.description;
                    })()}
                  </Text>
                </View>

                <View className="mt-auto flex-row items-center justify-between">
                  <View className="bg-primary/15 rounded-full px-3 py-1.5">
                    <Text className="font-fredokaSemiBold text-xs text-primaryText">
                      {item.price} {t("home.coins")}
                    </Text>
                  </View>
                  <Pressable
                    className="active:opacity-70 disabled:opacity-50"
                    style={{
                      backgroundColor: colors.primary,
                      borderRadius: 10,
                      paddingHorizontal: 14,
                      paddingVertical: 5,
                    }}
                    onPress={() => handlePurchase(item)}
                    disabled={isPurchasing || !item.purchasable}
                  >
                    <Text
                      className="font-fredokaSemiBold text-whiteText"
                      style={{ fontSize: 12 }}
                    >
                      {t("home.shopRedeem")}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
