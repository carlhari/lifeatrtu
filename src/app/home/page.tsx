"use client";
import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
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

      if (status === "authenticated") {
        try {
          const response = await axios.post(
            "/api/user/add",
            {
              email: session?.user?.email,
              name: session?.user?.name,
            },
            { withCredentials: true }
          );

          const data = response.data;

          console.log(data);
        } catch (err) {
          console.error(err);
        }
      }
    };

    checkSession();
  }, [session, status, router]);

  return (
    <>
      {session ? (
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
      ) : (
        <div>Loading</div>
      )}
    </>
  );
}

export default Page;
