"use client";
import React from "react";
import { isOpenLogout } from "@/utils/Overlay/Logout";

function LogoutButton() {
  const { changeOpen } = isOpenLogout();
  return (
    <button type="button" onClick={changeOpen}>
      Logout
    </button>
  );
}

export default LogoutButton;
