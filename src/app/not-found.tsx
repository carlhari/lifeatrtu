"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function NotFound() {
  const [counter, setCounter] = useState(5);
  const router = useRouter();

  useEffect(() => {
    const countdown = setInterval(() => {
      setCounter((prevCounter) => prevCounter - 1);
    }, 1000);

    setTimeout(() => {
      router.push("/");
      clearInterval(countdown);
    }, 5000);

    return () => {
      clearInterval(countdown);
    };
  }, [router]);

  return (
    <div className="w-full h-screen flex items-center justify-center text-2xl">
      Link doesnt exist. Redirecting in {counter} seconds. Please Wait
    </div>
  );
}

export default NotFound;
