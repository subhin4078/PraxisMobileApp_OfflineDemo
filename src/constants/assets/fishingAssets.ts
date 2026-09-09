import fishingAnimation from "@/assets/animations/fishing/fishing_mobile.gif";
import bait from "@/assets/images/app/fishing/bait/bait.png";
// Common fish
import commonApplecore from "@/assets/images/app/fishing/common/COMMON_APPLECORE.png";
import commonBottle from "@/assets/images/app/fishing/common/COMMON_BOTTLE.png";
import commonBox from "@/assets/images/app/fishing/common/COMMON_BOX.png";
import commonCan from "@/assets/images/app/fishing/common/COMMON_CAN.png";
import commonCoil from "@/assets/images/app/fishing/common/COMMON_COIL.png";
import commonFishbone from "@/assets/images/app/fishing/common/COMMON_FISHBONE.png";
import commonShoe from "@/assets/images/app/fishing/common/COMMON_SHOE.png";
import commonTrashbag from "@/assets/images/app/fishing/common/COMMON_TRASHBAG.png";
// Epic fish
import epicCinink from "@/assets/images/app/fishing/epic/EPIC_CININK.png";
import epicLeviathan from "@/assets/images/app/fishing/epic/EPIC_LEVIATHAN.png";
import epicStained from "@/assets/images/app/fishing/epic/EPIC_STAINED.png";
// Legendary fish
import legendaryGalaxy from "@/assets/images/app/fishing/legendary/LEGENDARY_GALAXY.png";
import legendaryGilded from "@/assets/images/app/fishing/legendary/LEGENDARY_GILDED.png";
import legendaryLiuli from "@/assets/images/app/fishing/legendary/LEGENDARY_LIULI.png";
// Rare fish
import rareKohaku from "@/assets/images/app/fishing/rare/RARE_KOHAKU.png";
import rareOgon from "@/assets/images/app/fishing/rare/RARE_OGON.png";
import rareOranji from "@/assets/images/app/fishing/rare/RARE_ORANJI.png";
import rareShiro from "@/assets/images/app/fishing/rare/RARE_SHIRO.png";
import rareShowa from "@/assets/images/app/fishing/rare/RARE_SHOWA.png";
import rareTancho from "@/assets/images/app/fishing/rare/Tancho.png";
import noItemSvg from "@/assets/images/app/svg/common/noItem.svg";

export const FishingImageAssets = {
  bait,
  fishingAnimation,
  noItem: noItemSvg,
  // Common
  commonFishbone,
  commonTrashbag,
  commonShoe,
  commonCan,
  commonBottle,
  commonApplecore,
  commonBox,
  commonCoil,
  // Rare
  rareKohaku,
  rareTancho,
  rareOranji,
  rareOgon,
  rareShiro,
  rareShowa,
  // Epic
  epicCinink,
  epicStained,
  epicLeviathan,
  // Legendary
  legendaryLiuli,
  legendaryGilded,
  legendaryGalaxy,
} as const;
