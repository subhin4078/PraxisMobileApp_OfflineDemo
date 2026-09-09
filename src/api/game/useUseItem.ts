import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import { getHttpErrorMessage, getHttpStatus } from "@/src/utils/httpError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const buffSchema = z.object({
  buff: z.string(),
  name: z.string(),
  activatedAt: z.string(),
  expiresAt: z.string(),
});

const lootItemSchema = z
  .object({
    itemId: z.string(),
  })
  .passthrough();

const useItemResponseSchema = z.object({
  inventory: z.object({}).passthrough(),
  buffs: z.array(buffSchema).optional(),
  loot: z.union([lootItemSchema, z.array(lootItemSchema)]).optional(),
});

export type UseItemLootEntry = z.infer<typeof lootItemSchema>;
export type UseItemResponse = z.infer<typeof useItemResponseSchema>;

const useInventoryItem = async (userId: string, itemId: string) => {
  const result = await api.post(
    `/users/${userId}/inventory/items/${itemId}/use`,
  );
  return useItemResponseSchema.parse(result);
};

export const useUseItem = (userId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (itemId: string) => useInventoryItem(userId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", userId] });
      queryClient.invalidateQueries({ queryKey: ["buffs", userId] });
    },
    onError: (error) => {
      toast.show(getHttpErrorMessage(getHttpStatus(error), t), "error");
    },
  });
};
