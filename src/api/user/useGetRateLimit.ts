import api from "@/src/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const rateLimitResponseSchema = z.object({
  requestCount: z.number().int().min(0),
  dailyLimit: z.number().int().min(0),
  remainingRequests: z.number().int().min(0),
  resetAt: z.string(),
});

export type RateLimitResponse = z.infer<typeof rateLimitResponseSchema>;

const getRateLimit = async (userId: string) => {
  const result = await api.get(`/users/${userId}/rate-limit`);
  return rateLimitResponseSchema.parse(result);
};

export const useGetRateLimit = (userId: string) => {
  return useQuery({
    queryKey: ["rateLimit", userId],
    queryFn: () => getRateLimit(userId),
    enabled: !!userId,
  });
};
