import type { MathTopic } from "@/src/types/api";

// Re-export cat constants from shared location
export { CAT_THRESHOLDS, getCatKey } from "@/src/constants/catConstants";
export type { CatKey } from "@/src/constants/catConstants";

export const WILDCARD_TOPIC = "*" as const;

export const BATTLE_ALLOWED_TOPICS = [
  "law-of-indices",
  "change-of-subject",
  "approximation",
  "probability",
  "factorization",
  "inequality",
  "simultaneous-equations",
  "variation",
] as const satisfies readonly MathTopic[];

export type BattleAllowedTopic = (typeof BATTLE_ALLOWED_TOPICS)[number];
export type BattleQueueTopic = BattleAllowedTopic | typeof WILDCARD_TOPIC;
export type QueueState =
  | "idle"
  | "joining"
  | "waiting"
  | "found"
  | "confirming";
