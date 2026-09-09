import pawLoadingLottie from "@/assets/animations/common/paw_loading.json";
import { useGetProfile } from "@/src/api/user/useGetProfile";
import { ProfileImageAssets } from "@/src/constants/assets/profileAssets";
import useTheme from "@/src/hooks/useTheme";
import { EditProfileForm } from "@/src/screens/profileScreen/edit/EditProfileForm";
import useUserStore from "@/src/stores/useUserStore";
import {
  getHttpErrorImage,
  getHttpErrorMessage,
  getHttpStatus,
} from "@/src/utils/httpError";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import {
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { userId } = useUserStore();

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProfile(userId!);
  const errorStatus = getHttpStatus(error);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="relative items-center justify-center bg-surface px-5 py-4">
        <Pressable
          className="absolute left-5 active:opacity-70"
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primaryText} />
        </Pressable>
        <Text className="font-fredokaSemiBold text-lg text-primaryText">
          {t("profile.editProfile")}
        </Text>
      </View>

      {/* Content */}
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20 }}
        >
          {/* Sleeping Cat Image */}
          <View className="mb-6 items-center">
            <Image
              source={ProfileImageAssets.sleeping}
              className="h-36 w-72"
              resizeMode="contain"
            />
          </View>

          {isLoading ? (
            <View className="items-center justify-center py-20">
              <LottieView
                source={pawLoadingLottie}
                style={{ width: 80, height: 80 }}
                autoPlay
                loop
              />
            </View>
          ) : isError ? (
            <View className="items-center justify-center py-10">
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
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text className="font-fredokaSemiBold text-base text-primary">
                  {t("common.tryAgain")}
                </Text>
              </Pressable>
            </View>
          ) : (
            <EditProfileForm initialData={profile} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
