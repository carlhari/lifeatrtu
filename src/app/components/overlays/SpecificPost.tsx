import { usePost } from "@/utils/usePost";
import { useRequest } from "ahooks";
import Button from "@/app/components/Button";
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
  const formRef = useRef<HTMLFormElement>(null);
  const { data: session } = useSession();

  const [openImage, setOpenImage] = useState<boolean>(false);

  const { data, loading, mutate } = useRequest(() => getPost());

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
  let status = ["BUSY", "UNAUTHORIZED", "NEGATIVE", "ERROR", "FAILED"];
  const AddComment = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDisabled(true);
    setKeyword(!keyword);
    try {
      const response = new Promise(async (resolve, reject) => {
        const res = await axios.post("/api/post/actions/comment", {
          postId: postId,
          content: comment,
          author: session?.user.id,
        });
        const data = res.data;
        if (!status.includes(data.status)) {
          if (data.ok) {
            setTimeout(() => {
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

              const socket = io(`${process.env.NEXT_PUBLIC_LINK}`);

              setDisabled(false);
              formRef.current && formRef.current.reset();
              setComment("");

              socket.emit("active_comment", {
                userId: session?.user.id,
                author: data.author,
                currentName: Capitalize(session?.user.name),
                postId: postId,
              });

              resolve(data);
            }, 1500);
          } else reject(data);
        } else reject(data);
      });

      toast.promise(response, {
        loading: "loading",
        success: (data: any) => `Success: ${data.msg}`,
        error: (data: any) => `Failed [${data.status}]: ${data.msg}`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full h-screen z-50 fixed top-0 left-0 flex justify-center items-center flex-col bg-slate-400/70 animate-fadeIn">
      {!data && loading ? (
        <span className="loading loading-dots w-36"></span>
      ) : (
        <div
          className="bg-white p-4 rounded-2xl w-1/2 animate-fadeIn 2xl:w-8/12 lg:w-9/12 md:w-10/12 xs:w-11/12"
          style={{ maxHeight: "98%" }}
        >
          {openImage && (
            <div className="w-full h-screen fixed top-0 left-0 bg-white flex items-center flex-col justify-center animate-fadeIn">
              <button
                type="button"
                className="absolute top-8 right-12 text-5xl"
                onClick={() => setOpenImage(false)}
              >
                <IoClose />
              </button>

              <img
                src={data.post.image}
                alt="image"
                className="object-contain border-2 border-solid border-black"
              />
            </div>
          )}
          <Toaster />
          <div className="w-full flex items-center justify-end">
            <button type="button" onClick={close} className="text-3xl">
              <IoClose />
            </button>
          </div>

          {data && data.post && data.post.user && (
            <div className="w-full flex flex-col justify-center">
              <div className="text-3xl font-semibold break-words w-full text-justify">
                {data.post.title}
              </div>

              <div className="flex items-center text-xl gap-2 w-full justify-start">
                Focus:{" "}
                <div className="font-semibold first-letter:uppercase">
                  {data.post.focus}
                </div>
              </div>

              <div className="text-sm">
                {moment(data.post.createdAt).format("LLL")}
              </div>

              <div className="w-full h-full flex gap-2 items-center flex-col">
                <div className="bg-slate-300 w-full h-full p-2 rounded-xl">
                  <div className="w-full flex items-center justify-start gap-1">
                    <div className="text-4xl flex items-center">
                      <CgProfile />
                    </div>

                    {session && data.post.anonymous ? (
                      <div className="font-semibold">
                        {data.post.userId === session?.user.id
                          ? "Anonymous (Me)"
                          : "Anonymous"}
                      </div>
                    ) : (
                      <div className="font-semibold text-lg">
                        {data.post.user.name}
                      </div>
                    )}
                  </div>

                  <div className="text-base break-words whitespace-break-spaces text-justify px-2">
                    {data.post.content}
                  </div>

                  {data.post.image && (
                    <div
                      className="w-full overflow-y-auto flex items-center justify-center"
                      style={{ height: "400px" }}
                    >
                      <img
                        src={data.post.image}
                        alt={"Image"}
                        className="cursor-pointer"
                        onClick={() => setOpenImage(true)}
                      />
                    </div>
                  )}
                </div>
                <div className="bg-slate-300 w-full p-2 rounded-xl h-full">
                  {data.post.comments.length === 0 ? (
                    <div className="text-sm">Be the first to comment.</div>
                  ) : (
                    <div
                      className="comment w-full overflow-y-auto flex flex-col gap-2 rounded-xl"
                      style={{ maxHeight: "300px" }}
                    >
                      {data.post.comments
                        .slice()
                        .reverse()
                        .map((item: any, key: number) => {
                          return (
                            <div
                              key={key}
                              className="bg-white w-full rounded-xl p-1"
                            >
                              <div className="flex items-center justify-start gap-1">
                                <div className="text-3xl">
                                  <CgProfile />
                                </div>
                                <div>
                                  <div>{item.user.name}</div>
                                </div>
                              </div>
                              <div className="break-words whitespace-break-spaces text-justify w-full px-2 sm:text-sm xs:text-xs">
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
            onSubmit={AddComment}
            className="flex items-center w-full gap-4 justify-center mt-2"
          >
            <Input
              type="text"
              onChange={(e) => setComment(e.target.value)}
              maxLength={100}
              className="border-2 border-slate-600 border-solid rounded-2xl text-lg px-2 w-4/6"
            />

            <div>{comment.length} / 100</div>
            <button
              type="submit"
              disabled={disabled}
              style={{ cursor: disabled ? "not-allowed" : "" }}
              className="text-2xl flex items-center"
            >
              {disabled ? (
                <span className="loading loading-dots loading-lg"></span>
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
