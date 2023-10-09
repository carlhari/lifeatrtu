"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import useSwr from "swr";
import Navigation from "../components/Navigation";
import { DataForm } from "@/types";
import Form from "../components/Form";

function Page() {
  const router = useRouter();
  const [edit, setEdit] = useState<{ [postId: string]: boolean }>({});

  const [closeForm, setCloseForm] = useState<boolean>(false);

  const handleCloseForm = () => {
    setCloseForm(true);
  };

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

  const fetcher = (url: string) => axios.post(url).then((res) => res.data);
  const { data, error, isLoading } = useSwr("/api/post/data", fetcher, {
    refreshInterval: 1500,
  });

  console.log(data);

  console.log(session);
  return (
    <>
      {session ? (
        <>
          <Navigation name={session.user?.name ?? null} />
          <div className="flex gap-3 flex-wrap w-full items-center">
            {isLoading ? (
              <div>Getting Data...</div>
            ) : (
              data.posts.map((item: DataForm, key: number) => (
                <div
                  key={key}
                  className="flex items-center justify-center flex-col"
                >
                  {item.user.email === session?.user?.email && (
                    <button
                      type="button"
                      onClick={() => setEdit({ ...setEdit, [item.id]: true })}
                    >
                      Edit This Post
                    </button>
                  )}

                  <div>
                    <p>Post Id {item.id}</p>
                    <p>Post Title {item.title}</p>
                    <p>Post UserId Who Post: {item.user.email}</p>
                  </div>

                  {edit[item.id] && (
                    <Form
                      mode={`edit`}
                      initialData={{
                        id: item.id,
                        user: item.user,
                        title: item.title,
                        content: item.content,
                        postAs: item.postAs,
                        concern: item.concern,
                        image: item.image ?? null,
                      }}
                      onCancel={() => setEdit({ ...edit, [item.id]: false })}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div>Loading</div>
      )}
    </>
  );
}

export default Page;
