"use client";
import React from "react";
import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";
import { Capitalize } from "@/utils/Capitalize";

function Navigation() {
  const { data: session, status } = useSession();

  return (
    <div className="flex items-center justify-between p-2 px-8 w-full font-bold">
      <div className="text-4xl text-black">
        Hello,{" "}
        {status === "loading"
          ? "Loading"
          : session && Capitalize(session?.user?.name).split(" ")[0]}
      </div>
      <div className="flex items-center gap-6">
        <LogoutButton />
      </div>
    </div>
  );
}

export default Navigation;
