import logger from "@/src/utils/logger";
import api from "@/src/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const battleItemSchema = z.object({
  battleId: z.string().optional(),
  id: z.string().optional(),
  createdAt: z.string().nullable().optional(),
  startedAt: z.string().nullable().optional(),
  endedAt: z.string().nullable().optional(),
  status: z.string().optional(),
  winner: z.string().nullable().optional(),
  isWinner: z.boolean().optional(),
  difficulty: z.string().optional(),
  topics: z.array(z.string()).optional(),
  participants: z.array(z.any()).optional(),
  metadata: z
    .object({
      createdAt: z.string().nullable().optional(),
      startedAt: z.string().nullable().optional(),
      endedAt: z.string().nullable().optional(),
      status: z.string().optional(),
      winner: z.string().nullable().optional(),
      isWinner: z.boolean().optional(),
      difficulty: z.string().optional(),
    })
    .optional(),
});

const battlesResponseSchema = z.union([
  z.object({ battles: z.array(battleItemSchema) }),
  z.array(battleItemSchema),
]);

export type BattleListItem = z.infer<typeof battleItemSchema>;

const normalizeBattleItem = (item: BattleListItem): BattleListItem => ({
  ...item,
  createdAt: item.createdAt ?? item.metadata?.createdAt,
  startedAt: item.startedAt ?? item.metadata?.startedAt,
  endedAt: item.endedAt ?? item.metadata?.endedAt,
  status: item.status ?? item.metadata?.status,
  winner: item.winner ?? item.metadata?.winner,
  isWinner: item.isWinner ?? item.metadata?.isWinner,
  difficulty: item.difficulty ?? item.metadata?.difficulty,
});

const getBattles = async (userId: string): Promise<BattleListItem[]> => {
  const result = await api.get(`/users/${userId}/battles`);
  const parsed = battlesResponseSchema.safeParse(result);

  if (!parsed.success) {
    logger.error(
      "[useGetBattles] Zod validation failed:",
      JSON.stringify(parsed.error.issues, null, 2),
      "\nRaw response:",
      JSON.stringify(result, null, 2),
    );
    throw parsed.error;
  }

  const battles = Array.isArray(parsed.data)
    ? parsed.data
    : parsed.data.battles;
  return battles.map(normalizeBattleItem);
};

export const useGetBattles = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ["battles", userId],
    queryFn: () => getBattles(userId),
    enabled: !!userId && enabled,
  });
};

