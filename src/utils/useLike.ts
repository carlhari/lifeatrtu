"use client";

import { useLikeType } from "@/types/useLikeType";
import { create } from "zustand";

export const useLike = create<useLikeType>((set, get) => ({
  like: false,
  clickedLiked: () => set(() => ({ like: !get().like })),
}));
