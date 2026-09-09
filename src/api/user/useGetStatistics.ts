import api from "@/src/lib/axios";
import { StatisticsData, statisticsResponseSchema } from "@/src/types/api";
import { useQuery } from "@tanstack/react-query";

const getStatistics = async (userId: string): Promise<StatisticsData> => {
  const result = await api.get(`/users/${userId}/statistics`);
  return statisticsResponseSchema.parse(result);
};

export const useGetStatistics = (userId: string) => {
  return useQuery({
    queryKey: ["statistics", userId],
    queryFn: () => getStatistics(userId),
    enabled: !!userId,
  });
};
