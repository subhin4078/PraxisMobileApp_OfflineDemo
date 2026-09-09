import { SendMessageResponse } from "@/src/api/chat/useSendMessage";
import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import { getHttpErrorMessage, getHttpStatus } from "@/src/utils/httpError";
import logger from "@/src/utils/logger";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as FileSystem from "expo-file-system/legacy";
import { useTranslation } from "react-i18next";

// Convert a file URI to base64 using expo-file-system
export const uriToBase64 = async (uri: string): Promise<string> => {
  return FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
};

export const getFileMimeType = (uri: string): string => {
  const extension = uri.split(".").pop()?.toLowerCase() || "jpg";
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    pdf: "application/pdf",
    webp: "image/webp",
  };
  return mimeMap[extension] || "image/jpeg";
};

interface SendMessageWithOCRData {
  imageUri: string;
  content?: string;
}

/**
 * Send a message with an attached image/PDF. The backend performs OCR on the
 * file, appends the extracted text to the prompt, and returns an LLM response.
 * Wraps POST /users/{userId}/chats/{chatId}/messages/with-ocr
 */
export const useSendMessageWithOCR = (userId: string, chatId: string) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      imageUri,
      content = "Please help me with the math content in this image.",
    }: SendMessageWithOCRData): Promise<SendMessageResponse> => {
      const data = await uriToBase64(imageUri);
      const fileType = getFileMimeType(imageUri);

      const result = await api.post(
        `/users/${userId}/chats/${chatId}/messages/with-ocr`,
        {
          content,
          file: { data, fileType },
          isStructured: true,
          responseStyle: "brief",
        },
        { timeout: 90000 },
      );

      logger.info("SendMessageWithOCR response:", JSON.stringify(result));
      return result as unknown as SendMessageResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", userId, chatId],
      });
      queryClient.invalidateQueries({ queryKey: ["chatrooms", userId] });
    },
    onError: (error) => {
      logger.error("OCR scan failed:", String(error));
      toast.show(getHttpErrorMessage(getHttpStatus(error), t), "error");
    },
  });
};
