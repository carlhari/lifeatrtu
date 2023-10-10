"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import useSwr from "swr";
import Navigation from "../components/Navigation";
import { DataForm } from "@/types";
import Form from "../components/Form";

function Page() {
  //delete Ref
  const deleteRef = useRef<HTMLButtonElement | null>(null);

  //deleteLoad
  const [deleteLoad, setDeleteLoad] = useState<boolean>(false);

  //routing the page
  const router = useRouter();

  //delete notif
  const [deleteNotif, setDeleteNotif] = useState<string>("");

  //form data to be edited
  const [edit, setEdit] = useState<{ [postId: string]: boolean }>({});

  //current user
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  //checking the user
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
        } catch (err) {
          console.error(err);
        }
      }
    };

    checkSession();
  }, [session, status, router]);

  const fetcher = (url: string) => axios.post(url).then((res) => res.data);
  const { data, error, isLoading } = useSwr("/api/post/data", fetcher, {
    refreshInterval: 1100,
  });

  const DeletePost = async (postId: string) => {
    setDeleteLoad(true);
    if (deleteRef.current) {
      deleteRef.current.disabled = true;
    }

    try {
      console.log("delete clicked ");
      const response = await axios.post("/api/post/delete", { postId: postId });
      const data = response.data;

      if (data.success) {
        setDeleteNotif("Successfully Deleted");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      setDeleteNotif("Error: Failed To Delete");
    }

    if (deleteRef.current) {
      deleteRef.current.disabled = false;
      setDeleteLoad(false);
    }

    setTimeout(() => {
      setDeleteNotif("");
    }, 800);
  };

  return (
    <>
      {session ? (
        <>
          <Navigation name={session.user?.name ?? null} />
          <div className="flex gap-3 flex-wrap w-full items-center justify-center">
            {deleteNotif && (
              <p className="fixed w-full h-full top-0 left-0 flex items-center justify-center bg-slate-600/80 z-50">
                {deleteNotif}
              </p>
            )}
            {isLoading ? (
              <div>Getting Data...</div>
            ) : (
              data.posts.map((item: DataForm, key: number) => (
                <div
                  key={key}
                  className="flex h-full items-center justify-center flex-col border-2 border-solid- border-black p-2 max-w-2xl max-h-96"
                >
                  {item.user.email === session?.user?.email && (
                    <div className="flex items-center justify-end w-full gap-2">
                      <button
                        type="button"
                        onClick={() => setEdit({ ...edit, [item.id]: true })}
                        className="border-2 border-solid border-black"
                      >
                        Edit This Post
                      </button>

                      <button
                        type="button"
                        onClick={() => DeletePost(item.id)}
                        ref={deleteRef}
                        className="bg-red-500 text-white"
                        style={{
                          cursor: deleteLoad ? "not-allowed" : "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}

                  <div>
                    <p>Post Id {item.id}</p>
                    <p>Post Title {item.title}</p>
                    <p>
                      Post Who Posted it:{" "}
                      {item.isChecked === true ? "Anonymous" : item.user.name}
                    </p>
                    <p>Post Content : {item.content}</p>
                    <p>Post Concern : {item.concern}</p>
                    {item.image && (
                      <img
                        src={item.image}
                        alt="Image Post"
                        className="w-1/2 h-96 object-contain max-w-full"
                      />
                    )}
                  </div>

                  {edit[item.id] && (
                    <Form
                      mode={`edit`}
                      initialData={{
                        id: item.id,
                        user: item.user,
                        title: item.title,
                        content: item.content,
                        isChecked: item.isChecked,
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
