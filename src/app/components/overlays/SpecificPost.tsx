/* eslint-disable @next/next/no-img-element */
import { usePost } from "@/utils/usePost";
import { useRequest } from "ahooks";
import axios from "axios";
import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import moment from "moment";
import Input from "@/app/components/Input";
import { useSession } from "next-auth/react";
import { Capitalize } from "@/utils/Capitalize";
import { CgProfile } from "react-icons/cg";
import { io } from "socket.io-client";
import { CiPlay1 } from "react-icons/ci";

function SpecificPost({
  postId,
  setKeyword,
  keyword,
}: {
  postId: string;
  setKeyword: any;
  keyword: boolean;
}) {
  const { close } = usePost();
  const [comment, setComment] = useState<string>("");
  const [disabled, setDisabled] = useState<boolean>(false);
  const [isDisabled, setDisabledCancel] = useState<boolean>(false);
  const [disabledBtn, setDisabledBTN] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { data: session } = useSession();

  const [openImage, setOpenImage] = useState<boolean>(false);

  const { data, loading, mutate } = useRequest(() => getPost(), {
    refreshDeps: [session],
  });

  const controllerRef = useRef(new AbortController());

  let status = ["BUSY", "UNAUTHORIZED", "NEGATIVE", "ERROR", "FAILED"];

  function getPost(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post("/api/post/get/specific", {
          postId: postId,
        });
        const data = response.data;
        if (data.ok) {
          resolve(data);
        } else reject(data);
      } catch (err) {
        reject(err);
      }
    });
  }

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();
    return () => controllerRef.current?.abort();
  }, [session]);

  const handleAddComment = (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isDisabled) {
      toast.error("Please Wait");
    }

    setDisabledBTN(true);
    const loadingId = toast.loading("Processing...");

    const { signal } = controllerRef.current;

    setTimeout(() => {
      setDisabledCancel(true);
      axios
        .post(
          "/api/post/actions/comment",
          {
            postId: postId,
            content: comment,
            author: session?.user.id,
          },
          { signal: signal }
        )
        .then((response) => {
          if (!status.includes(response.data.status)) {
            if (response.data.ok) {
              mutate((prev: any) => {
                return {
                  ...prev,
                  post: {
                    ...prev.post,
                    comments: [
                      ...prev.post.comments,
                      {
                        content: comment,
                        postId: postId,
                        user: {
                          id: session?.user.id,
                          name: Capitalize(session?.user.name),
                        },
                      },
                    ],
                  },
                };
              });

              setKeyword(!keyword);
              setDisabled(false);
              formRef.current && formRef.current.reset();
              setComment("");

              const socket = io(`${process.env.NEXT_PUBLIC_LINK}`);
              socket.emit("active_comment", {
                userId: session?.user.id,
                author: data.author,
                currentName: Capitalize(session?.user.name),
                postId: postId,
                title: data.title,
              });

              toast.success(response.data.msg);
            } else {
              toast.error(`Failed [${data.status}]: ${data.msg}`);
            }
          } else {
            toast.error(`Failed [${data.status}]: ${data.msg}`);
          }
        })
        .catch((err) => {
          if (err.name === "CanceledError") {
            toast.error("Canceled");
          }
        })
        .finally(() => {
          toast.dismiss(loadingId);
          setDisabled(false);
          setDisabledCancel(false);
          setDisabledBTN(false);
        });
    }, 1000);
  };

  return (
    <div className="w-full h-screen z-50 fixed top-0 left-0 flex justify-center items-center flex-col bg-slate-400/70 animate-fadeIn">
      {!data && loading ? (
        <span className="loading loading-dots w-36"></span>
      ) : (
        <div className="bg-white p-4 rounded-2xl w-1/2 animate-fadeIn 2xl:w-8/12 xl:w-9/12 lg:p-2 lg:w-10/12 md:w-11/12  sm:w-full sm:h-full sm:rounded-none sm:max-h-full max-h-p-95 sm:p-2">
          {openImage && (
            <div className="w-full h-screen fixed top-0 left-0 bg-white flex items-center flex-col justify-center animate-fadeIn">
              <button
                type="button"
                className={`absolute top-8 right-12 text-5xl sm:text-3xl sm:right-8 xxs:right-2`}
                onClick={() => {
                  setOpenImage(false);
                }}
              >
                <IoClose />
              </button>

              <img
                src={data.post.image}
                alt="image"
                className="object-cover border-2 border-solid border-black max-h-full max-w-full"
              />
            </div>
          )}
          <Toaster />
          <div className="w-full flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                controllerRef.current.abort();
                close();
              }}
              className={`text-3xl ${isDisabled && "hidden"}`}
              disabled={isDisabled}
            >
              <IoClose />
            </button>
          </div>

          {data && data.post && data.post.user && (
            <div className="w-full flex flex-col justify-center">
              <div className="text-3xl font-semibold break-words w-full text-justify xs:text-xl">
                {data.post.title}
              </div>

              <div className="flex items-center text-xl gap-2 w-full justify-start lg:text-base">
                Focus:{" "}
                <div className="font-semibold first-letter:uppercase">
                  {data.post.focus}
                </div>
              </div>

              <div className="text-sm">
                {moment(data.post.createdAt).format("LLL")}
              </div>

              <div className="w-full h-full flex gap-2 items-center flex-col">
                <div className="bg-slate-300 w-full h-1/2 p-2 rounded-xl sm:p-1 sm:rounded-md flex flex-col gap-2">
                  <div className="w-full flex items-center justify-start gap-1">
                    <div className="text-4xl flex items-center sm:text-2xl">
                      <CgProfile />
                    </div>

                    {session && data.post.anonymous ? (
                      <div className="font-semibold text-lg sm:text-base">
                        {data.post.userId === session?.user.id
                          ? "Anonymous (Me)"
                          : "Anonymous"}
                      </div>
                    ) : (
                      <div className="font-semibold text-lg sm:text-base">
                        {data.post.user.name}
                      </div>
                    )}
                  </div>

                  <div
                    className={`${data.post.lenght <= 100 ? "text-base" : "text-sm"} break-words whitespace-break-spaces text-justify px-2 sm:px-0 xs:leading-tight xs:overflow-y-auto`}
                  >
                    {data.post.content}
                  </div>

                  {data.post.image && (
                    <img
                      src={data.post.image}
                      alt={"Image"}
                      style={{
                        maxWidth: "100%",

                        margin: "auto",
                        objectFit: "contain",
                      }}
                      className="max-h-p-290 md:max-h-p-200"
                      onClick={() => setOpenImage(true)}
                    />
                  )}
                </div>

                {/* ---------------------------------------------------- */}
                <div className="bg-slate-300 w-full h-1/2 px-2 py-1 rounded-xl sm:p-1 sm:rounded-md">
                  {data.post.comments.length === 0 ? (
                    <div className="text-sm">Be the first to comment.</div>
                  ) : (
                    <div className="w-full overflow-y-auto flex flex-col gap-2 rounded-xl max-h-p-130 sm:max-h-p-200">
                      {data.post.comments
                        .slice()
                        .reverse()
                        .map((item: any, key: number) => {
                          return (
                            <div
                              key={key}
                              className="bg-white w-full rounded-xl p-1 sm:rounded-md"
                            >
                              <div className="flex items-center justify-start gap-1">
                                <div className="text-3xl xs:text-2xl">
                                  <CgProfile />
                                </div>
                                <div>
                                  <div className="text-lg sm:text-sm">
                                    {item.user.name}
                                  </div>
                                </div>
                              </div>
                              <div className="text-lg  break-words whitespace-break-spaces text-justify w-full px-2 sm:text-sm">
                                {item.content}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <form
            ref={formRef}
            onSubmit={handleAddComment}
            className="flex items-center w-full gap-4 justify-center mt-2 lg:mt-1 sm:mt-2 xs:gap-2"
          >
            <Input
              type="text"
              onChange={(e) => setComment(e.target.value)}
              maxLength={100}
              className="border-2 border-slate-600 border-solid rounded-2xl text-lg px-2 w-4/6 lg:text-lg"
            />

            <div className="text-sm sm:text-xs">{comment.length}/100</div>
            <button
              type="submit"
              disabled={disabled || isDisabled || disabledBtn}
              className={`text-2xl flex items-center ${disabled || isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              {disabled ? (
                <span className="loading loading-dots"></span>
              ) : (
                <CiPlay1 />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default SpecificPost;
