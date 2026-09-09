import api from "@/src/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const shopItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number().int().min(0),
  type: z.enum(["pet", "clothing", "boost"]),
  buff: z.string().optional(),
  purchasable: z.boolean(),
  durationSeconds: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const shopItemsResponseSchema = z.object({
  items: z.array(shopItemSchema),
});

export type ShopItem = z.infer<typeof shopItemSchema>;

const getShopItems = async () => {
  const result = await api.get("/shop/items");
  return shopItemsResponseSchema.parse(result);
};

export const useGetShopItems = () => {
  return useQuery({
    queryKey: ["shopItems"],
    queryFn: getShopItems,
  });
};
