export type CatKey =
  | "newbornCat"
  | "curiousCat"
  | "smartCat"
  | "hunterCat"
  | "scholarCat"
  | "thinkerCat"
  | "masterCat"
  | "predatorCat"
  | "meowthematician";

export const CAT_THRESHOLDS = [
  { min: 80, key: "meowthematician" as CatKey },
  { min: 70, key: "predatorCat" as CatKey },
  { min: 60, key: "masterCat" as CatKey },
  { min: 50, key: "thinkerCat" as CatKey },
  { min: 40, key: "scholarCat" as CatKey },
  { min: 30, key: "hunterCat" as CatKey },
  { min: 20, key: "smartCat" as CatKey },
  { min: 10, key: "curiousCat" as CatKey },
  { min: 1, key: "newbornCat" as CatKey },
] as const;

export const getCatKey = (level: number): CatKey =>
  CAT_THRESHOLDS.find((t) => level >= t.min)?.key ?? "newbornCat";

/** Used by prefix-intro screen — includes level range for each rank */
export const ALL_CAT_LEVELS: {
  key: CatKey;
  minLevel: number;
  maxLevel: number | null;
}[] = [
  { key: "newbornCat", minLevel: 1, maxLevel: 9 },
  { key: "curiousCat", minLevel: 10, maxLevel: 19 },
  { key: "smartCat", minLevel: 20, maxLevel: 29 },
  { key: "hunterCat", minLevel: 30, maxLevel: 39 },
  { key: "scholarCat", minLevel: 40, maxLevel: 49 },
  { key: "thinkerCat", minLevel: 50, maxLevel: 59 },
  { key: "masterCat", minLevel: 60, maxLevel: 69 },
  { key: "predatorCat", minLevel: 70, maxLevel: 79 },
  { key: "meowthematician", minLevel: 80, maxLevel: null },
];
