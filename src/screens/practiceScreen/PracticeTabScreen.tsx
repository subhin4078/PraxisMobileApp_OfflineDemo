import { useGetPractices } from "@/src/api/practice/useGetPractices";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import useTheme from "@/src/hooks/useTheme";
import { PracticeHeader } from "@/src/screens/practiceScreen/PracticeHeader";
import { PracticeSessionList } from "@/src/screens/practiceScreen/PracticeSessionList";
import useUserStore from "@/src/stores/useUserStore";
import { shouldNavigate } from "@/src/utils";
import {
  getHttpErrorImage,
  getHttpErrorMessage,
  getHttpStatus,
} from "@/src/utils/httpError";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

export function PracticeTabScreen() {
  const { colors } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const router = useRouter();
  const { t } = useTranslation();
  const { userId } = useUserStore();
  const {
    data: practices = [],
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useGetPractices(userId!);

  const errorStatus = getHttpStatus(error);

  const isEmpty = !isLoading && !isError && practices.length === 0;

  return (
    <>
      <PracticeHeader />

      {isLoading ? (
        <View className="flex-1 items-center justify-center py-6">
          <LoadingSpinner size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Image
            source={getHttpErrorImage(errorStatus)}
            style={{ width: 160, height: 160 }}
            resizeMode="contain"
          />
          <Text className="mt-4 text-center font-fredokaSemiBold text-lg text-primaryText">
            {getHttpErrorMessage(errorStatus, t)}
          </Text>
          <Pressable
            className="mt-6 flex-row items-center gap-2 rounded-full border-2 border-primary px-6 py-3 active:opacity-70"
            onPress={() => refetch()}
          >
            <Ionicons name="refresh-outline" size={18} color={colors.primary} />
            <Text className="font-fredokaSemiBold text-base text-primary">
              {t("common.tryAgain")}
            </Text>
          </Pressable>
        </View>
      ) : isEmpty ? (
        // Center empty-state within the area below the header (not full-page)
        <View className="flex-1 items-center justify-center px-8 py-6">
          <PracticeSessionList practices={practices} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 py-6"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: tabBarHeight + 96,
          }}
        >
          <PracticeSessionList practices={practices} />
        </ScrollView>
      )}

      {/* Floating Add Button */}
      <Pressable
        className="absolute bottom-6 right-6 z-50 h-16 w-16 items-center justify-center rounded-full shadow-lg active:opacity-90"
        style={{
          backgroundColor: colors.chatAddButton,
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => {
          if (shouldNavigate()) router.push("/practice/create");
        }}
      >
        <Ionicons name="add" size={32} color={colors.whiteText} />
      </Pressable>
    </>
  );
}
