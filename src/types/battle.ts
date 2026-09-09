import { z } from "zod";

export const battleQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  topic: z.string().optional(),
  answer: z.string().optional(),
  solution: z.string().optional(),
});

export const battlePlayerSchema = z.object({
  userId: z.string(),
  username: z.string(),
});

export const battleStartPayloadSchema = z.object({
  battleId: z.string(),
  players: z.array(battlePlayerSchema),
  questions: z.array(battleQuestionSchema),
});

export const battleProgressPayloadSchema = z.object({
  battleId: z.string(),
  questionsCompleted: z.number().int().min(0),
  userId: z.string().optional(),
  username: z.string().optional(),
});

export const battleOpponentPresencePayloadSchema = z.object({
  battleId: z.string(),
  userId: z.string(),
  username: z.string(),
});

export const battleQuestionResultSchema = z.object({
  isCorrect: z.boolean(),
  correctAnswer: z.string(),
});

export const battleRewardsSchema = z.object({
  coinsGained: z.number().int().min(0).optional(),
  xpGained: z.number().int().min(0).optional(),
  itemsGranted: z
    .array(z.object({ itemId: z.string(), quantity: z.number().int().min(1) }))
    .optional(),
  updatedPawCoins: z.number().int().min(0).optional(),
  updatedLevel: z.number().int().min(1).optional(),
  updatedXp: z.number().int().min(0).optional(),
  totalXp: z.number().int().min(0).optional(),
});

export const battleResultItemSchema = z.object({
  userId: z.string(),
  username: z.string(),
  timeSpentMs: z.number().nullable().optional(),
  gainedMarks: z.number(),
  totalMarks: z.number(),
  isWinner: z.boolean(),
  questionResults: z.array(battleQuestionResultSchema).optional(),
  rewards: battleRewardsSchema.optional(),
});

export const battleEndedPayloadSchema = z.object({
  battleId: z.string(),
  results: z.array(battleResultItemSchema),
});

export const battleWaitingPayloadSchema = z.object({
  battleId: z.string(),
});

export type BattleQuestion = z.infer<typeof battleQuestionSchema>;
export type BattlePlayer = z.infer<typeof battlePlayerSchema>;
export type BattleStartPayload = z.infer<typeof battleStartPayloadSchema>;
export type BattleResultItem = z.infer<typeof battleResultItemSchema>;
export type BattleEndedPayload = z.infer<typeof battleEndedPayloadSchema>;
