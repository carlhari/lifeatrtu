"use client";
import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navigation from "../components/Navigation";

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
        <Navigation name={session.user?.name ?? null} />
      ) : (
        <div>Loading</div>
      )}
    </>
  );
}

export default Page;
