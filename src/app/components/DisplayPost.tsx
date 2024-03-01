"use client";
import React, { useEffect, useState } from "react";
import moment from "moment";
import axios from "axios";
import { useSession } from "next-auth/react";
import { usePost } from "@/utils/usePost";
import SpecificPost from "./overlays/SpecificPost";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import { Capitalize } from "@/utils/Capitalize";
import { CgClose, CgProfile } from "react-icons/cg";
import { LuSettings2 } from "react-icons/lu";
import { BsHeartFill } from "react-icons/bs";
import { HiOutlineChatBubbleOvalLeftEllipsis } from "react-icons/hi2";
import { BsPeopleFill } from "react-icons/bs";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { isOpenDelete, valueDelete } from "@/utils/Overlay/Delete";
import { isOpenReport, valueReport } from "@/utils/Overlay/Report";
import { useRequest } from "ahooks";
import {
  getRemainingTimeDelete,
  getRemainingTimeEdit,
} from "@/utils/CountDown";
import { formatTimeHours } from "@/utils/FormatTime";
import { isOpenEdit, valueEdit } from "@/utils/Overlay/EditPost";
import { useDeleteCountDown, useEditCountDown } from "@/utils/Timer";
import { LiaEdit } from "react-icons/lia";
import { MdDelete } from "react-icons/md";

const DisplayPost: React.FC<any> = ({
  data,
  loading,
  loadingMore,
  mutate,
  noMore,
  setKeyword,
  keyword,
}) => {
  const { data: session, status } = useSession();
  const [selected, setSelect] = useState<string>("");
  const [selectedMenu, setSelectMenu] = useState<string>("");

  const [hydrate, setHydrate] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const [disabledEdit, setDisabledEdit] = useState<boolean>(false);
  const [disabledDelete, setDisabledDelete] = useState<boolean>(false);

  const { openPost, open } = usePost();

  const Delete = isOpenDelete();
  const Report = isOpenReport();
  const Edit = isOpenEdit();

  const { id, setId, clear } = valueDelete();

  const reportValue = valueReport();
  const editValue = valueEdit();

  const EditTimer = useEditCountDown();
  const DeleteTimer = useDeleteCountDown();
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
      const response = await axios.post(
        "/api/post/actions/like",
        {
          postId: postId,
          author: session?.user.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;

      if (data.msg === "liked") {
        const socket = io(`${process.env.NEXT_PUBLIC_LINK}`);

        socket.emit("active", {
          userId: session?.user.id,
          title: data.title,
          author: data.author,
          currentName: Capitalize(session?.user.name),
          postId: postId,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const engage = async (postId: string) => {
    try {
      const response = await axios.post(
        "/api/post/actions/engages",
        {
          postId: postId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.ok) {
        mutate((prev: any) => {
          return {
            ...prev,
            list: prev.list.map((item: any) => {
              if (item.id === selected) {
                return {
                  ...item,
                  _count: {
                    ...item._count,
                    engages: item._count.engages + 1,
                  },
                };
              } else return item;
            }),
          };
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEngage = () => {
    open();
    engage(selected);
  };

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_LINK}`);

    const socketListener = (data: any) => {
      if (session) {
        if (data.author === session.user.id) {
          if (data.whoLiked !== session?.user.id) {
            toast.success(
              `${data.whoLikedName} Like your post Entitled "${data.title}" `,
              {
                duration: 3000,
              }
            );

            setKeyword(!keyword);
          }
        }
      }
    };

    setTimeout(() => {
      socket.on("client", socketListener);
    }, 1000);

    return () => {
      if (socketListener) {
        socket.off("client", socketListener);
      } else socket.close();
    };
  }, [session]);

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_LINK}`);

    const socketListener = (data: any) => {
      if (session) {
        if (data.author === session.user.id) {
          if (data.by !== session.user.id) {
            toast.success(
              `${data.byName} Commented on your post Entitled "${data.title}"`,
              {
                duration: 3000,
              }
            );

            setKeyword(!keyword);
          }
        }
      }
    };

    setTimeout(() => {
      socket.on("client_comment", socketListener);
    }, 1000);

    return () => {
      if (socketListener) {
        socket.off("client_comment", socketListener);
      }
      socket.close();
    };
  }, [session]);

  useEffect(() => {
    setHydrate(true);
  }, []);

  useEffect(() => {
    if (selected !== "") {
      open();
      engage(selected);
    }
  }, [selected]);

  const reset = async (type: string) => {
    try {
      await axios.post("/api/post/get/cooldown/reset", { type: type });
    } catch (err) {
      console.error(err);
    }
  };

  const getCooldownEdit = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post("/api/post/get/cooldown/edit");
        const data = response.data;

        if (data.ok) {
          const remaining = getRemainingTimeEdit(data.startingTime);

          if (remaining !== 0) {
            EditTimer.setStarting(data.startingTime);
            EditTimer.countdown();
          } else {
            EditTimer.setStarting(0);
            reset("editTime");
          }
          resolve(data);
        } else {
          reject();
        }
      } catch (err) {
        console.error(err);
        reject();
      }
    });
  };

  const EditCooldown = useRequest(getCooldownEdit, {
    refreshDeps: [session, keyword],
    refreshOnWindowFocus: true,
    retryCount: 2,
  });

  const getCooldownDelete = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post("/api/post/get/cooldown/delete");
        const data = response.data;

        if (data.ok) {
          const remaining = getRemainingTimeDelete(data.startingTime);

          if (remaining !== 0) {
            DeleteTimer.setStarting(data.startingTime);
            DeleteTimer.countdown();
          } else {
            DeleteTimer.setStarting(0);
            reset("deleteTime");
          }

          resolve(data);
        } else {
          reject();
        }
      } catch (err) {
        console.error(err);
        reject();
      }
    });
  };

  const DeleteCooldown = useRequest(getCooldownDelete, {
    refreshOnWindowFocus: true,
    refreshDeps: [session, keyword],
    retryCount: 2,
  });

  useEffect(() => {
    if (session) {
      if (
        (EditTimer.startingTime === 0 || EditTimer.startingTime === null) &&
        (EditTimer.remainingTime === 0 || EditTimer.remainingTime === null)
      ) {
        setDisabledEdit(false);
      } else setDisabledEdit(true);
    }
  }, [EditTimer.remainingTime, session]);

  useEffect(() => {
    if (session) {
      if (
        (DeleteTimer.startingTime === 0 || DeleteTimer.startingTime === null) &&
        (DeleteTimer.remainingTime === 0 || DeleteTimer.remainingTime === null)
      ) {
        setDisabledDelete(false);
      } else setDisabledDelete(true);
    }
  }, [DeleteTimer.remainingTime, session]);

  return (
    hydrate && (
      <>
        <Toaster />
        {openPost && selected && (
          <SpecificPost
            postId={selected}
            setKeyword={setKeyword}
            keyword={keyword}
          />
        )}
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 1535: 4, 1279: 3, 1023: 2, 767: 1 }}
        >
          <Masonry gutter="20px">
            {data &&
              data.list &&
              data.list.map((item: any, key: any) => {
                return (
                  item && (
                    <div
                      key={key}
                      className={`p-2 rounded-xl bg-slate-400/80 shadow-sm animate-fadeIn`}
                    >
                      {id && item && id === item.id ? (
                        <div className="p-2 rounded-xl bg-slate-400/90 shadow-sm opacity-25">
                          <div className="flex w-full items-center justify-end">
                            <div className="skeleton h-4 w-6"></div>
                          </div>

                          <div className="flex flex-col items-start justify-center gap-2">
                            <div className="skeleton h-6 w-28"></div>
                            <div className="skeleton h-3 w-16"></div>
                            <div className="skeleton h-3 w-16"></div>
                            <div
                              className="skeleton h-44 w-full"
                              style={{
                                minWidth: "100%",
                              }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Post Menu */}

                          <div className="relative w-full flex items-center justify-end px-1">
                            {selectedMenu === item.id && menuOpen ? (
                              <>
                                <button
                                  className="text-2xl text-black"
                                  type="button"
                                  onClick={() => {
                                    setSelectMenu("");
                                    setMenuOpen(false);
                                  }}
                                >
                                  <CgClose />
                                </button>

                                <div className="absolute right-10 top-1 w-28 bg-white border border-gray-200 shadow-lg rounded-md p-2 flex flex-col">
                                  {item.user.id === session?.user.id ? (
                                    <>
                                      <button
                                        type="button"
                                        className={`flex items-center justify-start w-full ${disabledEdit || EditCooldown.loading ? "" : "hover:bg-slate-300"}  duration-700 rounded-md bg-white ${disabledEdit || EditCooldown.loading ? "cursor-not-allowed" : "cursor-pointer"}`}
                                        onClick={() => {
                                          editValue.setId(item.id);
                                          Edit.open();
                                          setKeyword(!keyword);
                                        }}
                                        disabled={
                                          disabledEdit || EditCooldown.loading
                                        }
                                      >
                                        {EditCooldown.loading ? (
                                          <span className="loading loading-dots w-8"></span>
                                        ) : disabledEdit ? (
                                          <>
                                            <div className="text-2xl w-1/4 justify-center flex items-center">
                                              <LiaEdit />
                                            </div>
                                            <div>
                                              {formatTimeHours(
                                                EditTimer.remainingTime
                                              )}
                                            </div>
                                          </>
                                        ) : (
                                          <>
                                            <div className="text-2xl flex items-center justify-center">
                                              <LiaEdit />
                                            </div>
                                            <div>EDIT</div>
                                          </>
                                        )}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setId(item.id);
                                          Delete.open();
                                          setKeyword(!keyword);
                                        }}
                                        className={`flex items-center justify-start w-full ${disabledDelete || DeleteCooldown.loading ? "" : "hover:bg-slate-300"}  duration-700 rounded-md bg-white ${disabledDelete || DeleteCooldown.loading ? "cursor-not-allowed" : "cursor-pointer"}`}
                                        disabled={
                                          disabledDelete ||
                                          DeleteCooldown.loading
                                        }
                                      >
                                        {DeleteCooldown.loading ? (
                                          <span className="loading loading-dots w-8"></span>
                                        ) : disabledDelete ? (
                                          <>
                                            <div className="text-2xl flex items-center text-red-500">
                                              <MdDelete />
                                            </div>
                                            <div>
                                              {formatTimeHours(
                                                DeleteTimer.remainingTime
                                              )}
                                            </div>
                                          </>
                                        ) : (
                                          <>
                                            <div className="text-2xl w-1/4 justify-center flex items-center text-red-500">
                                              <MdDelete />
                                            </div>
                                            <div>DELETE</div>
                                          </>
                                        )}
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        reportValue.setId(item.id);
                                        Report.open();
                                      }}
                                      className="flex items-center justify-start w-full hover:bg-slate-300 duration-700 rounded-md bg-white px-2 cursor-pointer"
                                    >
                                      Report
                                    </button>
                                  )}
                                </div>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectMenu(item.id);
                                  setMenuOpen(true);
                                }}
                                className={`text-2xl ${
                                  selectedMenu === item.id &&
                                  menuOpen &&
                                  "animate-fadeOut"
                                }`}
                              >
                                <LuSettings2 />
                              </button>
                            )}
                          </div>

                          {/* ----------------------------------------------------------- */}

                          <div className="font-bold text-2xl break-words text-justify line-clamp-2 text-ellipsis w-full 2xl:text-3xl xl:text-3xl xs:text-2xl xs:font-semibold">
                            {item.title}
                          </div>
                          <div className="text-xl first-letter:uppercase">
                            {item.focus}
                          </div>
                          <div className="text-sm">
                            {moment(item.createdAt).format("lll")}
                          </div>
                          {/* ----------------------------------------------------------- */}

                          <div
                            onClick={() => {
                              setSelect(item.id);

                              if (selected === item.id) {
                                handleEngage();
                              }
                            }}
                            className="bg-white rounded-tl-xl rounded-tr-xl p-5 flex items-start flex-col gap-5 overflow-auto hover:cursor-pointer 2xl:p-4 sm:p-2 sm:gap-2"
                          >
                            <div className="flex items-center gap-1">
                              <div className="text-5xl xs:text-4xl">
                                <CgProfile />
                              </div>
                              <div className="text-lg xs:text-sm">
                                {item.user.name && item.user.name
                                  ? item.user.name
                                  : item.user.id === session?.user.id
                                    ? "Anonymous (me)"
                                    : "Anonymous"}
                              </div>
                            </div>

                            <div className="text-lg break-words text-justify line-clamp-4 text-ellipsis w-full sm:text-md xs:text-sm">
                              {item.content}
                            </div>

                            {item.image && (
                              <img src={item.image} alt="image content" />
                            )}
                          </div>

                          {/* ----------------------------------------------------------- */}
                          <div className="w-full flex justify-between items-center m-auto px-20 bg-white rounded-bl-xl rounded-br-xl">
                            <button
                              type="button"
                              onClick={() => handleLike(item.id)}
                              className={`flex items-center gap-1 text-2xl ${loading || status === "loading" ? "cursor-not-allowed" : "cursor-pointer"}`}
                              disabled={
                                loading || status === "loading" ? true : false
                              }
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
                                setSelect(item.id);
                                if (selected && selected === item.id) {
                                  open();
                                  engage(selected);
                                }
                              }}
                              className={`flex items-center justify-center gap-1 text-2xl ${loading || status === "loading" ? "cursor-not-allowed" : "cursor-pointer"}`}
                              disabled={
                                loading || status === "loading" ? true : false
                              }
                            >
                              <div className="text-3xl">
                                <HiOutlineChatBubbleOvalLeftEllipsis />
                              </div>
                              {item._count.comments &&
                              item._count.comments >= 1000
                                ? (item._count.comments / 1000).toFixed(1) + "k"
                                : item._count.comments}
                            </button>
                            {/* ----------------------------------------------------------- */}
                            <button
                              type="button"
                              className={`flex items-center justify-center gap-1 text-2xl ${loading || status === "loading" ? "cursor-not-allowed" : "cursor-pointer"}`}
                              disabled={
                                loading || status === "loading" ? true : false
                              }
                            >
                              <BsPeopleFill />
                              {item._count.engages &&
                              item._count.engages >= 1000
                                ? (item._count.engages / 1000).toFixed(1) + "k"
                                : item._count.engages}
                            </button>
                            {/* ----------------------------------------------------------- */}
                          </div>
                        </>
                      )}
                    </div>
                  )
                );
              })}

            {!loading && !loadingMore && noMore ? (
              <div className="w-full h-full flex items-center justify-center font-semibold opacity-75">
                <div className="bg-white rounded-lg px-2 text-xl flex items-center">
                  Nothing to Load
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-slate-400/80 shadow-sm opacity-25">
                <div className="flex w-full items-center justify-end">
                  <div className="skeleton h-4 w-6"></div>
                </div>

                <div className="flex flex-col items-start justify-center gap-2">
                  <div className="skeleton h-6 w-28"></div>
                  <div className="skeleton h-3 w-16"></div>
                  <div className="skeleton h-3 w-16"></div>
                  <div
                    className="skeleton h-44 w-full"
                    style={{
                      minWidth: "100%",
                    }}
                  ></div>
                </div>
              </div>
            )}
          </Masonry>
        </ResponsiveMasonry>
      </>
    )
  );
};

export default DisplayPost;
