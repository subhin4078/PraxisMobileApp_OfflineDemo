import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** 5 MB file size limit */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
];

export interface AttachedFile {
  uri: string;
  name: string;
  mimeType: string;
}

interface ChatInputProps {
  onSend: (message: string, file?: AttachedFile) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [attachMenuVisible, setAttachMenuVisible] = useState(false);

  const handleSend = () => {
    const hasContent = message.trim() || attachedFile;
    if (hasContent && !isLoading) {
      onSend(
        message.trim() || t("chat.defaultOCRPrompt"),
        attachedFile ?? undefined,
      );
      setMessage("");
      setAttachedFile(null);
    }
  };

  const validateFileSize = async (uri: string): Promise<boolean> => {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists && info.size && info.size > MAX_FILE_SIZE) {
        Alert.alert(t("chat.fileTooLargeTitle"), t("chat.fileTooLargeMessage"));
        return false;
      }
      return true;
    } catch {
      return true; // allow if we can't check
    }
  };

  const handlePickImage = async (fromCamera: boolean) => {
    if (fromCamera) {
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
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
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
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.8,
        });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (!(await validateFileSize(asset.uri))) return;
      const ext = asset.uri.split(".").pop()?.toLowerCase() || "jpg";
      setAttachedFile({
        uri: asset.uri,
        name: `photo.${ext}`,
        mimeType: asset.mimeType || `image/${ext === "jpg" ? "jpeg" : ext}`,
      });
    }
  };

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ALLOWED_MIME_TYPES,
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (!(await validateFileSize(asset.uri))) return;
      setAttachedFile({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType || "application/pdf",
      });
    }
  };

  const showAttachmentOptions = () => {
    setAttachMenuVisible(true);
  };

  const isImage = attachedFile?.mimeType?.startsWith("image/");
  const canSend = (message.trim() || attachedFile) && !isLoading;

  return (
    <View
      className="px-4 pt-2"
      style={{
        backgroundColor: colors.background,
        // Keep Android bottom spacing stable after keyboard show/hide.
        paddingBottom: Platform.OS === "ios" ? insets.bottom + 16 : 16,
      }}
    >
      {/* File Preview */}
      {attachedFile && (
        <View
          className="mb-2 flex-row items-center rounded-xl px-3 py-2"
          style={{ backgroundColor: colors.surface }}
        >
          {isImage ? (
            <Image
              source={{ uri: attachedFile.uri }}
              style={{ width: 40, height: 40, borderRadius: 8 }}
              resizeMode="cover"
            />
          ) : (
            <View
              className="h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: colors.primary + "20" }}
            >
              <Ionicons
                name="document-outline"
                size={20}
                color={colors.primary}
              />
            </View>
          )}
          <Text
            className="ml-2 flex-1 font-fredokaMedium text-sm text-primaryText"
            numberOfLines={1}
          >
            {attachedFile.name}
          </Text>
          <Pressable
            onPress={() => setAttachedFile(null)}
            className="ml-2 active:opacity-70"
          >
            <Ionicons name="close-circle" size={22} color={colors.mutedText} />
          </Pressable>
        </View>
      )}

      {/* Input Row */}
      <View className="flex-row items-end gap-2">
        {/* Text input with attach button inside */}
        <View
          className="min-h-[48px] flex-1 flex-row items-center rounded-full px-2"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.borderColor,
          }}
        >
          {/* Attachment Button */}
          <Pressable
            className="h-9 w-9 items-center justify-center rounded-full active:opacity-70"
            style={{ backgroundColor: colors.mutedText + "15" }}
            onPress={showAttachmentOptions}
            disabled={isLoading}
          >
            <Ionicons name="attach" size={20} color={colors.mutedText} />
          </Pressable>

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={
              attachedFile
                ? t("chat.typeMessageOptional")
                : t("chat.askMathQuestion")
            }
            placeholderTextColor={colors.mutedText}
            multiline
            maxLength={500}
            style={{
              flex: 1,
              color: colors.primaryText,
              fontFamily: "Fredoka_400Regular",
              fontSize: 15,
              maxHeight: 80,
              paddingHorizontal: 8,
              paddingVertical: 10,
            }}
            editable={!isLoading}
          />
        </View>

        {/* Send Button */}
        <Pressable
          className="h-12 w-12 items-center justify-center rounded-xl active:opacity-70"
          style={{
            backgroundColor: canSend ? colors.primary : colors.primary + "60",
          }}
          onPress={handleSend}
          disabled={!canSend}
        >
          {isLoading ? (
            <Ionicons
              name="hourglass-outline"
              size={22}
              color={colors.whiteText}
            />
          ) : (
            <Ionicons name="send" size={18} color={colors.whiteText} />
          )}
        </Pressable>
      </View>

      {/* Attachment Options Modal */}
      <Modal
        visible={attachMenuVisible}
        transparent
        statusBarTranslucent
        animationType="slide"
        onRequestClose={() => setAttachMenuVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setAttachMenuVisible(false)}
        >
          <View className="rounded-t-3xl bg-surface pb-8 pt-2">
            {/* Handle bar */}
            <View className="mb-2 items-center py-2">
              <View className="h-1 w-10 rounded-full bg-borderColor" />
            </View>

            {/* Title */}
            <Text className="mb-1 px-6 font-fredokaSemiBold text-base text-primaryText">
              {t("chat.attachFile")}
            </Text>
            <Text className="mb-3 px-6 font-fredoka text-sm text-secondaryText">
              {t("chat.attachFileDescription")}
            </Text>

            {/* Take Photo */}
            <Pressable
              className="flex-row items-center gap-4 px-6 py-3.5 active:opacity-70"
              onPress={() => {
                setAttachMenuVisible(false);
                handlePickImage(true);
              }}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.primary + "15" }}
              >
                <Ionicons
                  name="camera-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <Text className="font-fredokaMedium text-base text-primaryText">
                {t("scan.takePhoto")}
              </Text>
            </Pressable>

            {/* Upload from Gallery */}
            <Pressable
              className="flex-row items-center gap-4 px-6 py-3.5 active:opacity-70"
              onPress={() => {
                setAttachMenuVisible(false);
                handlePickImage(false);
              }}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.primary + "15" }}
              >
                <Ionicons
                  name="images-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <Text className="font-fredokaMedium text-base text-primaryText">
                {t("scan.uploadPhoto")}
              </Text>
            </Pressable>

            {/* Upload Document */}
            <Pressable
              className="flex-row items-center gap-4 px-6 py-3.5 active:opacity-70"
              onPress={() => {
                setAttachMenuVisible(false);
                handlePickDocument();
              }}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.primary + "15" }}
              >
                <Ionicons
                  name="document-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <Text className="font-fredokaMedium text-base text-primaryText">
                {t("chat.uploadDocument")}
              </Text>
            </Pressable>

            {/* Cancel */}
            <Pressable
              className="mt-1 flex-row items-center gap-4 px-6 py-3.5 active:opacity-70"
              onPress={() => setAttachMenuVisible(false)}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.mutedText + "15" }}
              >
                <Ionicons
                  name="close-outline"
                  size={22}
                  color={colors.secondaryText}
                />
              </View>
              <Text className="font-fredokaMedium text-base text-secondaryText">
                {t("common.cancel")}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
