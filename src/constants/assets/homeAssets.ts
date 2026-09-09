import battleCat from "@/assets/images/app/home/battle-cat.png";
import book from "@/assets/images/app/home/book.png";
import daystreak from "@/assets/images/app/home/daystreak.png";
import leaderboard from "@/assets/images/app/home/leaderboard.png";
import leaderboardHomepage from "@/assets/images/app/home/leaderboard_homepage.png";
import shop from "@/assets/images/app/home/shop.png";
import teacher from "@/assets/images/app/home/teacher.png";
import prefix1 from "@/assets/images/app/prefix/1.png";
import prefix2 from "@/assets/images/app/prefix/2.png";
import prefix3 from "@/assets/images/app/prefix/3.png";
import prefix4 from "@/assets/images/app/prefix/4.png";
import prefix5 from "@/assets/images/app/prefix/5.png";
import prefix6 from "@/assets/images/app/prefix/6.png";
import prefix7 from "@/assets/images/app/prefix/7.png";
import prefix8 from "@/assets/images/app/prefix/8.png";
import prefix9 from "@/assets/images/app/prefix/9.png";
import BuffSvg from "@/assets/images/app/svg/common/buff.svg";
import PawSvg from "@/assets/images/app/svg/common/paw.svg";
import BattleSvg from "@/assets/images/app/svg/home/battle.svg";
import ChatSvg from "@/assets/images/app/svg/home/chat.svg";
import PencilSvg from "@/assets/images/app/svg/home/pencil.svg";
import ShopSvg from "@/assets/images/app/svg/home/shop.svg";
import TargetSvg from "@/assets/images/app/svg/home/target.svg";

export const HomeImageAssets = {
  battleCat,
  book,
  daystreak,
  shop,
  teacher,
  leaderboard,
  leaderboardHomepage,
};

// Index 0 = lowest rank (1.png), index 8 = highest rank (9.png)
export const PrefixImageAssets = [
  prefix1,
  prefix2,
  prefix3,
  prefix4,
  prefix5,
  prefix6,
  prefix7,
  prefix8,
  prefix9,
];

export const HomeSvgAssets = {
  battle: BattleSvg,
  buff: BuffSvg,
  chat: ChatSvg,
  paw: PawSvg,
  pencil: PencilSvg,
  shop: ShopSvg,
  target: TargetSvg,
};
