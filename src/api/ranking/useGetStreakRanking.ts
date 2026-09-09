import api from "@/src/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const streakRankingItemSchema = z.object({
  userId: z.string(),
  username: z.string(),
  longestStreak: z.number().int(),
  startDate: z.string(),
});

const streakRankingResponseSchema = z.object({
  ranking: z.array(streakRankingItemSchema),
});

export type StreakRankingItem = z.infer<typeof streakRankingItemSchema>;

const getStreakRanking = async () => {
  const result = await api.get("/ranking/streak");
  return streakRankingResponseSchema.parse(result);
};

export const useGetStreakRanking = () => {
  return useQuery({
    queryKey: ["ranking", "streak"],
    queryFn: getStreakRanking,
  });
};
