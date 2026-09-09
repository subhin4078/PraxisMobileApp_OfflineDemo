import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import {
  getHttpErrorMessage,
  getHttpStatus,
  isNetworkOfflineError,
} from "@/src/utils/httpError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";

// The API returns the AI response directly
const sendMessageResponseSchema = z.union([
  z
    .object({
      inputType: z.enum([
        "problemSolving",
        "conceptExplanation",
        "mathRelated",
        "mathUnrelated",
        "rejected",
      ]),
      title: z.string().optional(),
      problemSolving: z
        .object({
          restatedProblem: z.string(),
          termExplanation: z.string(),
          solutionSteps: z.array(z.string()),
          finalAnswer: z.string(),
          commonMistakes: z.array(z.string()),
          verification: z.string(),
        })
        .passthrough()
        .optional(),
      conceptExplanation: z
        .object({
          conceptOverview: z.string(),
          keyTerms: z.string(),
          equations: z.string().optional(),
          exampleProblem: z.string(),
          commonMistakes: z.array(z.string()),
        })
        .passthrough()
        .optional(),
    })
    .passthrough(),
  z
    .object({
      response: z.string(),
      inputType: z.enum([
        "problemSolving",
        "conceptExplanation",
        "mathRelated",
        "mathUnrelated",
        "rejected",
      ]),
      title: z.string().optional(),
    })
    .passthrough(),
]);

export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>;

interface SendMessageData {
  content: string;
}

const sendMessage = async (
  userId: string,
  chatroomId: string,
  data: SendMessageData,
): Promise<SendMessageResponse> => {
  const result = await api.post(
    `/users/${userId}/chats/${chatroomId}/messages`,
    {
      content: data.content,
      isStructured: true,
      responseStyle: "brief",
    },
    { timeout: 90000 },
  );
  return sendMessageResponseSchema.parse(result);
};

export const useSendMessage = (userId: string, chatroomId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: SendMessageData) =>
      sendMessage(userId, chatroomId, data),
    onSuccess: () => {
      // Invalidate messages to sync with server state
      queryClient.invalidateQueries({
        queryKey: ["messages", userId, chatroomId],
      });
      // Also update the chatroom list
      queryClient.invalidateQueries({ queryKey: ["chatrooms", userId] });
    },
    onError: (error) => {
      if (isNetworkOfflineError(error)) {
        toast.show(t("common.networkErrors.offline"), "error");
        return;
      }
      const status = getHttpStatus(error);
      if (status === 429) {
        toast.show(t("common.networkErrors.tooManyRequests"), "error");
        return;
      }
      if (status === 504) {
        toast.show(t("common.networkErrors.timeout"), "error");
        return;
      }
      toast.show(getHttpErrorMessage(status, t), "error");
    },
  });
};
