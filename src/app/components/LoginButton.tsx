"use client";
import React from "react";
import { signIn } from "next-auth/react";
import LogoutButton from "./LogoutButton";


function LoginButton() {
  return (
    <>
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/home" })}
    >
      Login With RTU
    </button>
    </>
  );
}

export default LoginButton;
