import api from "@/src/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const battleRankingItemSchema = z.object({
  userId: z.string(),
  username: z.string(),
  winRate: z.number(),
  avgScore: z.number(),
});

const battleRankingResponseSchema = z.object({
  ranking: z.array(battleRankingItemSchema),
});

export type BattleRankingItem = z.infer<typeof battleRankingItemSchema>;

const getBattleRanking = async () => {
  const result = await api.get("/ranking/battle");
  return battleRankingResponseSchema.parse(result);
};

export const useGetBattleRanking = () => {
  return useQuery({
    queryKey: ["ranking", "battle"],
    queryFn: getBattleRanking,
  });
};
