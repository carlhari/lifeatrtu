/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { useRequest } from "ahooks";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { formatTimeDays } from "@/utils/FormatTime";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const page = ({ params }: { params: { userId: string } }) => {
  const userId = params.userId;
  const { data: session } = useSession();
  const [remaining, setRemaining] = useState<any>(null);
  const router = useRouter();

  const getBanData = async () => {
    try {
      const response = await axios.post("/api/ban/data", { userId: userId });
      const data = response.data;

      if (data.ok) {
        return data.userData;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const { data, loading } = useRequest(getBanData, {
    refreshDeps: [userId, session],
    refreshOnWindowFocus: true,
  });

  const reset = (userId: any) => {
    axios.post("/api/ban/reset", { userId: userId }).catch((err: any) => {
      console.error(err);
    });
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (data && data.periodTime && data.periodTime !== 0) {
        const currentTime = Math.floor(Date.now() / 1000);

        const remainingTime = Math.max(
          0,
          Math.floor(data.periodTime + data.days * 24 * 60 * 60 - currentTime)
        );

        setRemaining((prevState: any) => ({
          ...prevState,
          remainingTime,
        }));

        if (remainingTime <= 0) {
          reset(userId);
          router.push("/");
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [data]);

  if (loading)
    return (
      <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center">
        <span className="loading loading-dots w-20"></span>
      </div>
    );

  if (!loading && !data) {
    return (
      <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center z-50 gap-2 font-semibold text-xl text-center xs:flex-col">
        <div>Forbidden,</div>
        <button
          type="button"
          className="underline text-blue-500"
          onClick={() => router.push("/")}
        >
          Click to go back to Login Page
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center">
      {!loading && data && remaining && (
        <div className="shadow-xl border border-black border-solid rounded-xl p-4 w-[500px]">
          <div className="text-red-600 text-2xl font-semibold">
            You Are Banned
          </div>
          <div className="text-xl font-bold">{data.email}</div>
          <div className="text-xl break-words whitespace-break-spaces">
            Reason: {data.reason}
          </div>
          <div className="flex items-center text-xl">
            Banned Period:{" "}
            {!data.permanent
              ? remaining && formatTimeDays(remaining.remainingTime)
              : data.permanent && "Permanent"}
            {!remaining && <span className="loading loading-dots w-10"></span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default page;
