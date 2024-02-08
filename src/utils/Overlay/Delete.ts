import { create } from "zustand";

interface Delete {
  value: boolean;
  open: () => void;
  close: () => void;
}

interface valueDelete {
  id: string;
  setId: (data: any) => void;
  clear: () => void;
}

export const isOpenDelete = create<Delete>((set) => ({
  value: false,
  open: () => {
    set(() => ({ value: true }));
  },
  close: () => {
    set(() => ({ value: false }));
  },
}));

export const valueDelete = create<valueDelete>((set) => ({
  id: "",
  setId: (id: string) => {
    set(() => ({ id: id }));
  },

  clear: () => {
    set(() => ({ id: "" }));
  },
}));
