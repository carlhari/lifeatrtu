"use client";
import React, { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
function Page() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  useEffect(() => {
    const checkSession = async () => {
      if (status === "loading") {
        return;
      }
    };

    checkSession();
  }, [session, status, router]);

  return (
    <div className="flex w-full items-center justify-between px-12 py-6">
      <div className="cursor-default">
        Hello, {session?.user ? `${session.user.name}` : "Loading.."}
      </div>

      <div className="flex items-center gap-5">
        <button type="button">Add Post</button>

        <button type="button" onClick={() => signOut({ callbackUrl: "/" })}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Page;
