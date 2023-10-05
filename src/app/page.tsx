"use client";
import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: false,
    onUnauthenticated() {
      return;
    },
  });

  useEffect(() => {
    const checkSession = async () => {
      if (status === "loading") {
        return;
      }

      if (session?.user) {
        router.push("/home");
      }
    };

    checkSession();
  }, [session, status, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {status === "loading" ? (
        <div>Loading...</div>
      ) : (
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/home" })}
        >
          Login With RTU
        </button>
      )}
    </main>
  );
}
