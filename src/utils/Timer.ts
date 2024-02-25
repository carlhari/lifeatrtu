import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PostCountDownType {
  startingTime: number;
  remainingTime: number;
  countdown: () => void;
  setStarting: (data: any) => void;
}

export const usePostCountDown = create<PostCountDownType>()(
  persist(
    (set, get) => ({
      startingTime: 0,
      remainingTime: 0,
      countdown: () => {
        const getRemainingTime = () => {
          if (
            get().startingTime !== null &&
            get().startingTime !== undefined &&
            get().startingTime !== 0
          ) {
            const currentTime = new Date().getTime();
            const remaining = Math.max(
              0,
              Math.floor(
                (get().startingTime + 1 * 60 * 60 * 1000 - currentTime) / 1000,
              ),
            );

            if (remaining === 0) {
              clearInterval(interval);
              set(() => ({ startingTime: 0, remainingTime: 0 }));
            } else
              set((state: any) => ({
                ...state,
                remainingTime: remaining,
              }));
          } else set(() => ({ remainingTime: 0 }));
        };

        getRemainingTime();

        const interval = setInterval(getRemainingTime, 1000);

        return () => clearInterval(interval);
      },

      setStarting: (data) => {
        return set(() => ({ startingTime: data }));
      },
    }),
    { name: "postT" },
  ),
);
