import api from "@/src/lib/axios";
import { AccountData, accountResponseSchema } from "@/src/types/api";
import { useQuery } from "@tanstack/react-query";

const getAccount = async (userId: string): Promise<AccountData> => {
  const result = await api.get(`/users/${userId}/account`);
  return accountResponseSchema.parse(result);
};

export const useGetAccount = (userId: string) => {
  return useQuery({
    queryKey: ["account", userId],
    queryFn: () => getAccount(userId),
    enabled: !!userId,
  });
};
