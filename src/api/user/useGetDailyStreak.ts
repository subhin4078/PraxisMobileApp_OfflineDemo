import logger from "@/src/utils/logger";
import api from "@/src/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const dailyStreakSchema = z.object({
  startDate: z.string().nullable(),
  currentStreak: z.number().int().min(0),
  longestStreak: z.number().int().min(0),
  weekStartDate: z.string(),
  weekCompletedExercises: z.number().int().min(0).max(7),
});

const dailyStreakResponseSchema = z.object({
  dailyStreak: dailyStreakSchema,
});

export type DailyStreak = z.infer<typeof dailyStreakSchema>;

const getDailyStreak = async (userId: string): Promise<DailyStreak> => {
  const result = await api.get(`/users/${userId}/daily-streak`);
  const parsed = dailyStreakResponseSchema.safeParse(result);
  if (!parsed.success) {
    logger.error(
      "[useGetDailyStreak] Zod validation failed:",
      JSON.stringify(parsed.error.issues, null, 2),
      "\nRaw response:",
      JSON.stringify(result, null, 2),
    );
    throw parsed.error;
  }
  return parsed.data.dailyStreak;
};

export const useGetDailyStreak = (userId: string) => {
  return useQuery({
    queryKey: ["dailyStreak", userId],
    queryFn: () => getDailyStreak(userId),
    enabled: !!userId,
  });
};

