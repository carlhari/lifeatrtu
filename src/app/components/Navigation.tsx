"use client";
import React from "react";
import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";

function Navigation() {
  const { data: session, status } = useSession();

  return (
    <div className="flex items-center justify-between px-6 w-full text-2xl font-bold">
      {status === "loading" ? "Loading" : session && session.user.name}
      <LogoutButton />
    </div>
  );
}

export default Navigation;
