import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import { getHttpErrorMessage, getHttpStatus } from "@/src/utils/httpError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const purchaseResponseSchema = z.object({
  inventory: z.object({}).passthrough(),
});

const purchaseItem = async (
  userId: string,
  itemId: string,
  quantity: number = 1,
) => {
  const result = await api.post(
    `/users/${userId}/shop/items/${itemId}/purchase`,
    { quantity },
  );
  return purchaseResponseSchema.parse(result);
};

export const usePurchaseItem = (userId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity?: number }) =>
      purchaseItem(userId, itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", userId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
    },
    onError: (error) => {
      // Check for specific error messages from the API response
      const errorResponse = (error as any)?.response?.data;
      if (String(errorResponse?.error).includes("Insufficient")) {
        toast.show(t("shop.errors.insufficientCoins"), "error");
      } else {
        toast.show(getHttpErrorMessage(getHttpStatus(error), t), "error");
      }
    },
  });
};
