"use client";
import React from "react";
import Button from "@/app/components/Button";
import { isOpenLogout } from "@/utils/Overlay/Logout";
import { signOut } from "next-auth/react";
function Logout() {
  const { changeOpen } = isOpenLogout();

  return (
    <div
      className="fixed top-0 left-0 w-full h-screen bg-slate-500/70 z-50 flex items-center justify-center"
      style={{ userSelect: "none" }}
    >
      <div className="card bg-white flex flex-col items-center gap-5 p-10">
        <div className="text-3xl">Are you sure you want to logout ? </div>
        <div className="flex gap-6">
          <Button
            label={"Yes"}
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-1 px-3 rounded-xl text-2xl shadow-lg bg-green-600 text-white"
          />
          <Button
            label={"No"}
            type="button"
            onClick={changeOpen}
            className="p-1 px-3 rounded-xl text-2xl shadow-lg bg-red-600 text-white"
          />
        </div>
      </div>
    </div>
  );
}

export default Logout;
