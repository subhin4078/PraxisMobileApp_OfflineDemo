import { z } from "zod";

import { NonEmptyString } from ".";

/* Math Topics */
export const MathTopicsByArea = {
  algebra: [
    "law-of-indices",
    "change-of-subject",
    "factorization",
    "algebraic-fraction",
    "inequality",
    "remainder-factor-thm",
    "variation",
    "sequence",
  ],
  number: [
    "percentage",
    "rate-and-ratio",
    "approximation",
    "time-and-distance",
  ],
  equations: [
    "simultaneous-equations",
    "quadratic-equation",
    "quadratic-function",
    "logarithmic-function",
    "linear-programming",
  ],
  statistics: ["statistics", "probability", "measures-of-dispersion"],
  geometry: [
    "coordinates",
    "geometry-circle",
    "geometry-polygon",
    "geometry-3d",
    "mensuration",
    "locus",
    "equation-of-circle",
  ],
} as const;

// Derive MathTopics from MathTopicsByArea
export const MathTopics = [
  ...MathTopicsByArea.algebra,
  ...MathTopicsByArea.number,
  ...MathTopicsByArea.equations,
  ...MathTopicsByArea.statistics,
  ...MathTopicsByArea.geometry,
] as const;

export type MathTopic = (typeof MathTopics)[number];

/** Topics currently supported by the backend for practice & battle */
export const AVAILABLE_TOPICS: readonly MathTopic[] = [
  "approximation",
  "change-of-subject",
  "factorization",
  "inequality",
  "law-of-indices",
  "probability",
  "simultaneous-equations",
  "variation",
] as const;

/* auth */
export const loginResponseSchema = z.object({
  userId: NonEmptyString(),
  username: NonEmptyString(),
  email: NonEmptyString(),
  accessToken: z.jwt(),
  refreshToken: z.jwt(),
});

export const registerResponseSchema = z.object({
  userId: NonEmptyString(),
  accessToken: z.jwt(),
  refreshToken: z.jwt(),
});

export const refreshTokenResponseSchema = z.object({
  accessToken: z.jwt(),
});

/* profile */
export const profileResponseSchema = z.object({
  fullName: NonEmptyString(),
  age: z.number().int().min(5),
  gender: z.enum(["male", "female", "other"]),
  grade: NonEmptyString(),
  school: z.string().optional(),
  interests: z.array(NonEmptyString()).optional(),
  bio: z.string().optional(),
});

export type ProfileData = z.infer<typeof profileResponseSchema>;

/* account */
export const accountResponseSchema = z.object({
  username: NonEmptyString(),
  email: z.string().email(),
  registeredAt: z.string(),
  lastLogin: z.string(),
});

export type AccountData = z.infer<typeof accountResponseSchema>;

/* statistics */
export const statisticsResponseSchema = z.object({
  overview: z.object({
    averageScore: z.number().min(0).max(1),
    averageSpeed: z.number().min(0),
    averageDifficultyScore: z.number().min(0).max(100),
    topicsCovered: z.number().min(0).max(1),
  }),
  practiceHistory: z.array(
    z.object({
      score: z.number().min(0).max(1),
      difficulty: z.enum(["easy", "hard", "dse"]),
      secondsPerQuestion: z.number().min(0),
      questionsCount: z.number().int().min(0),
      finishedAt: z.string().datetime({ offset: true }),
    }),
  ),
  byTopicPerformance: z
    .record(
      z.enum(MathTopics),
      z
        .object({
          averageScore: z.number().min(0).max(1),
          averageDifficultyScore: z.number().min(0).max(100),
          questionsCompleted: z.number().int().min(0),
        })
        .optional(),
    )
    .optional(),
  activityLogs: z.array(
    z.object({
      date: z.string(),
      activity: z.object({
        completedQuestions: z.number().int().min(0).optional().default(0),
        participatedBattles: z.number().int().min(0).optional().default(0),
        chatAsked: z.number().int().min(0).optional().default(0),
      }),
    }),
  ),
});

export type StatisticsData = z.infer<typeof statisticsResponseSchema>;
