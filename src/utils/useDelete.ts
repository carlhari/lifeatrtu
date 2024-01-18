import { useDeleteTypes } from "@/types/useDeleteTypes";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const dt = new Date();
export const useDelete = create<useDeleteTypes>()(
  persist(
    (set, get) => ({
      limit: 3,
      date: dt.toISOString(),
      maxLimit: false,
      decreaseLimit: () => {
        if (get().limit === 0) set(() => ({ maxLimit: true }));
        else set(() => ({ limit: get().limit - 1, maxLimit: false }));
      },

      check: () => {
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
      name: "delete limit",
    }
  )
);
