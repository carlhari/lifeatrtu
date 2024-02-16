import { create } from "zustand";

interface Notif {
  value: boolean;
  change: () => void;
}

export const isOpenNotif = create<Notif>((set, get) => ({
  value: false,
  change: () => {
    set(() => ({ value: !get().value }));
  },
}));
