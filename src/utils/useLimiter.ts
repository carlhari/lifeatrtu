"use client";
import { useLimiterType } from "@/types/useLimiterType";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const dt = new Date();

export const useLimiter = create<useLimiterType>()(
  persist(
    (set, get) => ({
      limit: 10,
      date: dt.toISOString(),
      maxLimit: false,
      decreaseLimit: () => {
        if (get().limit === 0) set(() => ({ maxLimit: true }));
        else set(() => ({ limit: get().limit - 1, maxLimit: false }));
      },

      auto: () => {
        setInterval(() => {
          const currentDt = new Date();
          if (get().date !== currentDt.toISOString()) {
            set(() => ({
              limit: get().limit,
              date: currentDt.toISOString(),
              maxLimit: false,
            }));
          }
        }, 1000);
      },
    }),
    {
      name: "limit",
    }
  )
);
