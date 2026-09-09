import api from "@/src/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const buffSchema = z.object({
  buff: z.string(),
  name: z.string(),
  activatedAt: z.string(),
  expiresAt: z.string(),
});

const buffsResponseSchema = z.object({
  buffs: z.array(buffSchema),
});

export type Buff = z.infer<typeof buffSchema>;

const getBuffs = async (userId: string) => {
  const result = await api.get(`/users/${userId}/buffs`);
  return buffsResponseSchema.parse(result);
};

export const useGetBuffs = (userId: string) => {
  return useQuery({
    queryKey: ["buffs", userId],
    queryFn: () => getBuffs(userId),
    enabled: !!userId,
  });
};
