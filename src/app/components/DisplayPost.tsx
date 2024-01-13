"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import moment from "moment";
import axios from "axios";
import { useSession } from "next-auth/react";
import { usePost } from "@/utils/usePost";
import Button from "./Button";
import SpecificPost from "./overlays/Post";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import { Capitalize } from "@/utils/Capitalize";
import { IoSettingsOutline, IoCloseCircleOutline } from "react-icons/io5";
import { useDelete } from "@/utils/useDelete";
import { formatTime } from "@/utils/FormatTime";

const DisplayPost: React.FC<any> = ({ data, loading, mutate, reload }) => {
  const { data: session } = useSession();
  const [selected, setSelect] = useState<string>("");

  const socket = io("http://localhost:3001");
  const [openSettings, setSettings] = useState<boolean>(false);
  const { openPost, open } = usePost();
  const [hydrate, setHydrate] = useState<boolean>(false);
  const { decreaseLimit, maxLimit, check, trigger, time, decreaseTime } =
    useDelete();

  let status = ["BUSY", "UNAUTHORIZED", "NEGATIVE", "ERROR", "FAILED"];
  const handleLike = async (postId: string) => {
    try {
      mutate((prev: any) => {
        return {
          ...prev,
          list: prev.list.map((item: any) => {
            if (item.id === postId) {
              const isUserLiked = item.likes.some(
                (like: any) => like.userId === session?.user.id
              );

              if (isUserLiked) {
                return {
                  ...item,
                  likes: item.likes.filter(
                    (like: any) => like.userId !== session?.user.id
                  ),
                  _count: {
                    ...item._count,
                    likes: item._count.likes - 1,
                  },
                };
              } else {
                return {
                  ...item,
                  likes: [
                    ...item.likes,
                    { userId: session?.user.id, postId: postId },
                  ],
                  _count: {
                    ...item._count,
                    likes: item._count.likes + 1,
                  },
                };
              }
            } else {
              return item;
            }
          }),
        };
      });
      const response = await axios.post("/api/post/actions/like", {
        postId: postId,
      });
      const data = response.data;

      if (data.msg === "liked") {
        socket.emit("active", {
          userId: session?.user.id,
          author: data.author,
          currentName: Capitalize(session?.user.name),
          postId: postId,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const Delete = async (postId: string) => {
    try {
      const response = new Promise(async (resolve, reject) => {
        const res = await axios.post("/api/post/delete", { postId: postId });

        const data = res.data;

        if (!status.includes(data.status)) {
          setTimeout(() => {
            decreaseLimit();
            reload();
            resolve(data);
          }, 2000);
        } else reject(data);
      });

      toast.promise(
        response,
        {
          loading: "loading",
          success: (data: any) => `Success: ${data.msg} `,
          error: (data: any) => `Failed [${data.status}]: ${data.msg}`,
        },
        { position: "top-center" }
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    reload();
  }, [session]);

  useEffect(() => {
    const socketListener = (data: any) => {
      if (data.author === session?.user.id) {
        if (data.whoLiked !== session?.user.id) {
          toast.success(`${data.whoLikedName} Like your post ${data.postId}`, {
            duration: 3000,
          });
        }
      }
    };

    socket.on("client", socketListener);

    return () => {
      socket.off("client", socketListener);
    };
  }, [session, socket]);

  useEffect(() => {
    setHydrate(true);
    const counter = setInterval(() => {
      if (trigger) {
        if (time <= 0) {
          clearInterval(counter);
          return;
        }
        decreaseTime();
      }
    }, 1000);
    return () => clearInterval(counter);
  }, [trigger]);

  console.log(data);
  return (
    hydrate && (
      <>
        <Toaster />
        {loading && "loading"}
        <div>
          {data &&
            data.list &&
            data.list.map((item: any, key: any) => {
              return (
                <div
                  key={key}
                  className="overflow-auto break-inside-avoid border-2 border-black border-solid"
                >
                  {/* Post Menu */}
                  <div className="w-full flex items-center justify-end">
                    <div className="dropdown dropdown-left">
                      {openSettings && selected === item.id ? (
                        <div
                          tabIndex={0}
                          role="button"
                          className="text-3xl m-2"
                          onClick={() => {
                            setSelect(item.id);
                            setSettings(false);
                          }}
                        >
                          <IoCloseCircleOutline />
                        </div>
                      ) : (
                        <div
                          tabIndex={0}
                          role="button"
                          className="text-3xl m-2"
                          onClick={() => {
                            setSelect(item.id);
                            setSettings(true);
                          }}
                        >
                          <IoSettingsOutline />
                        </div>
                      )}

                      {openSettings && (
                        <ul
                          tabIndex={0}
                          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-36"
                        >
                          {item.user.id === session?.user.id ? (
                            <>
                              <li>
                                <a>EDIT</a>
                              </li>
                              <li>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelect(item.id);
                                    if (selected === item.id) Delete(selected);
                                  }}
                                >
                                  {trigger
                                    ? formatTime(time)
                                    : maxLimit
                                    ? "Limit Reached"
                                    : "Delete"}
                                </button>
                              </li>
                            </>
                          ) : (
                            <li>
                              <button type="button">Report</button>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                  {/* ----------------------- */}

                  <div>{item.id}</div>
                  <div>{item.title}</div>
                  <div>{item.focus}</div>
                  <div>{item.content}</div>
                  <div>
                    {item.user.name && item.user.name
                      ? item.user.name
                      : item.user.id === session?.user.id
                      ? "Anonymous (me)"
                      : "Anonymous"}
                  </div>

                  {item.image && (
                    <Image
                      loading="lazy"
                      src={item.image}
                      alt={"Image Content"}
                    />
                  )}

                  <div>{moment(item.createdAt).format("LLL")}</div>

                  <div className="w-full flex justify-between items-center">
                    <button type="button" onClick={() => handleLike(item.id)}>
                      {item.likes &&
                      session &&
                      item.likes.some(
                        (like: any) =>
                          like.postId === item.id &&
                          like.userId === session.user.id
                      )
                        ? "already Liked"
                        : "Like"}
                      {item._count.likes}
                    </button>
                    <Button
                      label={`Comments ${item._count.comments}`}
                      type="button"
                      onClick={() => {
                        open();
                        setSelect(item.id);
                      }}
                    />
                    <button type="button">Engages {item._count.engages}</button>
                  </div>
                  {openPost && selected === item.id && (
                    <SpecificPost postId={selected} />
                  )}
                </div>
              );
            })}
        </div>
      </>
    )
  );
};

export default DisplayPost;
