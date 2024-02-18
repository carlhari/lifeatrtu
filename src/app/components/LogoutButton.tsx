"use client";
import React from "react";
import { isOpenLogout } from "@/utils/Overlay/Logout";
import { MdLogout } from "react-icons/md";
function LogoutButton() {
  const { changeOpen } = isOpenLogout();
  return (
    <button
      type="button"
      onClick={changeOpen}
      className="text-4xl sm:text-3xl xs:text-2xl"
    >
      <MdLogout />
    </button>
  );
}

export default LogoutButton;
