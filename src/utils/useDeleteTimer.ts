import { create } from "zustand";
import { persist } from "zustand/middleware";

interface useDeleteTimerType {
  time: number;
  trigger: boolean;
  decrease: () => void;
}

export const useDeleteTimer = create<useDeleteTimerType>()(
  persist(
    (set, get) => ({
      time: 300,
      trigger: false,
      decrease: () => {
        if (get().time <= 0) return set(() => ({ time: 90, trigger: false }));

        return set(() => ({ time: get().time - 1, trigger: true }));
      },
    }),
    { name: "dTimer" }
  )
);
