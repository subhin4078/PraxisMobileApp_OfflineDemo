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

const markedQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).optional(),
  solution: z.string(),
  answer: z.string(),
  studentAnswer: z.string(),
  awardedSteps: z.array(z.string()),
  isStudentCorrect: z.boolean(),
});

const markFollowUpResponseSchema = z.object({
  status: z.enum(["generated", "marked"]),
  questionType: z.enum(["wq", "mc"]),
  questions: z.array(markedQuestionSchema).min(3).max(3),
});

export type MarkedQuestion = z.infer<typeof markedQuestionSchema>;
export type MarkFollowUpResponse = z.infer<typeof markFollowUpResponseSchema>;

interface MarkFollowUpData {
  answers: string[];
  messageId?: string;
}

const markFollowUp = async (
  userId: string,
  chatId: string,
  data: MarkFollowUpData,
): Promise<MarkFollowUpResponse> => {
  const body: Record<string, unknown> = { answers: data.answers };
  if (data.messageId) body.messageId = data.messageId;

  const result = await api.post(
    `/users/${userId}/chats/${chatId}/marking`,
    body,
  );
  return markFollowUpResponseSchema.parse(result);
};

export const useMarkFollowUp = (userId: string, chatId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: MarkFollowUpData) => markFollowUp(userId, chatId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", userId, chatId],
      });
    },
    onError: (error) => {
      if (isNetworkOfflineError(error)) {
        toast.show(t("common.networkErrors.offline"), "error");
        return;
      }
      const status = getHttpStatus(error);
      if (status === 409) {
        toast.show(t("chat.errors.alreadyMarked"), "error");
        return;
      }
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
