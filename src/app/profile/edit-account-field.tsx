import pawLoadingLottie from "@/assets/animations/common/paw_loading.json";
import { useGetAccount } from "@/src/api/user/useGetAccount";
import useTheme from "@/src/hooks/useTheme";
import { EditEmailForm } from "@/src/screens/profileScreen/account/EditEmailForm";
import { EditPasswordForm } from "@/src/screens/profileScreen/account/EditPasswordForm";
import { EditUsernameForm } from "@/src/screens/profileScreen/account/EditUsernameForm";
import useUserStore from "@/src/stores/useUserStore";
import {
  getHttpErrorImage,
  getHttpErrorMessage,
  getHttpStatus,
} from "@/src/utils/httpError";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditAccountFieldScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { userId } = useUserStore();
  const { type } = useLocalSearchParams<{
    type: "username" | "email" | "password";
  }>();

  const {
    data: account,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAccount(userId!);
  const errorStatus = getHttpStatus(error);

  const getTitleByType = () => {
    switch (type) {
      case "username":
        return t("account.editUsername");
      case "email":
        return t("account.editEmail");
      case "password":
        return t("account.editPassword");
      default:
        return t("account.editAccount");
    }
  };

  const renderForm = () => {
    if (!account) return null;

    switch (type) {
      case "username":
        return <EditUsernameForm currentUsername={account.username} />;
      case "email":
        return <EditEmailForm currentEmail={account.email} />;
      case "password":
        return <EditPasswordForm />;
      default:
        return null;
    }
  };

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
          {getTitleByType()}
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
          {isLoading ? (
            <View className="items-center justify-center py-20">
              <LottieView
                source={pawLoadingLottie}
                style={{ width: 80, height: 80 }}
                autoPlay
                loop
              />
            </View>
          ) : isError || !account ? (
            <View className="items-center justify-center py-20">
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
            renderForm()
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
