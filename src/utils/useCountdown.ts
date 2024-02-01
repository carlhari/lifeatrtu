import { create } from "zustand";
import { persist } from "zustand/middleware";
import { prisma } from "@/utils/PrismaConfig";

import { useSession } from "next-auth/react";

interface PostCountDownType {
  remainingTime: number | null | undefined;
  startingTime: number | null | undefined;

  startCountDown: () => void;
  setStartingTime: () => void;
}

const PostCD = async (userId: string, cdName: any) => {
  try {
    const cd = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        [cdName]: true,
      },
    });

    if (cd) {
      return cd[cdName] as number;
    }
  } catch (err) {
    console.error(err);
  }
};

export const usePostCountDown = create<PostCountDownType>()(
  persist(
    (set, get) => ({
      remainingTime: null,
      startingTime: null,
      setStartingTime: async () => {
        try {
          const { data: session } = useSession();

          if (session) {
            const startingTimeDB = await PostCD(
              session.user.id,
              "cooldownPost"
            );

            if (startingTimeDB === null || startingTimeDB === 0) {
              const currentDT = new Date();
              const startingTime = currentDT.getTime();
              set({ startingTime });
            } else {
              set({ startingTime: startingTimeDB });
            }
          }
        } catch (err) {
          console.error(err);
        }
      },

      startCountDown: () => {
        const getRemainingTime = () => {
          const { startingTime } = get();
          if (startingTime !== null && startingTime !== undefined) {
            const currentTime = new Date().getTime();
            const remaining = Math.max(
              0,
              Math.floor(
                (startingTime + 1 * 60 * 60 * 1000 - currentTime) / 1000
              )
            );

            set((state: any) => ({
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
      getStorage: () => localStorage,
    }
  )
);
