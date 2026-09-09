import api from "@/src/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const progressionResponseSchema = z.object({
  progression: z.object({
    level: z.number().int().min(1),
    xp: z.number().int().min(0),
    totalXp: z.number().int().min(0),
    xpToNextLevel: z.number().int().min(0),
  }),
});

export type ProgressionResponse = z.infer<typeof progressionResponseSchema>;

const getProgression = async (userId: string) => {
  const result = await api.get(`/users/${userId}/progression`);
  return progressionResponseSchema.parse(result);
};

export const useGetProgression = (userId: string) => {
  return useQuery({
    queryKey: ["progression", userId],
    queryFn: () => getProgression(userId),
    enabled: !!userId,
  });
};
