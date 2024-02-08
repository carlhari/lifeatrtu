import { create } from "zustand";

interface OpenReport {
  value: boolean;
  open: () => void;
  close: () => void;
}

interface valueReport {
  id: string;
  setId: (data: any) => void;
  clear: () => void;
}

export const isOpenReport = create<OpenReport>((set) => ({
  value: false,
  open: () => {
    set(() => ({ value: true }));
  },
  close: () => {
    set(() => ({ value: false }));
  },
}));

export const valueReport = create<valueReport>((set) => ({
  id: "",
  setId: (id: string) => {
    set(() => ({ id: id }));
  },
  clear: () => {
    set(() => ({ id: "" }));
  },
}));
