"use client";
import React from "react";
import { signOut } from "next-auth/react";

function LogoutButton() {
  return (
    <button type="button" onClick={() => signOut({ callbackUrl: "/" })}>
      Logout
    </button>
  );
}

export default LogoutButton;
