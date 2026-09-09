import type { InventoryItem } from "@/src/api/game/useGetInventory";
import { useUseItem } from "@/src/api/game/useUseItem";
import { FishingImageAssets } from "@/src/constants/assets/fishingAssets";
import useTheme from "@/src/hooks/useTheme";
import { useToast } from "@/src/hooks/useToast";
import {
  FISH_CONFIGS,
  type FishConfig,
  type FishRarity,
  RARITY_I18N_KEY,
  RARITY_ORDER,
} from "@/src/screens/fishingScreen/fishingConstants";
import { playFishingCastSfx, playFishingRevealSfx } from "@/src/utils/sfx";
import { getItem, setItem } from "@/src/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface FishingTabContentProps {
  items: Record<string, InventoryItem>;
  userId: string;
}

type CastState = "idle" | "playing" | "result";

/**
 * Shows the fishing GIF animation. Replaces the previous expo-video approach
 * which had an unresolvable decoder freeze on the second draw.
 */
function FishingVideoLayer() {
  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { alignItems: "center", justifyContent: "center" },
      ]}
    >
      <Image
        source={FishingImageAssets.fishingAnimation}
        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
        resizeMode="contain"
      />
    </View>
  );
}

/** Animated pulsing glow border for EPIC / LEGENDARY fish cards */
function GlowingFishCard({
  rarity,
  glowColor,
  cardWidth,
  children,
}: {
  rarity: FishRarity;
  glowColor: string;
  cardWidth: number;
  children: React.ReactNode;
}) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (rarity !== "EPIC" && rarity !== "LEGENDARY") return;
    const duration = rarity === "LEGENDARY" ? 1200 : 1800;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [rarity, glowAnim]);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [glowColor + "40", glowColor + "FF"],
  });

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, rarity === "LEGENDARY" ? 0.85 : 0.55],
  });

  const scale =
    rarity === "LEGENDARY"
      ? glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.03],
        })
      : 1;

  if (rarity !== "EPIC" && rarity !== "LEGENDARY") {
    return (
      <View
        className="overflow-hidden rounded-2xl bg-surface"
        style={{
          width: cardWidth,
          borderWidth: 1.5,
          borderColor: glowColor + "50",
        }}
      >
        {children}
      </View>
    );
  }

  return (
    <Animated.View
      style={{
        width: cardWidth,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor,
        overflow: "hidden",
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: rarity === "LEGENDARY" ? 10 : 6,
        shadowOpacity,
        elevation: 6,
        transform: [{ scale }],
      }}
    >
      {children}
    </Animated.View>
  );
}

function getRarityColor(
  rarity: FishRarity,
  colors: ReturnType<typeof useTheme>["colors"],
): string {
  switch (rarity) {
    case "COMMON":
      return colors.fishingRarityCommon;
    case "RARE":
      return colors.fishingRarityRare;
    case "EPIC":
      return colors.fishingRarityEpic;
    case "LEGENDARY":
      return colors.fishingRarityLegendary;
  }
}

function getRarityConfettiColors(rarity: FishRarity): string[] {
  switch (rarity) {
    case "COMMON":
      return ["#9CA3AF", "#D1D5DB", "#6B7280", "#E5E7EB"];
    case "RARE":
      return ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#1D4ED8"];
    case "EPIC":
      return ["#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE", "#6D28D9", "#FF6B9D"];
    case "LEGENDARY":
      return [
        "#F59E0B",
        "#FBBF24",
        "#FCD34D",
        "#FDE68A",
        "#D97706",
        "#FF4500",
        "#FF8C00",
      ];
  }
}

export function FishingTabContent({ items, userId }: FishingTabContentProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const toast = useToast();
  const useItem = useUseItem(userId);

  const [castState, setCastState] = useState<CastState>("idle");
  const [castKey, setCastKey] = useState(0);
  const [lootItemId, setLootItemId] = useState<string | null>(null);
  const resultAnim = useRef(new Animated.Value(0)).current;

  // NEW! badge — ids of fish species never seen by this user before this session
  const [newFishIds, setNewFishIds] = useState<Set<string>>(new Set());
  const seenFishIdsRef = useRef<Set<string>>(new Set());

  // Load seen fish IDs from storage on mount
  useEffect(() => {
    void getItem<string[]>("seenFishIds").then((stored) => {
      seenFishIdsRef.current = new Set(stored ?? []);
    });
  }, []);

  const handleVideoEnd = useCallback(() => setCastState("result"), []);

  // GIF animation duration (fishing_mobile.gif: 40 frames × 100 ms = 4000 ms).
  // Reward appears 1 second early (3200 ms instead of 4200 ms).
  useEffect(() => {
    if (castState !== "playing") return;
    const timer = setTimeout(handleVideoEnd, 3200);
    return () => clearTimeout(timer);
  }, [castState, handleVideoEnd]);

  // Fish detail bottom sheet
  const [selectedFish, setSelectedFish] = useState<FishConfig | null>(null);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const openFishDetail = (id: string, config: FishConfig) => {
    setSelectedFish(config);
    sheetAnim.setValue(0);
    Animated.spring(sheetAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 9,
      tension: 70,
    }).start();
    // Mark this fish as seen — remove NEW! badge
    if (newFishIds.has(id)) {
      seenFishIdsRef.current.add(id);
      setNewFishIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      void setItem("seenFishIds", [...seenFishIdsRef.current]);
    }
  };

  const closeFishDetail = () => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSelectedFish(null));
  };

  // Animate result overlay in when result arrives; play reveal SFX
  useEffect(() => {
    if (castState === "result") {
      resultAnim.setValue(0);
      Animated.spring(resultAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 7,
        tension: 60,
      }).start();
      const config = lootItemId ? FISH_CONFIGS[lootItemId] : null;
      if (config) {
        playFishingRevealSfx(config.rarity);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [castState]);

  const baitQuantity = items?.FISHBAIT_GENERAL?.quantity ?? 0;

  // Gather caught fish from inventory
  const caughtFish = Object.entries(items ?? {}).filter(
    ([id, item]) =>
      (id.startsWith("COMMON_") ||
        id.startsWith("RARE_") ||
        id.startsWith("EPIC_") ||
        id.startsWith("LEGENDARY_")) &&
      item.quantity > 0,
  );

  const handleCastLine = () => {
    if (castState !== "idle" || baitQuantity <= 0) return;
    playFishingCastSfx();
    useItem.mutate("FISHBAIT_GENERAL", {
      onSuccess: (data) => {
        const loot = data.loot;
        let itemId: string | undefined;
        if (Array.isArray(loot) && loot.length > 0) {
          itemId = loot[0].itemId;
        } else if (loot && !Array.isArray(loot)) {
          itemId = (loot as { itemId: string }).itemId;
        }
        setLootItemId(itemId ?? null);
        // Check if this is a newly-seen fish species
        if (itemId && !seenFishIdsRef.current.has(itemId)) {
          setNewFishIds((prev) => new Set([...prev, itemId!]));
        }
        setCastKey((k) => k + 1);
        setCastState("playing");
      },
      onError: () => {
        setCastState("idle");
      },
    });
  };

  const handleDismissResult = () => {
    setCastState("idle");
    setLootItemId(null);
  };

  const lootConfig = lootItemId ? FISH_CONFIGS[lootItemId] : null;

  return (
    <>
      {/* ── Bait Card ── */}
      <View
        className="mb-4 overflow-hidden rounded-3xl bg-surface"
        style={{ borderWidth: 1, borderColor: colors.borderColor }}
      >
        <LinearGradient
          colors={[colors.primary + "14", colors.surface]}
          style={{ padding: 16 }}
        >
          <View className="flex-row items-center gap-3">
            <Image
              source={FishingImageAssets.bait}
              style={{ width: 64, height: 64 }}
              resizeMode="contain"
            />
            <View className="flex-1">
              <Text className="font-fredokaSemiBold text-base text-primaryText">
                {t("fishing.baitName")}
              </Text>
              <Text className="mt-0.5 font-fredoka text-sm text-mutedText">
                {t("fishing.baitDesc")}
              </Text>
              <View className="mt-2 flex-row items-center gap-2">
                <View
                  className="rounded-full px-2.5 py-0.5"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  <Text className="font-fredokaBold text-sm text-primary">
                    ×{baitQuantity}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {baitQuantity > 0 ? (
            <Pressable
              className="mt-3 items-center rounded-2xl py-3 active:opacity-75"
              style={{
                backgroundColor:
                  castState !== "idle" ? colors.mutedText : colors.primary,
              }}
              onPress={handleCastLine}
              disabled={castState !== "idle"}
            >
              <Text className="font-fredokaSemiBold text-base text-whiteText">
                {t("fishing.castLine")}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              className="mt-3 items-center rounded-2xl py-3 active:opacity-60"
              style={{ backgroundColor: colors.mutedText + "30" }}
              onPress={() => toast.show(t("fishing.noBaitDesc"), "info")}
            >
              <Text className="font-fredokaSemiBold text-base text-mutedText">
                {t("fishing.castLine")}
              </Text>
            </Pressable>
          )}
        </LinearGradient>
      </View>

      {/* ── Fish Collection ── */}
      <Text className="mb-3 font-fredokaSemiBold text-sm text-mutedText">
        {t("fishing.fishCollection").toUpperCase()}
      </Text>
      {caughtFish.length === 0 ? (
        <View
          className="items-center rounded-3xl bg-surface py-12"
          style={{ borderWidth: 1, borderColor: colors.borderColor }}
        >
          <FishingImageAssets.noItem width={80} height={80} />
          <Text className="mt-4 font-fredokaSemiBold text-base text-primaryText">
            {t("fishing.noFishYet")}
          </Text>
          <Text className="mt-1 font-fredoka text-sm text-mutedText">
            {t("fishing.noFishYetDesc")}
          </Text>
        </View>
      ) : (
        RARITY_ORDER.map((rarity) => {
          const rarityColor = getRarityColor(rarity, colors);
          const allInRarity = Object.entries(FISH_CONFIGS).filter(
            ([, cfg]) => cfg.rarity === rarity,
          );
          return (
            <View key={rarity} className="mb-4">
              <View className="mb-2 flex-row items-center gap-2">
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: rarityColor,
                  }}
                />
                <Text
                  className="font-fredokaSemiBold text-xs"
                  style={{ color: rarityColor }}
                >
                  {t(RARITY_I18N_KEY[rarity]).toUpperCase()}
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {allInRarity.map(([id, cfg]) => {
                  const owned = (items?.[id]?.quantity ?? 0) > 0;
                  const cardWidth = (SCREEN_WIDTH - 60) / 3;
                  return (
                    <GlowingFishCard
                      key={id}
                      rarity={owned ? rarity : "COMMON"}
                      glowColor={owned ? rarityColor : colors.borderColor}
                      cardWidth={cardWidth}
                    >
                      <Pressable
                        className="overflow-hidden rounded-2xl bg-surface active:opacity-75"
                        style={{
                          width: cardWidth,
                          opacity: owned ? 1 : 0.55,
                        }}
                        onPress={() => owned && openFishDetail(id, cfg)}
                      >
                        <LinearGradient
                          colors={
                            owned
                              ? [rarityColor + "12", colors.surface]
                              : [colors.secondaryBackground, colors.surface]
                          }
                          style={{ alignItems: "center", paddingVertical: 10 }}
                        >
                          {/* Quantity badge (top right) */}
                          {owned && (
                            <View
                              style={{
                                position: "absolute",
                                top: 5,
                                right: 6,
                                backgroundColor: rarityColor + "25",
                                borderRadius: 999,
                                paddingHorizontal: 5,
                                paddingVertical: 1,
                                zIndex: 2,
                              }}
                            >
                              <Text
                                className="font-fredokaBold"
                                style={{ fontSize: 10, color: rarityColor }}
                              >
                                ×{items?.[id]?.quantity}
                              </Text>
                            </View>
                          )}
                          {/* NEW! badge */}
                          {owned && newFishIds.has(id) && (
                            <View
                              style={{
                                position: "absolute",
                                top: 5,
                                left: 6,
                                backgroundColor: colors.notificationBadge,
                                borderRadius: 999,
                                paddingHorizontal: 5,
                                paddingVertical: 1,
                                zIndex: 1,
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: "Fredoka_700Bold",
                                  fontSize: 9,
                                  color: "#FFF",
                                  letterSpacing: 0.4,
                                }}
                              >
                                NEW!
                              </Text>
                            </View>
                          )}
                          <Image
                            source={cfg.image}
                            style={{
                              width: 52,
                              height: 52,
                              tintColor: owned ? undefined : "#888",
                            }}
                            resizeMode="contain"
                          />
                        </LinearGradient>
                        <View className="px-2 py-1.5">
                          <Text
                            className="font-fredokaSemiBold text-xs text-primaryText"
                            numberOfLines={1}
                          >
                            {owned ? t(cfg.nameKey as never) : "???"}
                          </Text>
                        </View>
                      </Pressable>
                    </GlowingFishCard>
                  );
                })}
              </View>
            </View>
          );
        })
      )}

      {/* ── Fish Detail Bottom Sheet ── */}
      <Modal
        visible={selectedFish !== null}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={closeFishDetail}
      >
        <Pressable
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: "rgba(0,0,0,0.5)" },
          ]}
          onPress={closeFishDetail}
        />
        {selectedFish &&
          (() => {
            const config = selectedFish;
            const rarityColor = getRarityColor(config.rarity, colors);
            return (
              <Animated.View
                style={[
                  styles.bottomSheet,
                  { backgroundColor: colors.surface },
                  {
                    transform: [
                      {
                        translateY: sheetAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [400, 0],
                        }),
                      },
                    ],
                    opacity: sheetAnim,
                  },
                ]}
              >
                {/* Handle bar */}
                <View
                  style={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: colors.borderColor,
                    alignSelf: "center",
                    marginBottom: 20,
                  }}
                />

                {/* Name + Rarity row */}
                <View className="mb-4 flex-row items-center justify-between">
                  <Text
                    className="font-fredokaBold text-xl text-primaryText"
                    style={{ flexShrink: 1, marginRight: 12 }}
                    numberOfLines={1}
                  >
                    {t(config.nameKey as never)}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: rarityColor + "25",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Fredoka_600SemiBold",
                        fontSize: 12,
                        color: rarityColor,
                        letterSpacing: 0.8,
                      }}
                    >
                      {t(RARITY_I18N_KEY[config.rarity]).toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Fish image */}
                <View className="mb-4 items-center self-center">
                  <Image
                    source={config.image}
                    style={{ width: 160, height: 160 }}
                    resizeMode="contain"
                  />
                </View>

                {/* Description */}
                <Text
                  className="font-fredoka text-sm text-mutedText"
                  style={{ lineHeight: 20, textAlign: "center" }}
                >
                  {t(config.descKey as never)}
                </Text>

                {/* Close button */}
                <Pressable
                  onPress={closeFishDetail}
                  className="mt-6 items-center rounded-2xl py-3 active:opacity-75"
                  style={{ backgroundColor: rarityColor }}
                >
                  <Text
                    style={{
                      fontFamily: "Fredoka_600SemiBold",
                      fontSize: 15,
                      color: "#FFF",
                    }}
                  >
                    {t("common.close")}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })()}
      </Modal>

      {/* ── Fishing Animation Modal ── */}
      <Modal
        visible={castState !== "idle"}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={
          castState === "result" ? handleDismissResult : undefined
        }
      >
        <View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: "#000" }]}
        >
          {/* GIF animation — no player prop needed */}
          <FishingVideoLayer />

          {/* Dark scrim shown when result is ready */}
          {castState === "result" && (
            <View
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: "rgba(0,0,0,0.65)" },
              ]}
            />
          )}

          {/* Result card */}
          {castState === "result" && lootConfig && (
            <Animated.View
              style={[
                styles.resultCard,
                {
                  transform: [
                    {
                      scale: resultAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.75, 1],
                      }),
                    },
                  ],
                  opacity: resultAnim,
                },
              ]}
            >
              {/* Rarity glow ring */}
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor:
                    getRarityColor(lootConfig.rarity, colors) + "30",
                  borderWidth: 3,
                  borderColor: getRarityColor(lootConfig.rarity, colors),
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Image
                  source={lootConfig.image}
                  style={{ width: 90, height: 90 }}
                  resizeMode="contain"
                />
              </View>

              {/* Rarity badge */}
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 3,
                  borderRadius: 999,
                  backgroundColor:
                    getRarityColor(lootConfig.rarity, colors) + "25",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Fredoka_600SemiBold",
                    fontSize: 12,
                    color: getRarityColor(lootConfig.rarity, colors),
                    letterSpacing: 1,
                  }}
                >
                  {t(RARITY_I18N_KEY[lootConfig.rarity]).toUpperCase()}
                </Text>
              </View>

              <Text
                style={{
                  fontFamily: "Fredoka_600SemiBold",
                  fontSize: 22,
                  color: "#FFFFFF",
                  textAlign: "center",
                  marginBottom: 6,
                }}
              >
                {t(lootConfig.nameKey as never)}
              </Text>
              <Text
                style={{
                  fontFamily: "Fredoka_400Regular",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.75)",
                  textAlign: "center",
                  paddingHorizontal: 24,
                  marginBottom: 24,
                  lineHeight: 18,
                }}
                numberOfLines={3}
              >
                {t(lootConfig.descKey as never)}
              </Text>

              <Pressable
                onPress={handleDismissResult}
                style={{
                  backgroundColor: getRarityColor(lootConfig.rarity, colors),
                  paddingHorizontal: 40,
                  paddingVertical: 12,
                  borderRadius: 16,
                }}
                className="active:opacity-80"
              >
                <Text
                  style={{
                    fontFamily: "Fredoka_600SemiBold",
                    fontSize: 16,
                    color: "#FFFFFF",
                  }}
                >
                  {t("fishing.claim")}
                </Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Unknown loot fallback */}
          {castState === "result" && !lootConfig && (
            <View style={styles.resultCard}>
              <Ionicons name="fish" size={64} color={colors.primary} />
              <Pressable
                onPress={handleDismissResult}
                style={{
                  marginTop: 20,
                  backgroundColor: colors.primary,
                  paddingHorizontal: 40,
                  paddingVertical: 12,
                  borderRadius: 16,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Fredoka_600SemiBold",
                    fontSize: 16,
                    color: "#FFFFFF",
                  }}
                >
                  {t("fishing.claim")}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  resultCard: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
  },
});
