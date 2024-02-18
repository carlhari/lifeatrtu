"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";
import { Capitalize } from "@/utils/Capitalize";
import { isOpenLogout } from "@/utils/Overlay/Logout";
import { FaBell } from "react-icons/fa";
import { isOpenNotif } from "@/utils/Overlay/Notification";
import Notification from "@/app/components/overlays/Notification";
import axios from "axios";
import toast from "react-hot-toast";
import { useRequest } from "ahooks";

function Navigation() {
  const { data: session, status } = useSession();
  const { open } = isOpenLogout();
  const notif = isOpenNotif();
  const [resData, setResData] = useState<any>();

  return (
    <div className="flex items-center justify-between p-2 px-8 w-full md:px-4 sm:px-2">
      <div className="font-bold text-4xl sm:text-3xl xs:font-semibold xs:text-2xl">
        Hello,{" "}
        {status === "loading"
          ? "Loading"
          : session && Capitalize(session?.user?.name).split(" ")[0]}
      </div>
      <div className=" relative flex items-center justify-center gap-4 sm:gap-2">
        {notif.value && <Notification />}
        <div
          className="text-3xl cursor-pointer flex items-center sm:text-2xl -mt-1 xs:text-xl"
          onClick={() => notif.change()}
        >
          <FaBell />
        </div>
        <div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

export default Navigation;
