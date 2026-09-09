import { create } from "zustand";

type ToastType = "success" | "error" | "warning" | "info";

type ToastState = {
  message: string | null;
  type: ToastType;
  toastKey: number;
  show: (message: string, type?: ToastType) => void;
  hide: () => void;
};

export const useToast = create<ToastState>((set) => ({
  message: null,
  type: "warning",
  toastKey: 0,
  show: (message: string, type: ToastType = "warning") =>
    set((state) => ({ message, type, toastKey: state.toastKey + 1 })),
  hide: () => set({ message: null }),
}));
