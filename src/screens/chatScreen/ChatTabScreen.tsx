import { useGetChatrooms } from "@/src/api/chat/useGetChatrooms";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import useTheme from "@/src/hooks/useTheme";
import { ChatroomHeader } from "@/src/screens/chatScreen/ChatroomHeader";
import { ChatroomList } from "@/src/screens/chatScreen/ChatroomList";
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
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export function ChatTabScreen() {
  const { colors } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const { userId } = useUserStore();
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: chatrooms,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useGetChatrooms(userId!);

  const errorStatus = getHttpStatus(error);

  const filteredChatrooms = useMemo(() => {
    if (!chatrooms) return [];
    if (!searchQuery.trim()) return chatrooms;
    const query = searchQuery.trim().toLowerCase();
    return chatrooms.filter((c) => c.title?.toLowerCase().includes(query));
  }, [chatrooms, searchQuery]);

  const isEmpty =
    !isLoading && !isError && (!chatrooms || chatrooms.length === 0);

  const isSearchEmpty =
    !isLoading &&
    !isError &&
    chatrooms &&
    chatrooms.length > 0 &&
    filteredChatrooms.length === 0;

  return (
    <>
      <ChatroomHeader />
      {/* Search Bar */}
      {!isLoading && !isError && chatrooms && chatrooms.length > 0 && (
        <View
          className="px-4 pb-3 pt-2"
          style={{ backgroundColor: colors.surface }}
        >
          <View
            className="flex-row items-center gap-2 rounded-full px-4 py-2.5"
            style={{ backgroundColor: colors.background }}
          >
            <Ionicons name="search" size={16} color={colors.mutedText} />
            <TextInput
              className="flex-1 font-fredoka text-sm text-primaryText"
              placeholder={t("chat.searchPlaceholder")}
              placeholderTextColor={colors.mutedText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery("")}
                className="active:opacity-70"
              >
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={colors.mutedText}
                />
              </Pressable>
            )}
          </View>
        </View>
      )}
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
          <ChatroomList chatrooms={[]} />
        </View>
      ) : isSearchEmpty ? (
        <View className="flex-1 items-center justify-center px-8 py-6">
          <Ionicons name="search-outline" size={48} color={colors.mutedText} />
          <Text className="mt-4 text-center font-fredokaSemiBold text-base text-secondaryText">
            {t("chat.noSearchResults")}
          </Text>
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
          <ChatroomList chatrooms={filteredChatrooms} />
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
          if (shouldNavigate()) router.push("/chat/new");
        }}
      >
        <Ionicons name="add" size={32} color={colors.whiteText} />
      </Pressable>
    </>
  );
}
