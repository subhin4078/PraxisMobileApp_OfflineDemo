import { type Buff, useGetBuffs } from "@/src/api/game/useGetBuffs";
import { useGetProgression } from "@/src/api/game/useGetProgression";
import { ShopImageAssets } from "@/src/constants/assets/shopAssets";
import { type CatKey, getCatKey } from "@/src/constants/catConstants";
import useTheme from "@/src/hooks/useTheme";
import useUserStore from "@/src/stores/useUserStore";
import { shouldNavigate } from "@/src/utils";
import { getItem, setItem } from "@/src/utils/storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  Text,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { SvgXml } from "react-native-svg";

// ─── Buff remaining-time helper ────────────────────────────────────────────
function formatBuffRemaining(expiresAt: string): string | null {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const totalMin = Math.floor(diff / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0
    ? `${h}:${m.toString().padStart(2, "0")}:00`
    : `${m.toString().padStart(2, "0")}:${Math.floor((diff % 60_000) / 1000)
        .toString()
        .padStart(2, "0")}`;
}

function isXpBuff(buff: Buff) {
  return buff.buff.toLowerCase().includes("xp");
}
function isCoinBuff(buff: Buff) {
  const b = buff.buff.toLowerCase();
  return b.includes("coin") || b.includes("paw");
}

// ─── Circular avatar constants ─────────────────────────────────────────────
const AVATAR_RADIUS = 40;
const STROKE_W = 4;
const AVATAR_SIZE = (AVATAR_RADIUS + STROKE_W) * 2;
const INNER_AVATAR = AVATAR_SIZE - STROKE_W * 2 - 4;
const CIRCUMFERENCE = 2 * Math.PI * AVATAR_RADIUS;

// ─── Coin SVG factory (colors injected from theme at render time) ─────────
function makeCoinSvg(dark: string, light: string) {
  return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <path d="M21,24H11a2,2,0,0,0-2,2v2a2,2,0,0,0,2,2H21a2,2,0,0,0,2-2V26A2,2,0,0,0,21,24Zm0,4H11V26H21Z" fill="${dark}" stroke="${dark}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M28.707,14.293l-12-12a.9994.9994,0,0,0-1.414,0l-12,12A1,1,0,0,0,4,16H9v4a2.0023,2.0023,0,0,0,2,2H21a2.0027,2.0027,0,0,0,2-2V16h5a1,1,0,0,0,.707-1.707ZM21,14v6H11V14H6.4141L16,4.4141,25.5859,14Z" fill="${light}" stroke="${light}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
</svg>`;
}

function getRankIndex(level: number): number {
  return Math.min(Math.max(Math.floor(level / 10), 0), 8);
}

export function HomeHeader() {
  const { colors } = useTheme();
  const username = useUserStore((state) => state.username);
  const userId = useUserStore((state) => state.userId);
  const equippedSkin = useUserStore((state) => state.equippedSkin);
  const { t } = useTranslation();
  const router = useRouter();

  // Map equipped skin ID to image
  const SKIN_IMAGES: Record<string, ImageSourcePropType> = {
    DEFAULT_CAT: ShopImageAssets.defaultCat,
    ROLLINGCAT_CUTE: ShopImageAssets.rollingCatCute,
    ROLLINGCAT_NEON: ShopImageAssets.rollingCatNeon,
    ROLLINGCAT_RAINBOW: ShopImageAssets.rollingCatRainbow,
  };

  const currentAvatarImage =
    equippedSkin && SKIN_IMAGES[equippedSkin]
      ? SKIN_IMAGES[equippedSkin]
      : ShopImageAssets.defaultCat;

  const COIN_SVG = makeCoinSvg(colors.coinSvgDark, colors.coinSvgLight);
  const COIN_SVG_GREEN = makeCoinSvg(
    colors.xpBuffColor,
    colors.xpBuffColorLight,
  );

  const { data } = useGetProgression(userId ?? "");
  const { data: buffsData } = useGetBuffs(userId ?? "");
  const prog = data?.progression;
  const level = prog?.level ?? 1;
  const xp = prog?.xp ?? 0;
  const xpToNextLevel = prog?.xpToNextLevel ?? 100;

  const catKey = getCatKey(level);
  const rankIndex = getRankIndex(level);
  const rankStorageKey = `lastSeenRankIndex:${userId ?? "guest"}` as const;
  const rankColors = colors.prefixRankColors[rankIndex];
  // 0 = hidden, 1 = fraction, 2 = percentage
  const [xpMode, setXpMode] = useState(0);
  const [selectedBuff, setSelectedBuff] = useState<string | null>(null);
  const [, setTick] = useState(0); // force re-render every minute for buff countdown
  const [showRankDot, setShowRankDot] = useState(false);

  // Check if user reached a new rank since last time
  useEffect(() => {
    if (!userId || !prog) return;

    let isMounted = true;

    void (async () => {
      const stored = await getItem<number>(rankStorageKey);
      if (!isMounted) return;

      if (stored === null) {
        // First time – store current rank, no dot
        await setItem(rankStorageKey, rankIndex);
        if (isMounted) setShowRankDot(false);
      } else if (rankIndex > stored) {
        setShowRankDot(true);
      } else {
        // Keep storage in sync if rank data was reset or moved backwards.
        if (rankIndex < stored) {
          await setItem(rankStorageKey, rankIndex);
        }
        if (isMounted) setShowRankDot(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [rankIndex, rankStorageKey, userId, prog]);

  // Filter to active (non-expired) buffs
  const activeBuffs = (buffsData?.buffs ?? []).filter(
    (b) => new Date(b.expiresAt).getTime() > Date.now(),
  );
  const activeXpBuff = activeBuffs.find(isXpBuff) ?? null;
  const activeCoinBuff = activeBuffs.find(isCoinBuff) ?? null;

  // Re-render every second so countdown stays up-to-date
  useEffect(() => {
    if (activeBuffs.length === 0) return;
    const timer = setInterval(() => setTick((t) => t + 1), 1_000);
    return () => clearInterval(timer);
  }, [activeBuffs.length]);

  // Close buff popup when navigating away
  useFocusEffect(
    useCallback(() => {
      return () => setSelectedBuff(null);
    }, []),
  );

  const denom = xp + xpToNextLevel;
  const pct = denom > 0 ? Math.min(xp / denom, 1) : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - pct);

  const xpLabel =
    xpMode === 1
      ? `${xp} / ${xp + xpToNextLevel} XP`
      : xpMode === 2
        ? `${Math.round(pct * 100)}%`
        : null;

  return (
    <View className="bg-background px-5 pb-5 pt-3">
      <View className="flex-row items-center">
        {/* ── Avatar ─────────────────────────────────────────────── */}
        <Pressable
          onPress={() => setXpMode((m) => (m + 1) % 3)}
          style={{ marginRight: 12 }}
        >
          <View
            style={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* XP ring */}
            <Svg
              width={AVATAR_SIZE}
              height={AVATAR_SIZE}
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <Circle
                cx={AVATAR_SIZE / 2}
                cy={AVATAR_SIZE / 2}
                r={AVATAR_RADIUS}
                stroke={colors.svgRingTrack}
                strokeWidth={STROKE_W}
                fill="none"
              />
              <Circle
                cx={AVATAR_SIZE / 2}
                cy={AVATAR_SIZE / 2}
                r={AVATAR_RADIUS}
                stroke={colors.primary}
                strokeWidth={STROKE_W}
                fill="none"
                strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                strokeDashoffset={strokeDashoffset}
                rotation={-90}
                origin={`${AVATAR_SIZE / 2}, ${AVATAR_SIZE / 2}`}
                strokeLinecap="round"
              />
            </Svg>

            {/* Cat animation */}
            <View
              style={{
                width: INNER_AVATAR,
                height: INNER_AVATAR,
                borderRadius: INNER_AVATAR / 2,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Image
                source={currentAvatarImage}
                style={{ width: INNER_AVATAR, height: INNER_AVATAR }}
                resizeMode="contain"
              />
            </View>

            {/* XP label overlay (shown when xpMode != 0) — float above avatar */}
            {xpLabel && (
              <View
                style={{
                  position: "absolute",
                  top: -10,
                  left: 0,
                  right: 0,
                  alignItems: "center",
                  zIndex: 20,
                  pointerEvents: "none",
                }}
              >
                <View
                  style={{
                    backgroundColor: colors.overlayDark80,
                    borderRadius: 6,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    style={{
                      color: colors.whiteText,
                      fontSize: 10,
                      fontFamily: "Fredoka_500Medium",
                    }}
                  >
                    {xpLabel}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Level badge — overlapping bottom edge */}
          <View
            style={{
              position: "absolute",
              bottom: -10,
              left: 0,
              right: 0,
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <View
              style={{
                backgroundColor: colors.primary,
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  color: colors.whiteText,
                  fontSize: 12,
                  fontFamily: "Fredoka_600SemiBold",
                  letterSpacing: 0.3,
                }}
              >
                {t("common.levelAbbr")} {level}
              </Text>
            </View>
          </View>
        </Pressable>

        {/* ── Center text ─────────────────────────────────────────── */}
        <View style={{ flex: 1 }}>
          {/* Row: Cat-level prefix */}
          <View style={{ alignItems: "flex-start" }}>
            <Pressable
              onPress={() => {
                if (shouldNavigate()) {
                  if (showRankDot) {
                    setShowRankDot(false);
                    void setItem(rankStorageKey, rankIndex);
                  }
                  router.push("/other/prefix-intro" as never);
                }
              }}
              style={{
                backgroundColor: rankColors.labelBg,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 6,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: rankColors.labelText,
                  fontSize: 12,
                  lineHeight: 14,
                  fontFamily: "Fredoka_600SemiBold",
                }}
              >
                {t(`catLevel.${catKey}` as never)}
              </Text>
              {showRankDot && (
                <View
                  style={{
                    position: "absolute",
                    top: -3,
                    right: -3,
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: colors.error,
                  }}
                />
              )}
            </Pressable>
          </View>

          {/* Username below prefix */}
          <Text
            style={{
              fontFamily: "Fredoka_600SemiBold",
              fontSize: 32,
              color: colors.primaryText,
              lineHeight: 38,
              marginBottom: 4,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {username}
          </Text>

          {/* Cat-level description */}
          <Text
            style={{
              fontFamily: "Fredoka_400Regular",
              fontSize: 12,
              color: colors.mutedText,
            }}
          >
            {t(`catLevel.${catKey}Desc` as never)}
          </Text>
        </View>

        {/* ── Buff buttons (right column) — only shows active buffs ──── */}
        <View
          style={{ width: 52, alignItems: "center", gap: 6, marginLeft: 8 }}
        >
          {[activeCoinBuff, activeXpBuff].filter(Boolean).map((buff) => {
            const isXp = isXpBuff(buff!);
            const remaining = formatBuffRemaining(buff!.expiresAt);
            if (!remaining) return null;
            const id = buff!.buff;

            return (
              <View key={id} style={{ alignItems: "flex-end" }}>
                <Pressable
                  onPress={() => setSelectedBuff((s) => (s === id ? null : id))}
                  style={({ pressed }) => ({
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: isXp
                      ? pressed
                        ? colors.buffXpBgPressed
                        : colors.buffXpBg
                      : pressed
                        ? colors.buffCoinBgPressed
                        : colors.buffCoinBg,
                    borderWidth: 1.5,
                    borderColor:
                      selectedBuff === id
                        ? isXp
                          ? colors.xpBuffColor
                          : colors.primary
                        : isXp
                          ? colors.buffXpBorder
                          : colors.buffCoinBorder,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: isXp
                      ? colors.xpBuffColor
                      : colors.buffCoinBorder,
                    shadowOpacity: pressed ? 0.4 : 0.12,
                    shadowRadius: 4,
                    elevation: pressed ? 3 : 1,
                  })}
                >
                  <SvgXml
                    xml={isXp ? COIN_SVG_GREEN : COIN_SVG}
                    width={28}
                    height={28}
                  />
                </Pressable>

                {/* Buff tooltip — floats left so it doesn't clip */}
                {selectedBuff === id && (
                  <View
                    style={{
                      position: "absolute",
                      right: 52,
                      top: 0,
                      backgroundColor: colors.overlayDark92,
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 7,
                      width: 148,
                      zIndex: 50,
                    }}
                  >
                    <Text
                      style={{
                        color: isXp
                          ? colors.buffXpBorder
                          : colors.buffCoinBorder,
                        fontSize: 12,
                        fontFamily: "Fredoka_600SemiBold",
                      }}
                    >
                      {isXp
                        ? t("home.buffDoubleXp")
                        : t("home.buffDoubleCoins")}
                    </Text>
                    <Text
                      style={{
                        color: colors.buffTooltipMutedText,
                        fontSize: 11,
                        fontFamily: "Fredoka_400Regular",
                        marginTop: 3,
                      }}
                    >
                      {t("home.buffRemaining", { time: remaining })}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
