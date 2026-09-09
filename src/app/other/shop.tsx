import { useGetInventory } from "@/src/api/game/useGetInventory";
import { type ShopItem, useGetShopItems } from "@/src/api/game/useGetShopItems";
import { usePurchaseItem } from "@/src/api/game/usePurchaseItem";
import { ShopImageAssets } from "@/src/constants/assets/shopAssets";
import useTheme from "@/src/hooks/useTheme";
import { useToast } from "@/src/hooks/useToast";
import { ShopItemsTab } from "@/src/screens/shopScreen/ShopItemsTab";
import { ShopSkinsTab } from "@/src/screens/shopScreen/ShopSkinsTab";
import {
  ALL_ITEM_CONFIGS,
  type TabKey,
} from "@/src/screens/shopScreen/shopConstants";
import useUserStore from "@/src/stores/useUserStore";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ShopRoute() {
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { userId, setEquippedSkin } = useUserStore();
  const { data: inventoryData, refetch: refetchInventory } = useGetInventory(
    userId!,
  );
  const {
    data: shopData,
    isLoading,
    refetch: refetchShopItems,
  } = useGetShopItems();
  const { mutate: purchaseItem, isPending } = usePurchaseItem(userId || "");
  const pawCoins = inventoryData?.inventory?.pawCoins ?? 0;
  const items = shopData?.items ?? [];

  const [activeTab, setActiveTab] = useState<TabKey>("items");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["inventory", userId] });
      }
    }, [userId, queryClient]),
  );

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([refetchInventory(), refetchShopItems()]);
    setIsRefreshing(false);
  }, [refetchInventory, refetchShopItems]);

  const handlePurchase = (item: ShopItem) => {
    if (!userId || isPending) return;
    // Get display name from config or fallback to API name
    const config = ALL_ITEM_CONFIGS[item.id];
    const displayName = config ? t(config.nameKey as never) : item.name;
    purchaseItem(
      { itemId: item.id },
      {
        onSuccess: () =>
          toast.show(
            t("home.shopPurchaseSuccess", { name: displayName }),
            "success",
          ),
      },
    );
  };

  const handleEquipSkin = (item: ShopItem) => {
    setEquippedSkin(item.id);
    const config = ALL_ITEM_CONFIGS[item.id];
    const displayName = config ? t(config.nameKey as never) : item.name;
    toast.show(t("inventory.skinEquipped", { name: displayName }), "success");
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={[]}
    >
      <View className="flex-1">
        {/* -- Header -- */}
        <LinearGradient
          colors={[colors.primary + "18", colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            paddingHorizontal: 20,
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: 0,
          }}
        >
          <View className="relative items-center justify-center">
            <Pressable
              className="absolute left-0 items-center justify-center active:opacity-70"
              onPress={() => router.back()}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={colors.primaryText}
              />
            </Pressable>
            <Text className="font-fredokaSemiBold text-lg text-primaryText">
              {t("home.shop")}
            </Text>
          </View>
          <View style={{ alignItems: "center", marginTop: 4 }}>
            <Image
              source={ShopImageAssets.shop}
              style={{ width: SCREEN_WIDTH - 40, height: 160 }}
              resizeMode="contain"
            />
          </View>
          <View
            style={{
              alignSelf: "center",
              flexDirection: "row",
              alignItems: "center",
            }}
            className="mb-4"
          >
            <Ionicons name="sparkles" size={12} color={colors.primary} />
            <Text
              className="font-fredokaMedium text-mutedText"
              style={{
                fontSize: 11,
                marginLeft: 8,
                textAlign: "left",
                maxWidth: SCREEN_WIDTH - 80,
              }}
            >
              {t("home.shopHeroNote")}
            </Text>
          </View>
        </LinearGradient>

        {/* -- Coins Display -- */}
        <View
          className="mx-5 mb-3 flex-row items-center justify-end"
          style={{ gap: 4 }}
        >
          <Image
            source={ShopImageAssets.pawCoin5x}
            style={{ width: 30, height: 30 }}
            resizeMode="contain"
          />
          <Text className="font-fredokaBold text-sm text-primaryText">
            {pawCoins}
          </Text>
        </View>

        {/* -- Tab Switcher -- */}
        <View
          className="mx-5 mb-4 flex-row rounded-2xl bg-surface p-1"
          style={{ borderWidth: 1, borderColor: colors.borderColor }}
        >
          {(["items", "skins"] as TabKey[]).map((tab) => (
            <Pressable
              key={tab}
              className="flex-1 items-center rounded-xl py-2.5"
              style={
                activeTab === tab
                  ? { backgroundColor: colors.primary }
                  : undefined
              }
              onPress={() => switchTab(tab)}
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
                  ? t("home.shopPlaceholderTag")
                  : t("shop.skins")}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* -- Content -- */}
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        >
          {activeTab === "items" ? (
            <ShopItemsTab
              items={items}
              isLoading={isLoading}
              pawCoins={pawCoins}
              isPending={isPending}
              onPurchase={handlePurchase}
              colors={colors}
            />
          ) : (
            <ShopSkinsTab
              items={items}
              colors={colors}
              ownedItems={inventoryData?.inventory?.items ?? {}}
              isPending={isPending}
              onPurchase={handlePurchase}
              onEquip={handleEquipSkin}
            />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
