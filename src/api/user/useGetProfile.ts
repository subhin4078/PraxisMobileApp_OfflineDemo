import api from "@/src/lib/axios";
import { profileResponseSchema } from "@/src/types/api";
import { useQuery } from "@tanstack/react-query";

export function useGetProfile(userId: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}/profile`);
      return profileResponseSchema.parse(res);
    },
    enabled: !!userId,
  });
}
