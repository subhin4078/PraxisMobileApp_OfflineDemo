import logger from "@/src/utils/logger";
import api from "@/src/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const practiceListItemSchema = z.object({
  practiceId: z.string(),
  topics: z.array(z.string()),
  completed: z.boolean(),
  createdAt: z.string(),
});

const practicesResponseSchema = z.object({
  practices: z.array(practiceListItemSchema),
});

export type PracticeListItem = z.infer<typeof practiceListItemSchema>;

const getPractices = async (userId: string): Promise<PracticeListItem[]> => {
  const result = await api.get(`/users/${userId}/practices`);
  const parsed = practicesResponseSchema.safeParse(result);
  if (!parsed.success) {
    logger.error(
      "[useGetPractices] Zod validation failed:",
      JSON.stringify(parsed.error.issues, null, 2),
      "\nRaw response:",
      JSON.stringify(result, null, 2),
    );
    throw parsed.error;
  }
  return parsed.data.practices;
};

export const useGetPractices = (userId: string) => {
  return useQuery({
    queryKey: ["practices", userId],
    queryFn: () => getPractices(userId),
    enabled: !!userId,
  });
};

