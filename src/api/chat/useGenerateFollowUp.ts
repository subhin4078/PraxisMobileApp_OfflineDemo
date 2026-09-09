import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import {
  getHttpErrorMessage,
  getHttpStatus,
  isNetworkOfflineError,
} from "@/src/utils/httpError";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const followUpQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).optional(),
});

const generateFollowUpResponseSchema = z.object({
  messageId: z.string(),
  questions: z.array(followUpQuestionSchema).min(3).max(3),
});

export type FollowUpQuestion = z.infer<typeof followUpQuestionSchema>;
export type GenerateFollowUpResponse = z.infer<
  typeof generateFollowUpResponseSchema
>;

const generateFollowUp = async (
  userId: string,
  chatId: string,
): Promise<GenerateFollowUpResponse> => {
  const result = await api.post(`/users/${userId}/chats/${chatId}/generate`);
  return generateFollowUpResponseSchema.parse(result);
};

export const useGenerateFollowUp = (userId: string, chatId: string) => {
  const toast = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: () => generateFollowUp(userId, chatId),
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
