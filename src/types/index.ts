import { z } from "zod";

/* General */
export const NonEmptyString = (fieldName?: string) =>
  z
    .string()
    .trim()
    .min(1, fieldName ? { message: `${fieldName} is required` } : undefined);

/* Others */
export const healthCheckSchema = z.object({
  status: NonEmptyString(),
});
