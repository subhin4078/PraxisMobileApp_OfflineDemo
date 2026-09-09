import { useCreateChatroom } from "@/src/api/chat/useCreateChatroom";
import { SendMessageResponse } from "@/src/api/chat/useSendMessage";
import { getFileMimeType, uriToBase64 } from "@/src/api/utility/useScanOCR";
import { ScanImageAssets } from "@/src/constants/assets/scanAssets";
import useTheme from "@/src/hooks/useTheme";
import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import useUserStore from "@/src/stores/useUserStore";
import logger from "@/src/utils/logger";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** 5 MB file size limit */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg"];

const getFileExtension = (uri: string): string => {
  return uri.split(".").pop()?.toLowerCase() || "";
};

const isValidFormat = (uri: string): boolean => {
  const ext = getFileExtension(uri);
  return ALLOWED_EXTENSIONS.includes(ext);
};

export function ScanScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const { userId } = useUserStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const { mutateAsync: createChatroom } = useCreateChatroom(userId!);

  const processImage = async (uri: string) => {
    if (!isValidFormat(uri)) {
      toast.show(t("scan.errors.unsupportedFormat"), "error");
      return;
    }

    // Validate file size (5 MB)
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists && info.size && info.size > MAX_FILE_SIZE) {
        toast.show(t("scan.errors.fileTooLarge"), "error");
        return;
      }
    } catch {
      // proceed if check fails
    }

    setIsProcessing(true);

    try {
      // Step 1: Extract base64 and mime type from the image URI
      const base64Data = await uriToBase64(uri);
      const fileType = getFileMimeType(uri);

      // Step 2: Create a new chatroom
      const chatId = await createChatroom({ title: t("chat.newChat") });

      // Step 3: Send file to combined OCR+LLM endpoint
      const response: SendMessageResponse = await api.post(
        `/users/${userId}/chats/${chatId}/messages/with-ocr`,
        {
          content: t("scan.initialMessage"),
          file: { data: base64Data, fileType },
          isStructured: true,
          responseStyle: "brief",
        },
      );

      // Step 4: Navigate to the chatroom with the AI response
      router.push({
        pathname: "/chat/[id]",
        params: {
          id: chatId,
          aiResponse: JSON.stringify(response),
        },
      });
    } catch (error) {
      logger.error("Scan process failed:", String(error));
      toast.show(t("scan.errors.createChatFailed"), "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        t("scan.permissionRequired"),
        t("scan.cameraPermissionMessage"),
        [
          { text: t("account.cancel"), style: "cancel" },
          {
            text: t("scan.openSettings"),
            onPress: () => Linking.openSettings(),
          },
        ],
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  };

  const handleUploadPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        t("scan.permissionRequired"),
        t("scan.galleryPermissionMessage"),
        [
          { text: t("account.cancel"), style: "cancel" },
          {
            text: t("scan.openSettings"),
            onPress: () => Linking.openSettings(),
          },
        ],
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 items-center justify-center px-6">
        {/* Cat Image */}
        <Image
          source={ScanImageAssets.scan}
          className="h-64 w-64"
          resizeMode="contain"
        />

        {/* Title & Subtitle */}
        <Text className="mt-4 text-center font-fredokaSemiBold text-2xl text-primaryText">
          {t("scan.title")}
        </Text>
        <Text className="mt-2 px-4 text-center font-fredokaRegular text-sm text-mutedText">
          {t("scan.subtitle")}
        </Text>

        {/* Buttons */}
        <View className="mt-8 w-full gap-4">
          {/* Take Photo Button */}
          <Pressable
            onPress={handleTakePhoto}
            disabled={isProcessing}
            className="flex-row items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4 active:opacity-80 disabled:opacity-60"
          >
            <Ionicons
              name="camera-outline"
              size={24}
              color={colors.whiteText}
            />
            <Text className="font-fredokaSemiBold text-base text-whiteText">
              {t("scan.takePhoto")}
            </Text>
          </Pressable>

          {/* Upload from Gallery Button */}
          <Pressable
            onPress={handleUploadPhoto}
            disabled={isProcessing}
            className="flex-row items-center justify-center gap-3 rounded-2xl border-2 border-primary bg-surface px-6 py-4 active:opacity-80 disabled:opacity-60"
          >
            <Ionicons name="images-outline" size={24} color={colors.primary} />
            <Text
              className="font-fredokaSemiBold text-base"
              style={{ color: colors.primary }}
            >
              {t("scan.uploadPhoto")}
            </Text>
          </Pressable>
        </View>

        {/* Processing Overlay */}
        {isProcessing && (
          <View className="mt-8 items-center gap-3">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="font-fredokaMedium text-sm text-secondaryText">
              {t("scan.processing")}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
