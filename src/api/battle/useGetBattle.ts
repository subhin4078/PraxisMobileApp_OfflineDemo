import api from "@/src/lib/axios";
import logger from "@/src/utils/logger";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const battleParticipantSchema = z.object({
  userId: z.string().optional(),
  username: z.string().optional(),
  timeSpentMs: z.number().nullable().optional(),
  gainedMarks: z.number().nullable().optional(),
  totalMarks: z.number().optional(),
  isWinner: z.boolean().optional(),
  studentAnswers: z.array(z.string()).nullable().optional(),
  joinedAt: z.string().nullable().optional(),
  finishedAt: z.string().nullable().optional(),
  status: z.string().optional(),
});

const battleQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  topic: z.string().optional(),
  answer: z.string().optional(),
  solution: z.string().optional(),
});

const battleContentSchema = z.object({
  battleId: z.string().optional(),
  topics: z.array(z.string()).optional(),
  difficulty: z.string().optional(),
  endedAt: z.string().nullable().optional(),
  metadata: z
    .object({
      status: z.string().optional(),
      winner: z.string().nullable().optional(),
      createdAt: z.string().nullable().optional(),
      startedAt: z.string().nullable().optional(),
      endedAt: z.string().nullable().optional(),
      difficulty: z.string().optional(),
    })
    .optional(),
  questions: z.array(battleQuestionSchema).optional(),
  participants: z.array(battleParticipantSchema).optional(),
  participant: battleParticipantSchema.optional(),
  player: battleParticipantSchema.optional(),
  opponent: battleParticipantSchema.optional(),
});

export type BattleContent = z.infer<typeof battleContentSchema>;

const getBattle = async (
  userId: string,
  battleId: string,
): Promise<BattleContent> => {
  const result = await api.get(`/users/${userId}/battles/${battleId}`);
  const parsed = battleContentSchema.safeParse(result);

  if (!parsed.success) {
    logger.error(
      "[useGetBattle] Zod validation failed:",
      JSON.stringify(parsed.error.issues, null, 2),
      "\nRaw response:",
      JSON.stringify(result, null, 2),
    );
    throw parsed.error;
  }

  // Normalize participants: support both old format (participants array) and new format (player/opponent)
  let normalizedParticipants = parsed.data.participants;

  if (!normalizedParticipants) {
    if (parsed.data.player && parsed.data.opponent) {
      // New format: separated player and opponent fields
      normalizedParticipants = [parsed.data.player, parsed.data.opponent];
    } else if (parsed.data.participant) {
      // Old format: single participant field
      normalizedParticipants = [parsed.data.participant];
    }
  }

  return {
    ...parsed.data,
    participants: normalizedParticipants,
  };
};

export const useGetBattle = (userId: string, battleId: string) => {
  return useQuery({
    queryKey: ["battle", userId, battleId],
    queryFn: () => getBattle(userId, battleId),
    enabled: !!userId && !!battleId,
  });
};
