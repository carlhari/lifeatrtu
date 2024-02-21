"use client";

import { create } from "zustand";

interface useButtonType {
  click: boolean;
  clicked: () => void;
}

export const useEditPost = create<useButtonType>((set, get) => ({
  click: false,
  clicked: () => set((state: any) => ({ click: !get().click })),
}));
