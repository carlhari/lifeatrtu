import { create } from "zustand";

interface LogoutType {
  open: boolean;
  changeOpen: () => void;
}

export const isOpenLogout = create<LogoutType>((set, get) => ({
  open: false,
  changeOpen: () => {
    set(() => ({ open: !get().open }));
  },
}));
