/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { useRequest } from "ahooks";
import axios from "axios";
import React, { useEffect } from "react";
import { formatTimeDays, formatTimeHours } from "@/utils/FormatTime";
import { useSession } from "next-auth/react";
import moment from "moment";

const page = ({ params }: { params: { userId: string } }) => {
  const userId = params.userId;
  const { data: session } = useSession();

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

  useEffect(() => {
    if (data && data.periodTime) {
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = Math.max(
        0,
        Math.floor(data.periodTime + 4 * 60 * 60 * 1000 - currentTime)
      );
      console.log("period t", data.periodTime);
      console.log("current", currentTime);
      console.log("remainingTime", formatTimeDays(remainingTime));

      if (remainingTime <= 0) {
        console.log("User unbanned");
      }
    }
  }, [data]);

  if (!userId || userId === null || userId === undefined) {
    return <div>Forbidden</div>;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center">
      {loading ? (
        <span className="loading loading-dots w-20"></span>
      ) : data ? (
        <div className="shadow-xl border border-black border-solid rounded-xl p-8">
          <div className="text-red-600">You Are Banned</div>
          <div>{data.email}</div>
          <div>Reason: {data.reason}</div>
          <div>Banned Period: {formatTimeDays(data.periodTime)}</div>
        </div>
      ) : (
        <div>CLick to go back at login</div>
      )}
    </div>
  );
};

export default page;
