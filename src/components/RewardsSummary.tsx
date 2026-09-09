import { CommonSvgAssets } from "@/src/constants/assets/commonAssets";
import { FishingImageAssets } from "@/src/constants/assets/fishingAssets";
import { ShopImageAssets } from "@/src/constants/assets/shopAssets";
import useTheme from "@/src/hooks/useTheme";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, type LayoutChangeEvent, Text, View } from "react-native";

interface GrantedItem {
  itemId: string;
  quantity: number;
}

interface RewardsData {
  xpGained?: number;
  coinsGained?: number;
  updatedLevel?: number;
  itemsGranted?: GrantedItem[];
}

interface RewardsSummaryProps {
  rewards: RewardsData | null | undefined;
}

export function RewardsSummary({ rewards }: RewardsSummaryProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [rowWidth, setRowWidth] = useState(0);

  // 2 gaps of 12px (gap-3) between 3 tiles
  const GAP = 12;
  const tileWidth =
    rowWidth > 0 ? Math.floor((rowWidth - GAP * 2) / 3) : undefined;

  const handleRowLayout = (e: LayoutChangeEvent) => {
    setRowWidth(e.nativeEvent.layout.width);
  };

  const grantedItems =
    rewards?.itemsGranted?.filter((i) => i.quantity > 0) ?? [];

  if (
    !rewards ||
    ((rewards.xpGained ?? 0) <= 0 &&
      (rewards.coinsGained ?? 0) <= 0 &&
      grantedItems.length === 0)
  ) {
    return null;
  }

  return (
    <View
      className="rounded-2xl bg-surface p-5"
      style={{
        borderColor: colors.borderColor,
        borderWidth: 1,
      }}
    >
      <Text className="mb-3 font-fredokaBold text-base text-primaryText">
        {t("rewards.title")}
      </Text>
      <View className="flex-row flex-wrap gap-3" onLayout={handleRowLayout}>
        {(rewards.xpGained ?? 0) > 0 && (
          <View
            className="flex-row items-center gap-2 rounded-xl bg-background px-3 py-2"
            style={{ width: tileWidth }}
          >
            <CommonSvgAssets.xp width={24} height={24} />
            <View>
              <Text
                className="font-fredokaBold text-lg"
                style={{ color: colors.rewardXpText }}
              >
                +{rewards.xpGained}
              </Text>
              <Text className="font-fredoka text-xs text-mutedText">
                {t("rewards.xp")}
              </Text>
            </View>
          </View>
        )}
        {(rewards.coinsGained ?? 0) > 0 && (
          <View
            className="flex-row items-center gap-2 rounded-xl bg-background px-3 py-2"
            style={{ width: tileWidth }}
          >
            <Image
              source={ShopImageAssets.pawCoin5x}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
            <View>
              <Text
                className="font-fredokaBold text-lg"
                style={{ color: colors.rewardCoinsText }}
              >
                +{rewards.coinsGained}
              </Text>
              <Text className="font-fredoka text-xs text-mutedText">
                {t("rewards.coins")}
              </Text>
            </View>
          </View>
        )}
        {grantedItems.map((item) => (
          <View
            key={item.itemId}
            className="flex-row items-center gap-2 rounded-xl bg-background px-3 py-2"
            style={{ width: tileWidth }}
          >
            <Image
              source={FishingImageAssets.bait}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
            <View>
              <Text
                className="font-fredokaBold text-lg"
                style={{ color: colors.primary }}
              >
                x{item.quantity}
              </Text>
              <Text className="font-fredoka text-xs text-mutedText">
                {t("rewards.fishnet")}
              </Text>
            </View>
          </View>
        ))}
      </View>
      {rewards.updatedLevel && (
        <View className="mt-3 flex-row items-center gap-2">
          <Text className="font-fredoka text-sm text-secondaryText">
            {t("rewards.levelNow", {
              level: rewards.updatedLevel,
            })}
          </Text>
        </View>
      )}
    </View>
  );
}
