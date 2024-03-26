/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";
import { Capitalize } from "@/utils/Capitalize";
import { FaBell } from "react-icons/fa";
import { isOpenNotif } from "@/utils/Overlay/Notification";
import Notification from "@/app/components/overlays/Notification";
import { useRequest } from "ahooks";
import axios from "axios";
import { report } from "process";

function Navigation() {
  const { data: session, status } = useSession();
  const [keyword, setKeyword] = useState<boolean>(false);
  const [reports, setReports] = useState<Array<string>>([]);
  const notif = isOpenNotif();

  function getNotif() {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post("/api/post/get/notif");
        const data = response.data;
        if (data.ok) {
          return resolve(data);
        }
        return reject();
      } catch (err) {
        console.error(err);
      }
    });
  }

  const { data, loading }: any = useRequest(() => getNotif(), {
    refreshDeps: [session, keyword],
  });

  useEffect(() => {
    if (data && data.notifs) {
      const newReports = data.notifs
        .filter((notif: any) => !notif.read)
        .map((notif: any) => notif.id);
      setReports((prevReports: any) => {
        const uniqueReports = new Set([...prevReports, ...newReports]);
        return Array.from(uniqueReports);
      });
    }
  }, [data]);

  const hasUnread = data && data.notifs.some((notif: any) => !notif.read);

  const updateReportRead = () => {
    axios.post("/api/post/get/notif/update", { reports: reports });
  };

  return (
    <div className="flex items-center justify-between p-2 px-8 w-full md:px-4 sm:px-2">
      <div className="font-bold text-4xl sm:text-3xl xs:font-semibold xs:text-2xl">
        Hello,{" "}
        {status === "loading"
          ? "Loading"
          : session && Capitalize(session?.user?.name).split(" ")[0]}
      </div>
      <div className=" relative flex items-center justify-center gap-4 sm:gap-2">
        {notif.value && <Notification data={data} loading={loading} />}
        <button
          type="button"
          className={`text-3xl cursor-pointer flex items-center sm:text-2xl -mt-1 xs:text-xl ${!loading && hasUnread && "indicator"}`}
          onClick={() => {
            updateReportRead();
            notif.change();
            setKeyword(!keyword);
          }}
          disabled={status === "loading" ? true : false}
        >
          <FaBell />
          {!loading && !notif.value && hasUnread && (
            <span className="indicator-item badge badge-success badge-xs"></span>
          )}
        </button>
        <div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

export default Navigation;
