"use client";
import { useLimiterType } from "@/types/useLimiterType";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import moment from "moment";

const day = 24 * 60 * 60 * 1000;
const dt = new Date();

export const useLimiter = create<useLimiterType>()(
  persist(
    (set, get) => ({
      limit: 10,
      date: dt.getDay(),
      maxLimit: false,
      decreaseLimit: () => {
        if (get().limit >= 0) return set(() => ({ maxLimit: true }));
        else set(() => ({ limit: get().limit - 1 }));
      },

      auto: () => {
        setInterval(() => {
          if (get().date !== dt.getDay())
            return set(() => ({
              limit: 10,
              date: dt.getDay(),
              maxLimit: false,
            }));
        }, 10000);
      },
    }),
    {
      name: "limit",
    }
  )
);
