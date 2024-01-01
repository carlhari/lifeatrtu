"use client";
import { useLimiterType } from "@/types/useLimiterType";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const day = 24 * 60 * 60 * 1000;

export const useLimiter = create<useLimiterType>()(
  persist(
    (set, get) => ({
      limit: 10,
      maxAge: day,
      maxLimit: false,
      decreaseLimit: () => {
        if (get().limit === 0) return set(() => ({ maxLimit: true }));
        else set(() => ({ limit: get().limit - 1 }));
      },

      auto: () => {
        setInterval(() => {
          if (get().maxAge === 0) {
            clearInterval;
            set(() => ({ maxAge: day, limit: 10, maxLimit: false }));
            return;
          } else set(() => ({ maxAge: get().maxAge - 1 }));
        }, 100);
      },
    }),
    {
      name: "limit",
    }
  )
);
