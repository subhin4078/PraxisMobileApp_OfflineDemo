import api from "@/src/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const practiceRankingItemSchema = z.object({
  userId: z.string(),
  username: z.string(),
  avgAccuracy: z.number(),
  avgSpeed: z.number(),
  avgDifficultyScore: z.number(),
  topicsCoverage: z.number(),
});

const practiceRankingResponseSchema = z.object({
  ranking: z.array(practiceRankingItemSchema),
});

export type PracticeRankingItem = z.infer<typeof practiceRankingItemSchema>;

const getPracticeRanking = async () => {
  const result = await api.get("/ranking/practice");
  return practiceRankingResponseSchema.parse(result);
};

export const useGetPracticeRanking = () => {
  return useQuery({
    queryKey: ["ranking", "practice"],
    queryFn: getPracticeRanking,
  });
};
