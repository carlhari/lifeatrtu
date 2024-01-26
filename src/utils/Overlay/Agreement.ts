import { create } from "zustand";

interface AgreementType {
  openAgreement: boolean;
  agreementF: () => void;
  agreementT: () => void;
}

export const isOpenAgreement = create<AgreementType>((set, get) => ({
  openAgreement: false,
  agreementF: () => set(() => ({ openAgreement: false })),
  agreementT: () => set(() => ({ openAgreement: true })),
}));
