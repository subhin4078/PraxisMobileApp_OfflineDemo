import logger from "@/src/utils/logger";
import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import { getHttpErrorMessage, getHttpStatus } from "@/src/utils/httpError";
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

const markDailyExerciseResponseSchema = z.object({
  markingResult: z.array(markingResultItemSchema),
  rewards: rewardsSchema,
});

export type DailyExerciseMarkingResult = z.infer<
  typeof markingResultItemSchema
>;
export type DailyExerciseRewards = z.infer<typeof rewardsSchema>;

export interface MarkDailyExerciseData {
  answers: string[];
  secondsSpent: number;
}

const markDailyExercise = async (
  userId: string,
  dailyExerciseId: string,
  data: MarkDailyExerciseData,
) => {
  const result = await api.patch(
    `/users/${userId}/daily-exercises/${dailyExerciseId}`,
    data,
  );
  const parsed = markDailyExerciseResponseSchema.safeParse(result);
  if (!parsed.success) {
    logger.error(
      "[useMarkDailyExercise] Zod validation failed:",
      JSON.stringify(parsed.error.issues, null, 2),
      "\nRaw response:",
      JSON.stringify(result, null, 2),
    );
    throw parsed.error;
  }
  return parsed.data;
};

export const useMarkDailyExercise = (
  userId: string,
  dailyExerciseId: string,
) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: MarkDailyExerciseData) =>
      markDailyExercise(userId, dailyExerciseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dailyExercise", "latest", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dailyStreak", userId],
      });
      queryClient.invalidateQueries({ queryKey: ["statistics", userId] });
      queryClient.invalidateQueries({ queryKey: ["inventory", userId] });
      queryClient.invalidateQueries({ queryKey: ["progression", userId] });
    },
    onError: (error) => {
      toast.show(getHttpErrorMessage(getHttpStatus(error), t), "error");
    },
  });
};

