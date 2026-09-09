import { removeItem, setItem } from "@/src/utils/storage";
import { create } from "zustand";

interface UserState {
  userId: string | null;
  username: string | null;
  email: string | null;
  equippedSkin: string | null;
  setUser: (userId: string, username: string, email: string) => void;
  setEquippedSkin: (skinId: string) => void;
  resetUser: () => void;
}

const useUserStore = create<UserState>((set) => ({
  userId: null,
  username: null,
  email: null,
  equippedSkin: null,
  setUser: (userId, username, email) => set({ userId, username, email }),
  setEquippedSkin: (skinId) => {
    set({ equippedSkin: skinId });
    void setItem("equippedSkin", skinId);
  },
  resetUser: () => {
    set({ userId: null, username: null, email: null, equippedSkin: null });
    void removeItem("equippedSkin");
  },
}));

export default useUserStore;
