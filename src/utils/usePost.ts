"use client";

import { usePostType } from "@/types/usePostType";
import { create } from "zustand";

export const usePost = create<usePostType>((set) => ({
  openPost: false,
  open: () => set(() => ({ openPost: true })),
  close: () => set(() => ({ openPost: false })),
}));
