"use client";
import React from "react";
import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";
import { Capitalize } from "@/utils/Capitalize";

import { FaBell } from "react-icons/fa";
import { isOpenNotif } from "@/utils/Overlay/Notification";
import Notification from "@/app/components/overlays/Notification";

function Navigation() {
  const { data: session, status } = useSession();
  const notif = isOpenNotif();

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
