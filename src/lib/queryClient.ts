import { buildZodErrorMessage } from "@/src/utils";
import logger from "@/src/utils/logger";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { z } from "zod";

const MAX_RETRIES = 3;

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (err) => {
      if (err instanceof z.ZodError)
        logger.error(
          `Unexpected Response format: ${JSON.stringify(buildZodErrorMessage(err.issues), null, 2)}`,
        );
    },
  }),
  mutationCache: new MutationCache({
    onError: (err) => {
      if (err instanceof z.ZodError)
        logger.error(
          `Unexpected Response format: ${JSON.stringify(buildZodErrorMessage(err.issues), null, 2)}`,
        );
    },
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof z.ZodError) return false; // no retry for validation errors
        return failureCount < MAX_RETRIES;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh, no refetch during this time
      gcTime: 10 * 60 * 1000, // 10 minutes - cached data persists in memory
    },
    mutations: {
      retry: false,
    },
  },
});

export default queryClient;
