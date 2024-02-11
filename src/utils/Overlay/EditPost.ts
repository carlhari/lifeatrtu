import { create } from "zustand";

interface OpenEdit {
  value: boolean;
  open: () => void;
  close: () => void;
}

interface valueEdit {
  id: string;
  setId: (data: any) => void;
  clear: () => void;
}

export const isOpenEdit = create<OpenEdit>((set) => ({
  value: false,
  open: () => {
    set(() => ({ value: true }));
  },
  close: () => {
    set(() => ({ value: false }));
  },
}));

export const valueEdit = create<valueEdit>((set) => ({
  id: "",
  setId: (id: string) => {
    set(() => ({ id: id }));
  },
  clear: () => {
    set(() => ({ id: "" }));
  },
}));
