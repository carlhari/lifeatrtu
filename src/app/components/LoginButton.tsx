"use client";
import React, { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useLimiter } from "@/utils/useLimiter";

function LoginButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/home" })}
    >
      Login With RTU
    </button>
  );
}

export default LoginButton;
