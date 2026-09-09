import logger from "@/src/utils/logger";
import api from "@/src/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// Content can be a string or a structured object
const structuredContentSchema = z
  .object({
    inputType: z.string(),
    response: z.string().optional(),
    title: z.string().optional(),
    problemSolving: z
      .object({
        restatedProblem: z.string(),
        termExplanation: z.string(),
        solutionSteps: z.array(z.string()),
        finalAnswer: z.string(),
        commonMistakes: z.array(z.string()),
        verification: z.string(),
      })
      .optional(),
    conceptExplanation: z
      .object({
        conceptOverview: z.string(),
        keyTerms: z.string(),
        equations: z.string().optional(),
        exampleProblem: z.string(),
        commonMistakes: z.array(z.string()),
      })
      .optional(),
  })
  .passthrough();

const messageSchema = z.object({
  role: z.enum(["user", "model", "system"]),
  content: z
    .string()
    .or(structuredContentSchema)
    .or(z.record(z.string(), z.unknown())),
  timestamp: z.string(),
});

const messagesResponseSchema = z.object({
  messages: z.array(messageSchema),
});

export type Message = z.infer<typeof messageSchema>;
export type StructuredContent = z.infer<typeof structuredContentSchema>;

const getMessages = async (
  userId: string,
  chatroomId: string,
): Promise<Message[]> => {
  const result = await api.get(`/users/${userId}/chats/${chatroomId}/messages`);

  const parsed = messagesResponseSchema.safeParse(result);
  if (!parsed.success) {
    logger.error(
      "[useGetMessages] Zod validation failed:",
      JSON.stringify(parsed.error.format(), null, 2),
    );
    throw new Error("Invalid messages response format");
  }
  return parsed.data.messages;
};

export const useGetMessages = (userId: string, chatroomId: string) => {
  return useQuery({
    queryKey: ["messages", userId, chatroomId],
    queryFn: () => getMessages(userId, chatroomId),
    enabled: !!userId && !!chatroomId,
  });
};

