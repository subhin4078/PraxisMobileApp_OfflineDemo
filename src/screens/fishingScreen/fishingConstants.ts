import { FishingImageAssets } from "@/src/constants/assets/fishingAssets";
import type { ImageSourcePropType } from "react-native";

export type FishRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export type FishConfig = {
  nameKey: string;
  descKey: string;
  rarity: FishRarity;
  image: ImageSourcePropType;
};

export const FISH_CONFIGS: Record<string, FishConfig> = {
  // Common
  COMMON_FISHBONE: {
    nameKey: "fishing.fish.COMMON_FISHBONE.name",
    descKey: "fishing.fish.COMMON_FISHBONE.desc",
    rarity: "COMMON",
    image: FishingImageAssets.commonFishbone,
  },
  COMMON_TRASHBAG: {
    nameKey: "fishing.fish.COMMON_TRASHBAG.name",
    descKey: "fishing.fish.COMMON_TRASHBAG.desc",
    rarity: "COMMON",
    image: FishingImageAssets.commonTrashbag,
  },
  COMMON_SHOE: {
    nameKey: "fishing.fish.COMMON_SHOE.name",
    descKey: "fishing.fish.COMMON_SHOE.desc",
    rarity: "COMMON",
    image: FishingImageAssets.commonShoe,
  },
  COMMON_CAN: {
    nameKey: "fishing.fish.COMMON_CAN.name",
    descKey: "fishing.fish.COMMON_CAN.desc",
    rarity: "COMMON",
    image: FishingImageAssets.commonCan,
  },
  COMMON_BOTTLE: {
    nameKey: "fishing.fish.COMMON_BOTTLE.name",
    descKey: "fishing.fish.COMMON_BOTTLE.desc",
    rarity: "COMMON",
    image: FishingImageAssets.commonBottle,
  },
  COMMON_APPLECORE: {
    nameKey: "fishing.fish.COMMON_APPLECORE.name",
    descKey: "fishing.fish.COMMON_APPLECORE.desc",
    rarity: "COMMON",
    image: FishingImageAssets.commonApplecore,
  },
  COMMON_BOX: {
    nameKey: "fishing.fish.COMMON_BOX.name",
    descKey: "fishing.fish.COMMON_BOX.desc",
    rarity: "COMMON",
    image: FishingImageAssets.commonBox,
  },
  COMMON_COIL: {
    nameKey: "fishing.fish.COMMON_COIL.name",
    descKey: "fishing.fish.COMMON_COIL.desc",
    rarity: "COMMON",
    image: FishingImageAssets.commonCoil,
  },
  // Rare
  RARE_KOHAKU: {
    nameKey: "fishing.fish.RARE_KOHAKU.name",
    descKey: "fishing.fish.RARE_KOHAKU.desc",
    rarity: "RARE",
    image: FishingImageAssets.rareKohaku,
  },
  RARE_TANCHO: {
    nameKey: "fishing.fish.RARE_TANCHO.name",
    descKey: "fishing.fish.RARE_TANCHO.desc",
    rarity: "RARE",
    image: FishingImageAssets.rareTancho,
  },
  RARE_ORANJI: {
    nameKey: "fishing.fish.RARE_ORANJI.name",
    descKey: "fishing.fish.RARE_ORANJI.desc",
    rarity: "RARE",
    image: FishingImageAssets.rareOranji,
  },
  RARE_OGON: {
    nameKey: "fishing.fish.RARE_OGON.name",
    descKey: "fishing.fish.RARE_OGON.desc",
    rarity: "RARE",
    image: FishingImageAssets.rareOgon,
  },
  RARE_SHIRO: {
    nameKey: "fishing.fish.RARE_SHIRO.name",
    descKey: "fishing.fish.RARE_SHIRO.desc",
    rarity: "RARE",
    image: FishingImageAssets.rareShiro,
  },
  RARE_SHOWA: {
    nameKey: "fishing.fish.RARE_SHOWA.name",
    descKey: "fishing.fish.RARE_SHOWA.desc",
    rarity: "RARE",
    image: FishingImageAssets.rareShowa,
  },
  // Epic
  EPIC_CININK: {
    nameKey: "fishing.fish.EPIC_CININK.name",
    descKey: "fishing.fish.EPIC_CININK.desc",
    rarity: "EPIC",
    image: FishingImageAssets.epicCinink,
  },
  EPIC_STAINED: {
    nameKey: "fishing.fish.EPIC_STAINED.name",
    descKey: "fishing.fish.EPIC_STAINED.desc",
    rarity: "EPIC",
    image: FishingImageAssets.epicStained,
  },
  EPIC_LEVIATHAN: {
    nameKey: "fishing.fish.EPIC_LEVIATHAN.name",
    descKey: "fishing.fish.EPIC_LEVIATHAN.desc",
    rarity: "EPIC",
    image: FishingImageAssets.epicLeviathan,
  },
  // Legendary
  LEGENDARY_LIULI: {
    nameKey: "fishing.fish.LEGENDARY_LIULI.name",
    descKey: "fishing.fish.LEGENDARY_LIULI.desc",
    rarity: "LEGENDARY",
    image: FishingImageAssets.legendaryLiuli,
  },
  LEGENDARY_GILDED: {
    nameKey: "fishing.fish.LEGENDARY_GILDED.name",
    descKey: "fishing.fish.LEGENDARY_GILDED.desc",
    rarity: "LEGENDARY",
    image: FishingImageAssets.legendaryGilded,
  },
  LEGENDARY_GALAXY: {
    nameKey: "fishing.fish.LEGENDARY_GALAXY.name",
    descKey: "fishing.fish.LEGENDARY_GALAXY.desc",
    rarity: "LEGENDARY",
    image: FishingImageAssets.legendaryGalaxy,
  },
};

export const RARITY_ORDER: FishRarity[] = [
  "LEGENDARY",
  "EPIC",
  "RARE",
  "COMMON",
];

export const RARITY_I18N_KEY: Record<FishRarity, string> = {
  COMMON: "fishing.rarity.common",
  RARE: "fishing.rarity.rare",
  EPIC: "fishing.rarity.epic",
  LEGENDARY: "fishing.rarity.legendary",
};
