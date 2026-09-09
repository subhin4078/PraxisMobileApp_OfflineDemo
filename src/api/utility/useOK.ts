import api from "@/src/lib/axios";
import { healthCheckSchema } from "@/src/types";
import { useQuery } from "@tanstack/react-query";

// GET example, remove later
export function useOK() {
  return useQuery({
    queryKey: ["ok"],
    queryFn: async () => {
      const res = await api.get("/health");
      return healthCheckSchema.parse(res);
    },
  });
}
