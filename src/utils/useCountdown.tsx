import { create, State } from "zustand";
import { persist } from "zustand/middleware";

interface PostCountDownType {
  remainingTime: number | null;
  startingTime: number | null;

  startCountDown: () => void;
  setStartingTime: () => void;
}

const current = new Date();

export const usePostCountDown = create<PostCountDownType>()(
  persist(
    (set, get) => ({
      remainingTime: null,
      startingTime: null,
      setStartingTime: () => {
        const currentDT = new Date();
        const startingTime = currentDT.getTime();
        set({ startingTime });
      },

      startCountDown: () => {
        const getRemainingTime = () => {
          const { startingTime } = get();
          if (startingTime !== null) {
            const currentTime = new Date().getTime();
            const remaining = Math.max(
              0,
              Math.floor(
                (startingTime + 1 * 60 * 60 * 1000 - currentTime) / 1000
              )
            );

            set((state) => ({
              ...state,
              remainingTime: remaining,
            }));

            if (remaining === 0) {
              clearInterval(countdownInterval);
            }
          }
        };

        getRemainingTime();
        const countdownInterval = setInterval(getRemainingTime, 1000);

        return () => clearInterval(countdownInterval);
      },
    }),
    {
      name: "postCountDown",
    }
  )
);
