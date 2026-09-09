import logger from "@/src/utils/logger";
import api from "@/src/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

/** Unmarked question (no answer/solution/studentAnswer) */
const dailyExerciseQuestionSchema = z.object({
  topic: z.string(),
  question: z.string(),
  options: z.array(z.string()).optional(),
  totalMarks: z.number().int().min(1),
  hints: z.array(z.string()).max(3).catch([]),
});

/** Marked question (has answer, solution, studentAnswer, etc.) */
const dailyExerciseMarkedQuestionSchema = z.object({
  topic: z.string(),
  question: z.string(),
  options: z.array(z.string()).optional(),
  answer: z.string(),
  solution: z.string(),
  totalMarks: z.number().catch(0),
  studentAnswer: z.string(),
  awardedSteps: z.array(z.string()),
  isStudentCorrect: z.boolean(),
  hints: z.array(z.string()).max(3).catch([]),
});

/** Unmarked daily exercise */
const unmarkedDailyExerciseSchema = z.object({
  questions: z.array(dailyExerciseQuestionSchema),
  difficulty: z.string(),
  questionType: z.string(),
  createdAt: z.string(),
});

/** Marked (completed) daily exercise */
const markedDailyExerciseSchema = z.object({
  questions: z.array(dailyExerciseMarkedQuestionSchema),
  difficulty: z.string(),
  questionType: z.string(),
  createdAt: z.string(),
  secondsSpent: z.number().min(0),
});

const latestDailyExerciseResponseSchema = z.object({
  dailyExerciseId: z.string(),
  dailyExercise: z.union([
    markedDailyExerciseSchema,
    unmarkedDailyExerciseSchema,
  ]),
});

export type DailyExerciseQuestion = z.infer<typeof dailyExerciseQuestionSchema>;
export type DailyExerciseMarkedQuestion = z.infer<
  typeof dailyExerciseMarkedQuestionSchema
>;
export type LatestDailyExercise = z.infer<
  typeof latestDailyExerciseResponseSchema
>;

const getLatestDailyExercise = async (
  userId: string,
): Promise<LatestDailyExercise> => {
  const result = await api.get(`/users/${userId}/daily-exercises/latest`);
  const parsed = latestDailyExerciseResponseSchema.safeParse(result);
  if (!parsed.success) {
    logger.error(
      "[useGetLatestDailyExercise] Zod validation failed:",
      JSON.stringify(parsed.error.issues, null, 2),
      "\nRaw response:",
      JSON.stringify(result, null, 2),
    );
    throw parsed.error;
  }
  return parsed.data;
};

export const useGetLatestDailyExercise = (userId: string) => {
  return useQuery({
    queryKey: ["dailyExercise", "latest", userId],
    queryFn: () => getLatestDailyExercise(userId),
    enabled: !!userId,
  });
};

