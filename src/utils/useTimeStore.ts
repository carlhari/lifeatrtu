"use client";
import { useTimerStoreType } from "@/types/useTimeStoreType";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useTimeStore = create<useTimerStoreType>()(
  persist(
    (set, get) => ({
      time: 5,
      trigger: false,
      decrease: () => {
        if (get().time <= 0) return set(() => ({ time: 5, trigger: false }));

        return set(() => ({ time: get().time - 1, trigger: true }));
      },
    }),
    { name: "storage" }
  )
);
