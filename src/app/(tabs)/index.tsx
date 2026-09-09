import useTheme from "@/src/hooks/useTheme";
import { connectBattleSocket, onBattleEvent } from "@/src/lib/battleSocket";
import { HomeDailyChallenge } from "@/src/screens/homeScreen/HomeDailyChallenge";
import { HomeFeatureButtons } from "@/src/screens/homeScreen/HomeFeatureButtons";
import { HomeHeader } from "@/src/screens/homeScreen/HomeHeader";
import { HomeRecentActivity } from "@/src/screens/homeScreen/HomeRecentActivity";
import { HomeStatsGrid } from "@/src/screens/homeScreen/HomeStatsGrid";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useBattleStore } from "@/src/stores/useBattleStore";
import useUserStore from "@/src/stores/useUserStore";
import { shouldNavigate } from "@/src/utils";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BackHandler,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeTab() {
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { userId } = useUserStore();
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  const { setActiveBattle } = useBattleStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);

  // ── Reconnection: connect to battle socket and listen for battle:sync ──
  const hasRedirectedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      hasRedirectedRef.current = false;

      if (!userId || !accessToken) return;

      connectBattleSocket(accessToken);

      const offSync = onBattleEvent("battle:sync", (payload) => {
        if (hasRedirectedRef.current) return;
        if (!("inBattle" in payload) || !payload.inBattle) return;

        hasRedirectedRef.current = true;
        setActiveBattle({
          battleId: payload.battleId,
          players: payload.players,
          questions: payload.questions,
        });
        router.push(`/battle/${payload.battleId}` as never);
      });

      return () => {
        offSync();
      };
    }, [userId, accessToken, router, setActiveBattle]),
  );

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") return;

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          setExitModalVisible(true);
          return true;
        },
      );

      return () => subscription.remove();
    }, [t]),
  );

  const handleRefresh = useCallback(async () => {
    if (!userId || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profile", userId] }),
        queryClient.invalidateQueries({ queryKey: ["statistics", userId] }),
        queryClient.invalidateQueries({ queryKey: ["practices", userId] }),
        queryClient.invalidateQueries({ queryKey: ["battles", userId] }),
        queryClient.invalidateQueries({ queryKey: ["chatrooms", userId] }),
        queryClient.invalidateQueries({ queryKey: ["dailyStreak", userId] }),
        queryClient.invalidateQueries({ queryKey: ["buffs", userId] }),
        queryClient.invalidateQueries({
          queryKey: ["dailyExercise", "latest", userId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["progression", userId],
        }),
        queryClient.invalidateQueries({ queryKey: ["account", userId] }),
        queryClient.invalidateQueries({
          queryKey: ["transactions", userId],
        }),
        queryClient.invalidateQueries({ queryKey: ["shopItems"] }),
        queryClient.invalidateQueries({ queryKey: ["ranking"] }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, queryClient, userId]);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top"]}
    >
      <View className="flex-1">
        <HomeHeader />
        <ScrollView
          className="flex-1 px-5 py-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
        >
          <HomeDailyChallenge />
          <HomeStatsGrid />
          <HomeFeatureButtons
            onPressShop={() => {
              if (shouldNavigate()) router.push("/other/shop" as never);
            }}
            onPressBattle={() => {
              if (shouldNavigate()) router.push("/battle" as never);
            }}
            onPressRank={() => {
              if (shouldNavigate()) router.push("/other/rank" as never);
            }}
          />
          <HomeRecentActivity
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </ScrollView>

        <Modal
          visible={exitModalVisible}
          transparent
          statusBarTranslucent
          animationType="fade"
          onRequestClose={() => setExitModalVisible(false)}
        >
          <Pressable
            className="flex-1 items-center justify-center bg-black/50 px-5"
            onPress={() => setExitModalVisible(false)}
          >
            <Pressable
              className="w-full rounded-2xl bg-surface p-6"
              onPress={(e) => e.stopPropagation()}
            >
              <Text className="mb-2 text-center font-fredokaSemiBold text-lg text-primaryText">
                {t("app.exitTitle")}
              </Text>
              <Text className="mb-5 text-left font-fredoka text-sm text-secondaryText">
                {t("app.exitMessage")}
              </Text>
              <View className="flex-row justify-end gap-3">
                <Pressable
                  className="rounded-xl px-5 py-2.5 active:opacity-70"
                  onPress={() => setExitModalVisible(false)}
                >
                  <Text className="font-fredokaMedium text-base text-secondaryText">
                    {t("app.exitCancel")}
                  </Text>
                </Pressable>
                <Pressable
                  className="rounded-xl px-5 py-2.5 active:opacity-70"
                  style={{ backgroundColor: colors.primary }}
                  onPress={() => {
                    setExitModalVisible(false);
                    BackHandler.exitApp();
                  }}
                >
                  <Text className="font-fredokaSemiBold text-base text-whiteText">
                    {t("app.exitConfirm")}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
