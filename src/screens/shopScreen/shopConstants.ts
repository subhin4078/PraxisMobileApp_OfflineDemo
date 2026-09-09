import { ShopImageAssets } from "@/src/constants/assets/shopAssets";
import type { ThemeColors } from "@/src/constants/theme";
import type { ImageSourcePropType } from "react-native";

export type TabKey = "items" | "skins";

export type BoostItemConfig = {
  nameKey: string;
  descKey: string;
  badgeKey: string;
  image: ImageSourcePropType;
  accentColor: (colors: ThemeColors) => string;
  gradientColors: (colors: ThemeColors) => [string, string];
};

export const BOOST_ITEM_CONFIGS: Record<string, BoostItemConfig> = {
  DOUBLE_COINS_1H: {
    nameKey: "shop.items.doublePawCoin.name",
    descKey: "shop.items.doublePawCoin.desc",
    badgeKey: "shop.items.doublePawCoin.badge",
    image: ShopImageAssets.coinBooster2x,
    accentColor: (colors) => colors.shopItemOrange,
    gradientColors: (colors) =>
      [colors.shopItemOrange + "18", colors.shopItemOrange + "08"] as [
        string,
        string,
      ],
  },
  DOUBLE_XP_1H: {
    nameKey: "shop.items.doubleXp.name",
    descKey: "shop.items.doubleXp.desc",
    badgeKey: "shop.items.doubleXp.badge",
    image: ShopImageAssets.xpBooster2x,
    accentColor: (colors) => colors.shopItemPurple,
    gradientColors: (colors) =>
      [colors.shopItemPurple + "18", colors.shopItemPurple + "08"] as [
        string,
        string,
      ],
  },
  HOURLY_MAKEUP_HOURGLASS: {
    nameKey: "shop.items.streakHourglass.name",
    descKey: "shop.items.streakHourglass.desc",
    badgeKey: "shop.items.streakHourglass.badge",
    image: ShopImageAssets.daystreakMakeupHourglass,
    accentColor: (colors) => colors.shopItemOrange,
    gradientColors: (colors) =>
      [colors.shopItemOrange + "18", colors.shopItemOrange + "08"] as [
        string,
        string,
      ],
  },
};

export type ClothingItemConfig = {
  nameKey: string;
  descKey: string;
  image: ImageSourcePropType;
};

export const CLOTHING_ITEM_CONFIGS: Record<string, ClothingItemConfig> = {
  DEFAULT_CAT: {
    nameKey: "shop.skins_list.defaultCat.name",
    descKey: "shop.skins_list.defaultCat.desc",
    image: ShopImageAssets.defaultCat,
  },
  ROLLINGCAT_CUTE: {
    nameKey: "shop.skins_list.pinkCat.name",
    descKey: "shop.skins_list.pinkCat.desc",
    image: ShopImageAssets.rollingCatCute,
  },
  ROLLINGCAT_NEON: {
    nameKey: "shop.skins_list.cyanCat.name",
    descKey: "shop.skins_list.cyanCat.desc",
    image: ShopImageAssets.rollingCatNeon,
  },
  ROLLINGCAT_RAINBOW: {
    nameKey: "shop.skins_list.rainbowCat.name",
    descKey: "shop.skins_list.rainbowCat.desc",
    image: ShopImageAssets.rollingCatRainbow,
  },
};

// Simple config for non-featured display (inventory, etc)
export type DisplayItemConfig = {
  nameKey: string;
  descKey: string;
  image?: ImageSourcePropType;
};

export const ALL_ITEM_CONFIGS: Record<string, DisplayItemConfig> = {
  ...BOOST_ITEM_CONFIGS,
  ...CLOTHING_ITEM_CONFIGS,
};
