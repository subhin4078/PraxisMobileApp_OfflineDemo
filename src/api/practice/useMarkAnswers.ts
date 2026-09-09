import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import { getHttpErrorMessage, getHttpStatus } from "@/src/utils/httpError";
import logger from "@/src/utils/logger";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const markingResultItemSchema = z.object({
  answer: z.string(),
  solution: z.string(),
  studentAnswer: z.string(),
  awardedSteps: z.array(z.string()),
  totalMarks: z.number(),
  isStudentCorrect: z.boolean(),
});

const rewardsSchema = z.object({
  coinsGained: z.number().int().min(0),
  xpGained: z.number().int().min(0),
  itemsGranted: z.array(
    z.object({
      itemId: z.string(),
      quantity: z.number().int().min(1),
    }),
  ),
  updatedPawCoins: z.number().int().min(0),
  updatedLevel: z.number().int().min(1),
  updatedXp: z.number().int().min(0),
  totalXp: z.number().int().min(0),
});

const markAnswersResponseSchema = z.object({
  markingResult: z.array(markingResultItemSchema),
  rewards: rewardsSchema.optional(),
});

export type MarkingResultItem = z.infer<typeof markingResultItemSchema>;
export type PracticeRewards = z.infer<typeof rewardsSchema>;

export interface MarkAnswersData {
  answers: string[];
  secondsSpent: number;
}

const markAnswers = async (
  userId: string,
  practiceId: string,
  data: MarkAnswersData,
) => {
  const result = await api.patch(
    `/users/${userId}/practices/${practiceId}`,
    data,
  );
  const parsed = markAnswersResponseSchema.safeParse(result);
  if (!parsed.success) {
    logger.error(
      "[useMarkAnswers] Zod validation failed:",
      JSON.stringify(parsed.error.issues, null, 2),
      "\nRaw response:",
      JSON.stringify(result, null, 2),
    );
    throw parsed.error;
  }
  return parsed.data;
};

export const useMarkAnswers = (userId: string, practiceId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: MarkAnswersData) =>
      markAnswers(userId, practiceId, data),
    onSuccess: () => {
      // Re-fetch practice so the screen switches to review mode
      queryClient.invalidateQueries({
        queryKey: ["practice", userId, practiceId],
      });
      queryClient.invalidateQueries({ queryKey: ["practices", userId] });
      queryClient.invalidateQueries({ queryKey: ["statistics", userId] });
      queryClient.invalidateQueries({ queryKey: ["inventory", userId] });
      queryClient.invalidateQueries({ queryKey: ["progression", userId] });
    },
    onError: (error) => {
      toast.show(getHttpErrorMessage(getHttpStatus(error), t), "error");
    },
  });
};
