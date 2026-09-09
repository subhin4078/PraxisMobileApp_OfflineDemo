import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import type { MathTopic } from "@/src/types/api";
import { getHttpErrorMessage, getHttpStatus } from "@/src/utils/httpError";
import logger from "@/src/utils/logger";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";

export type Difficulty = "easy" | "hard" | "dse";
export type QuestionType = "wq" | "mc";

// Create response exercises only contain question/hints/options (no topic or totalMarks)
export const practiceQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).optional(),
  hints: z.array(z.string()).max(3).catch([]),
});

export type PracticeQuestion = z.infer<typeof practiceQuestionSchema>;

const createPracticeResponseSchema = z.object({
  practiceId: z.string(),
  exercises: z.array(practiceQuestionSchema),
});

export type CreatePracticeResponse = z.infer<
  typeof createPracticeResponseSchema
>;

export interface CreatePracticeData {
  topics: MathTopic[];
  difficulty: Difficulty;
  questionType: QuestionType;
  amount: number;
}

const createPractice = async (
  userId: string,
  data: CreatePracticeData,
): Promise<CreatePracticeResponse> => {
  const result = await api.post(`/users/${userId}/practices`, data);
  const parsed = createPracticeResponseSchema.safeParse(result);
  if (!parsed.success) {
    logger.error(
      "[useCreatePractice] Zod validation failed:",
      JSON.stringify(parsed.error.issues, null, 2),
    );
    throw parsed.error;
  }
  return parsed.data;
};

export const useCreatePractice = (userId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreatePracticeData) => createPractice(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practices", userId] });
    },
    onError: (error) => {
      toast.show(getHttpErrorMessage(getHttpStatus(error), t), "error");
    },
  });
};
