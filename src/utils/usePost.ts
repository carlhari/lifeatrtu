"use client";

import { usePostType } from "@/types/usePostType";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const usePost = create<usePostType>()(
  persist(
    (set, get) => ({
      openPost: null as any,
      open: () => set(() => ({ openPost: true })),
      close: () => set(() => ({ openPost: false })),
    }),
    {
      name: "post",
    }
  )
);
