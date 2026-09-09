import pawLoadingLottie from "@/assets/animations/common/paw_loading.json";
import { useGetInventory } from "@/src/api/game/useGetInventory";
import { useGetShopItems } from "@/src/api/game/useGetShopItems";
import { useUseItem } from "@/src/api/game/useUseItem";
import { CommonSvgAssets } from "@/src/constants/assets/commonAssets";
import { ShopImageAssets } from "@/src/constants/assets/shopAssets";
import useTheme from "@/src/hooks/useTheme";
import { useToast } from "@/src/hooks/useToast";
import { FishingTabContent } from "@/src/screens/fishingScreen/FishingTabContent";
import {
  ALL_ITEM_CONFIGS,
  BOOST_ITEM_CONFIGS,
  CLOTHING_ITEM_CONFIGS,
} from "@/src/screens/shopScreen/shopConstants";
import useUserStore from "@/src/stores/useUserStore";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  type ImageSourcePropType,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ITEM_IMAGES: Record<string, ImageSourcePropType> = {
  coin_booster_2x: ShopImageAssets.coinBooster2x,
  xp_booster_2x: ShopImageAssets.xpBooster2x,
  DEFAULT_CAT: ShopImageAssets.defaultCat,
  ROLLINGCAT_CUTE: ShopImageAssets.rollingCatCute,
  ROLLINGCAT_NEON: ShopImageAssets.rollingCatNeon,
  ROLLINGCAT_RAINBOW: ShopImageAssets.rollingCatRainbow,
};

function getItemImage(itemId: string): ImageSourcePropType | null {
  if (ITEM_IMAGES[itemId]) return ITEM_IMAGES[itemId];
  const lower = itemId.toLowerCase();
  if (lower.includes("coin")) return ShopImageAssets.coinBooster2x;
  if (lower.includes("xp")) return ShopImageAssets.xpBooster2x;
  if (lower.includes("hourglass") || lower.includes("streak"))
    return ShopImageAssets.daystreakMakeupHourglass;
  return null;
}

type TabKey = "items" | "skins" | "fishing";

export default function InventoryScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const { userId, equippedSkin, setEquippedSkin } = useUserStore();

  const { data: inventoryData, isLoading: inventoryLoading } = useGetInventory(
    userId!,
  );
  const { data: shopItemsData } = useGetShopItems();
  const useItem = useUseItem(userId!);

  const isLoading = inventoryLoading;

  const inventory = inventoryData?.inventory;

  const ownedItems = Object.entries(inventory?.items ?? {}).filter(
    ([, item]) => item.quantity > 0 && item.status !== "expired",
  );

  const clothingItems = (shopItemsData?.items ?? []).filter(
    (item) => item.type === "clothing",
  );

  // Add DEFAULT_CAT as a synthetic item that's always owned
  const allClothingItems = [
    {
      id: "DEFAULT_CAT",
      name: "", // Name will be fetched from i18n
      type: "clothing" as const,
      price: 0,
      purchasable: false,
      durationSeconds: -1,
      description: "", // Description will be fetched from i18n
      buff: [],
      createdAt: "",
      updatedAt: "",
    },
    ...clothingItems,
  ];

  // Helper to get display name/description from config, with fallback to API response
  const getItemDisplayName = (itemId: string) => {
    const config = ALL_ITEM_CONFIGS[itemId];
    if (config) {
      return t(config.nameKey as never);
    }
    // Fallback to item ID if no config found
    return itemId;
  };

  const getItemDisplayDescription = (itemId: string) => {
    const config = ALL_ITEM_CONFIGS[itemId];
    if (config) {
      return t(config.descKey as never);
    }
    // No config found, no description available
    return "";
  };

  const getShopItem = (itemId: string) => {
    if (itemId === "DEFAULT_CAT") {
      return allClothingItems[0];
    }
    return shopItemsData?.items.find((i) => i.id === itemId);
  };

  const isItemOwned = (itemId: string) => {
    // DEFAULT_CAT is always owned
    if (itemId === "DEFAULT_CAT") return true;
    return ownedItems.some(([id]) => id === itemId);
  };

  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["inventory", userId] });
    await queryClient.invalidateQueries({ queryKey: ["shop-items"] });
    setIsRefreshing(false);
  };

  const [activeTab, setActiveTab] = useState<TabKey>("items");
  const [selectedSkin, setSelectedSkin] = useState(
    equippedSkin ?? "DEFAULT_CAT",
  );
  const [confirmItem, setConfirmItem] = useState<{
    id: string;
    name: string;
    description?: string;
  } | null>(null);

  const handleUseItem = (
    itemId: string,
    itemName: string,
    itemDesc?: string,
  ) => {
    setConfirmItem({ id: itemId, name: itemName, description: itemDesc });
  };

  const doUseItem = () => {
    if (!confirmItem) return;
    const itemName = confirmItem.name;
    useItem.mutate(confirmItem.id, {
      onSuccess: () => {
        toast.show(t("inventory.useItem", { name: itemName }), "success");
      },
    });
    setConfirmItem(null);
  };

  return (
    <>
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        {/* ── Header ── */}
        <View className="relative items-center justify-center bg-surface px-5 py-4">
          <Pressable
            className="absolute left-5 active:opacity-70"
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.primaryText}
            />
          </Pressable>
          <Text className="font-fredokaSemiBold text-lg text-primaryText">
            {t("inventory.title")}
          </Text>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <LottieView
              source={pawLoadingLottie}
              style={{ width: 80, height: 80 }}
              autoPlay
              loop
            />
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
              />
            }
          >
            {/* ── Tab Switcher ── */}
            <View
              className="mb-4 flex-row rounded-2xl bg-surface p-1"
              style={{ borderWidth: 1, borderColor: colors.borderColor }}
            >
              {(["items", "skins", "fishing"] as TabKey[]).map((tab) => (
                <Pressable
                  key={tab}
                  className="flex-1 items-center rounded-xl py-2.5"
                  style={
                    activeTab === tab
                      ? { backgroundColor: colors.primary }
                      : undefined
                  }
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    className="font-fredokaSemiBold"
                    style={{
                      fontSize: 13,
                      color:
                        activeTab === tab ? colors.whiteText : colors.mutedText,
                    }}
                  >
                    {tab === "items"
                      ? t("inventory.myItems")
                      : tab === "skins"
                        ? t("shop.skins")
                        : t("inventory.fishing")}
                  </Text>
                </Pressable>
              ))}
            </View>

            {activeTab === "items" ? (
              /* ── Items Tab ── */
              (() => {
                const boostItems = ownedItems.filter(
                  ([itemId]) => BOOST_ITEM_CONFIGS[itemId],
                );
                return boostItems.length === 0 ? (
                  <View
                    className="mt-4 items-center rounded-3xl bg-surface py-14"
                    style={{ borderWidth: 1, borderColor: colors.borderColor }}
                  >
                    <CommonSvgAssets.noItem width={80} height={80} />
                    <Text className="mt-3 font-fredokaSemiBold text-base text-mutedText">
                      {t("inventory.noItems")}
                    </Text>
                    <Text className="mt-1 font-fredoka text-sm text-mutedText">
                      {t("inventory.noItemsDesc")}
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row flex-wrap justify-between gap-y-3">
                    {boostItems.map(([itemId, item]) => {
                      const shopItem = getShopItem(itemId);
                      const isEquipped = item.status === "equipped";
                      return (
                        <Pressable
                          key={itemId}
                          className="overflow-hidden rounded-2xl bg-surface active:opacity-80"
                          style={{
                            width: (SCREEN_WIDTH - 52) / 2,
                            borderWidth: isEquipped ? 2 : 1,
                            borderColor: isEquipped
                              ? colors.primary
                              : colors.borderColor,
                          }}
                          onPress={() =>
                            handleUseItem(
                              itemId,
                              getItemDisplayName(itemId),
                              getItemDisplayDescription(itemId),
                            )
                          }
                        >
                          <LinearGradient
                            colors={
                              isEquipped
                                ? [colors.primary + "18", colors.surface]
                                : [colors.surface, colors.surface]
                            }
                            style={{
                              alignItems: "center",
                              paddingVertical: 14,
                            }}
                          >
                            {/* Quantity badge top-right */}
                            <View
                              style={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                backgroundColor: colors.primary + "20",
                                borderRadius: 999,
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                              }}
                            >
                              <Text className="font-fredokaBold text-xs text-primary">
                                x{item.quantity}
                              </Text>
                            </View>
                            {getItemImage(itemId) ? (
                              <Image
                                source={getItemImage(itemId)!}
                                style={{ width: 60, height: 60 }}
                                resizeMode="contain"
                              />
                            ) : (
                              <View
                                style={{
                                  width: 56,
                                  height: 56,
                                  borderRadius: 14,
                                  backgroundColor: colors.primary + "15",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Ionicons
                                  name={
                                    shopItem?.type === "boost"
                                      ? "flash-outline"
                                      : shopItem?.type === "pet"
                                        ? "paw-outline"
                                        : "shirt-outline"
                                  }
                                  size={26}
                                  color={colors.primary}
                                />
                              </View>
                            )}
                          </LinearGradient>
                          <View style={{ padding: 10 }}>
                            <Text
                              className="font-fredokaSemiBold text-sm text-primaryText"
                              numberOfLines={1}
                            >
                              {getItemDisplayName(itemId)}
                            </Text>
                            <Text className="mt-0.5 font-fredoka text-xs text-mutedText">
                              {getItemDisplayDescription(itemId)}
                            </Text>
                            <View className="mt-2 flex-row items-center justify-end">
                              {isEquipped && (
                                <View
                                  className="flex-row items-center gap-1 rounded-full px-2 py-0.5"
                                  style={{
                                    backgroundColor:
                                      colors.inventoryEquippedColor + "20",
                                  }}
                                >
                                  <Ionicons
                                    name="checkmark-circle"
                                    size={12}
                                    color={colors.inventoryEquippedColor}
                                  />
                                  <Text
                                    className="font-fredokaSemiBold"
                                    style={{
                                      fontSize: 10,
                                      color: colors.inventoryEquippedColor,
                                    }}
                                  >
                                    {t("inventory.active")}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                );
              })()
            ) : activeTab === "skins" ? (
              /* ── Skins Tab ── */
              <View className="gap-3">
                {allClothingItems.map((item) => {
                  const config = CLOTHING_ITEM_CONFIGS[item.id];
                  if (!config) return null;
                  const isSelected = selectedSkin === item.id;
                  const isOwned = isItemOwned(item.id);
                  return (
                    <Pressable
                      key={item.id}
                      className="flex-row items-center overflow-hidden rounded-2xl bg-surface active:opacity-80"
                      style={{
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected
                          ? colors.primary
                          : colors.borderColor,
                      }}
                      onPress={() => {
                        if (isOwned) {
                          setSelectedSkin(item.id);
                          setEquippedSkin(item.id);
                          const skinName = t(config.nameKey);
                          toast.show(
                            t("inventory.skinEquipped", { name: skinName }),
                            "success",
                          );
                        } else {
                          toast.show(t("inventory.skinLocked"), "warning");
                        }
                      }}
                    >
                      <View
                        style={{
                          width: 90,
                          height: 90,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: colors.surface,
                        }}
                      >
                        <Image
                          source={config.image}
                          style={{
                            width: 60,
                            height: 60,
                            opacity: isOwned ? 1 : 0.4,
                          }}
                          resizeMode="contain"
                        />
                      </View>
                      <View
                        style={{
                          flex: 1,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                        }}
                      >
                        <Text className="font-fredokaSemiBold text-base text-primaryText">
                          {t(config.nameKey as never)}
                        </Text>
                        <Text className="mt-1 text-xs text-mutedText">
                          {t(config.descKey as never)}
                        </Text>
                        {isSelected && isOwned && (
                          <View
                            className="mt-1 flex-row items-center gap-1 self-start rounded-full px-2.5 py-0.5"
                            style={{
                              backgroundColor:
                                colors.inventoryEquippedColor + "20",
                            }}
                          >
                            <Ionicons
                              name="checkmark-circle"
                              size={12}
                              color={colors.inventoryEquippedColor}
                            />
                            <Text
                              className="font-fredokaSemiBold"
                              style={{
                                fontSize: 10,
                                color: colors.inventoryEquippedColor,
                              }}
                            >
                              {t("inventory.equipped")}
                            </Text>
                          </View>
                        )}
                        {!isOwned && (
                          <View
                            className="mt-1 flex-row items-center gap-1 self-start rounded-full px-2.5 py-0.5"
                            style={{ backgroundColor: colors.mutedText + "18" }}
                          >
                            <Ionicons
                              name="lock-closed"
                              size={11}
                              color={colors.mutedText}
                            />
                            <Text
                              className="font-fredokaSemiBold text-mutedText"
                              style={{ fontSize: 10 }}
                            >
                              {t("inventory.locked")}
                            </Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              /* ── Fishing Tab ── */
              <FishingTabContent
                items={inventory?.items ?? {}}
                userId={userId!}
              />
            )}
          </ScrollView>
        )}
      </SafeAreaView>

      {/* ── Use Item Confirmation Modal ── */}
      <Modal
        visible={!!confirmItem}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setConfirmItem(null)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/50 px-6"
          onPress={() => setConfirmItem(null)}
        >
          <Pressable
            className="w-full rounded-2xl bg-surface p-6"
            onPress={() => {}}
          >
            {/* Item Icon */}
            <View className="mb-3 items-center">
              <View
                className="items-center justify-center rounded-2xl"
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor: colors.primary + "20",
                }}
              >
                {confirmItem && getItemImage(confirmItem.id) ? (
                  <Image
                    source={getItemImage(confirmItem.id)!}
                    style={{ width: 48, height: 48 }}
                    resizeMode="contain"
                  />
                ) : (
                  <Ionicons name="cube" size={28} color={colors.primary} />
                )}
              </View>
            </View>

            {/* Title */}
            <Text className="mb-2 text-center font-fredokaSemiBold text-lg text-primaryText">
              {t("inventory.confirmUseTitle")}
            </Text>

            {/* Item Name */}
            <Text className="mb-5 text-center font-fredokaSemiBold text-base text-secondaryText">
              {confirmItem?.name}
            </Text>

            {/* Buttons */}
            <View className="flex-row justify-end gap-3">
              <Pressable
                className="rounded-xl px-5 py-2.5 active:opacity-70"
                onPress={() => setConfirmItem(null)}
              >
                <Text className="font-fredokaMedium text-base text-secondaryText">
                  {t("common.cancel")}
                </Text>
              </Pressable>
              <Pressable
                className="rounded-xl px-5 py-2.5 active:opacity-70"
                style={{ backgroundColor: colors.primary }}
                onPress={doUseItem}
              >
                <Text className="font-fredokaSemiBold text-base text-whiteText">
                  {t("inventory.useConfirm")}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
