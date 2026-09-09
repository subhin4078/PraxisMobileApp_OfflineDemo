import api from "@/src/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const inventoryItemSchema = z.object({
  quantity: z.number().int().min(0),
  status: z.enum(["inBag", "equipped", "expired"]),
  acquiredAt: z.string(),
  updatedAt: z.string(),
  expiresAt: z.string().nullable().optional(),
});

const inventoryResponseSchema = z.object({
  inventory: z.object({
    pawCoins: z.number().int().min(0),
    items: z.record(z.string(), inventoryItemSchema),
  }),
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;
export type InventoryResponse = z.infer<typeof inventoryResponseSchema>;

const getInventory = async (userId: string) => {
  const result = await api.get(`/users/${userId}/inventory`);
  return inventoryResponseSchema.parse(result);
};

export const useGetInventory = (userId: string) => {
  return useQuery({
    queryKey: ["inventory", userId],
    queryFn: () => getInventory(userId),
    enabled: !!userId,
  });
};
