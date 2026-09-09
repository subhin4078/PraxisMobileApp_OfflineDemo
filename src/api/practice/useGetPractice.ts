import logger from "@/src/utils/logger";
import api from "@/src/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

export const practiceQuestionItemSchema = z.object({
  topic: z.string().optional(),
  question: z.string(),
  options: z.array(z.string()).optional(),
  totalMarks: z.number().catch(0),
  hints: z.array(z.string()).max(3).catch([]),
  // Present only on completed practices
  answer: z.string().optional(),
  solution: z.string().optional(),
  studentAnswer: z.string().optional(),
  awardedSteps: z.array(z.string()).optional(),
  isStudentCorrect: z.boolean().optional(),
});

export const practiceContentSchema = z.object({
  questions: z.array(practiceQuestionItemSchema),
  difficulty: z.enum(["easy", "hard", "dse"]),
  questionType: z.enum(["wq", "mc", "dse"]),
  createdAt: z.string(),
  secondsSpent: z.number().optional(), // present only when completed
});

export type PracticeQuestionItem = z.infer<typeof practiceQuestionItemSchema>;
export type PracticeContent = z.infer<typeof practiceContentSchema>;

const getPractice = async (
  userId: string,
  practiceId: string,
): Promise<PracticeContent> => {
  const result = await api.get(`/users/${userId}/practices/${practiceId}`);
  const parsed = practiceContentSchema.safeParse(result);
  if (!parsed.success) {
    logger.error(
      "[useGetPractice] Zod validation failed:",
      JSON.stringify(parsed.error.issues, null, 2),
      "\nRaw response:",
      JSON.stringify(result, null, 2),
    );
    throw parsed.error;
  }
  return parsed.data;
};

export const useGetPractice = (userId: string, practiceId: string) => {
  return useQuery({
    queryKey: ["practice", userId, practiceId],
    queryFn: () => getPractice(userId, practiceId),
    enabled: !!userId && !!practiceId,
  });
};

