"use client";
import React from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
function LoginButton() {
  return (
    <>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/home" })}
        className="z-50 font-mono text-2xl flex items-center w-auto indent-1 border-black border-solid border-2 px-3 rounded-2xl"
      >
        <FcGoogle />
        Login With RTU
      </button>
    </>
  );
}

export default LoginButton;
