import { BattleEndedPayload, BattleStartPayload } from "@/src/types/battle";
import { create } from "zustand";

interface BattleStore {
  activeBattle: BattleStartPayload | null;
  lastBattleResult: BattleEndedPayload | null;
  setActiveBattle: (battle: BattleStartPayload | null) => void;
  setLastBattleResult: (result: BattleEndedPayload | null) => void;
  clearBattleState: () => void;
}

export const useBattleStore = create<BattleStore>((set) => ({
  activeBattle: null,
  lastBattleResult: null,
  setActiveBattle: (battle) => set({ activeBattle: battle }),
  setLastBattleResult: (result) => set({ lastBattleResult: result }),
  clearBattleState: () => set({ activeBattle: null, lastBattleResult: null }),
}));
