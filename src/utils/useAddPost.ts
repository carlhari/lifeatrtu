"use client";
import { useButtonType } from "@/types/useAddPostType";
import { create } from "zustand";

export const useAddPost = create<useButtonType>((set, get) => ({
  click: false,
  clicked: () => set((state: any) => ({ click: !get().click })),
}));
