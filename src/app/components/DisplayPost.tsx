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
import { CgClose, CgProfile } from "react-icons/cg";
import { LuSettings2 } from "react-icons/lu";
import { BsHeartFill } from "react-icons/bs";
import { HiOutlineChatBubbleOvalLeftEllipsis } from "react-icons/hi2";
import { BsPeopleFill } from "react-icons/bs";

const DisplayPost: React.FC<any> = ({
  data,
  loading,
  mutate,
  reload,
  noMore,
}) => {
  const { data: session } = useSession();
  const [selected, setSelect] = useState<string>("");
  const { openPost, open } = usePost();
  const [hydrate, setHydrate] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

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
        const socket = io("http://localhost:3001");
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
    const socket = io("http://localhost:3001");
    const socketListener = (data: any) => {
      if (data.author === session?.user.id) {
        if (data.whoLiked !== session?.user.id) {
          toast.success(`${data.whoLikedName} Like your post ${data.postId}`, {
            duration: 3000,
          });
        }
      }
    };

    setTimeout(() => {
      socket.on("client", socketListener);
    }, 1000);

    reload();
    return () => {
      socket.off("client", socketListener);
    };
  }, [session]);

  useEffect(() => {
    setHydrate(true);
  }, []);

  return (
    hydrate && (
      <>
        <Toaster />
        {loading && "loading"}
        <div className="columns-4 gap-4 mb-4 p-1">
          {data &&
            data.list &&
            data.list.map((item: any, key: any) => {
              return (
                <div
                  key={key}
                  className="relative break-inside-avoid mb-4 p-2 rounded-xl bg-slate-400/80 shadow-sm"
                >
                  {/* Post Menu */}

                  <div className="relative w-full flex items-center justify-end px-1">
                    {selected === item.id && menuOpen ? (
                      <>
                        <button
                          className="text-2xl text-black"
                          type="button"
                          onClick={() => {
                            setSelect("");
                            setMenuOpen(false);
                          }}
                        >
                          <CgClose />
                        </button>

                        <div className="absolute right-10 top-1 w-32 bg-white border border-gray-200 shadow-lg rounded-md p-2 flex flex-col">
                          {item.user.id === session?.user.id ? (
                            <>
                              <Button label="EDIT" type="button" />
                              <Button
                                label={"Delete"}
                                type="button"
                                onClick={() => {
                                  setSelect(item.id);
                                  if (selected === item.id) Delete(selected);
                                }}
                              />
                            </>
                          ) : (
                            <Button label="Report" type="button" />
                          )}
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelect(item.id);
                          setMenuOpen(true);
                        }}
                        className={`text-2xl ${
                          selected === item.id && menuOpen && "animate-fadeOut"
                        }`}
                      >
                        <LuSettings2 />
                      </button>
                    )}
                  </div>

                  {/* ----------------------------------------------------------- */}

                  <div className="font-bold text-2xl break-words text-justify line-clamp-2 text-ellipsis w-full 2xl:text-3xl xl:text-3xl">
                    {item.title}
                  </div>
                  <div>{item.focus}</div>
                  <div className="text-sm">
                    {moment(item.createdAt).format("lll")}
                  </div>
                  {/* ----------------------------------------------------------- */}
                  <div className="bg-slate-100 rounded-tl-xl rounded-tr-xl p-5 flex items-start flex-col gap-5">
                    <div className="flex items-center gap-1">
                      <div className="text-5xl">
                        <CgProfile />
                      </div>
                      <div>
                        {item.user.name && item.user.name
                          ? item.user.name
                          : item.user.id === session?.user.id
                          ? "Anonymous (me)"
                          : "Anonymous"}
                      </div>
                    </div>
                    <div className="break-words text-justify line-clamp-4 text-ellipsis w-full">
                      {item.content}
                    </div>
                  </div>
                  {/* ----------------------------------------------------------- */}
                  {item.image && (
                    <Image
                      loading="lazy"
                      src={item.image}
                      alt={"Image Content"}
                    />
                  )}
                  {/* ----------------------------------------------------------- */}
                  <div className="w-full flex justify-between items-center m-auto px-20 bg-slate-100 rounded-bl-xl rounded-br-xl">
                    <button
                      type="button"
                      onClick={() => handleLike(item.id)}
                      className="flex items-center gap-1 text-2xl"
                    >
                      <BsHeartFill
                        fill={
                          item.likes &&
                          session &&
                          item.likes.some(
                            (like: any) =>
                              like.postId === item.id &&
                              like.userId === session.user.id
                          )
                            ? "red"
                            : "black"
                        }
                      />
                      {item._count.likes && item._count.likes >= 1000
                        ? (item._count.likes / 1000).toFixed(1) + "k"
                        : item._count.likes}
                    </button>
                    {/* ----------------------------------------------------------- */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelect(item.id);
                        if (selected === item.id) open();
                      }}
                      className="flex items-center justify-center gap-1 text-2xl"
                    >
                      <div className="text-3xl">
                        <HiOutlineChatBubbleOvalLeftEllipsis />
                      </div>
                      {item._count.comments && item._count.comments >= 1000
                        ? (item._count.comments / 1000).toFixed(1) + "k"
                        : item._count.comments}
                    </button>
                    {/* ----------------------------------------------------------- */}
                    <button
                      type="button"
                      className="flex items-center justify-center gap-1 text-2xl"
                    >
                      <BsPeopleFill />
                      {item._count.engages && item._count.engages >= 1000
                        ? (item._count.engages / 1000).toFixed(1) + "k"
                        : item._count.engages}
                    </button>
                    {/* ----------------------------------------------------------- */}
                  </div>
                  {openPost && selected === item.id && (
                    <SpecificPost postId={selected} />
                  )}
                </div>
              );
            })}
        </div>

        {noMore && "No More"}
      </>
    )
  );
};

export default DisplayPost;
