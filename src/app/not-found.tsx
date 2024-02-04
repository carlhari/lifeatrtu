"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function NotFound() {
  const [counter, setCounter] = useState(10);
  const router = useRouter();

  useEffect(() => {
    const countdown = setInterval(() => {
      setCounter((prevCounter) => prevCounter - 1);
    }, 1000);

    setTimeout(() => {
      router.push("/");
      clearInterval(countdown);
    }, 10000);

    return () => {
      clearInterval(countdown);
    };
  }, [router]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center text-2xl">
      <span className="loading loading-spinner loading-lg"></span>

      <div>
        Link doesnt exist. Redirecting in {counter} seconds. Please Wait
      </div>
    </div>
  );
}

export default NotFound;
