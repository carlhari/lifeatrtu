"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import moment from "moment";
import axios from "axios";
import { useSession } from "next-auth/react";
import { usePost } from "@/utils/usePost";
import Button from "./Button";
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
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";

const DisplayPost: React.FC<any> = ({
  data,
  loading,
  loadingMore,
  mutate,
  noMore,
  setKeyword,
  keyword,
}) => {
  const { data: session } = useSession();
  const [selected, setSelect] = useState<string>("");
  const [selectedMenu, setSelectMenu] = useState<string>("");

  const [hydrate, setHydrate] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const [skeleton, setSkeleton] = useState<Array<any>>([]);
  const [skeletonMore, setSkeletonMore] = useState<Array<any>>([]);

  const { openPost, open } = usePost();
  const Delete = isOpenDelete();
  const Report = isOpenReport();
  const { id, setId, clear } = valueDelete();
  const reportValue = valueReport();

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
      const response = await axios.post(
        "/api/post/actions/like",
        {
          postId: postId,
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
      await axios.post(
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
              `${data.whoLikedName} Like your post ${data.postId}`,
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

    setKeyword(!keyword);
    return () => {
      socket.off("client", socketListener);
    };
  }, [session]);

  useEffect(() => {
    setHydrate(true);
  }, []);

  useEffect(() => {
    if (selected !== "") {
      open();
      engage(selected);
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
  }, [selected]);

  // useEffect(() => {
  //   const divs = [];

  //   for (let i = 0; i < 16; i++) {
  //     divs.push(
  //       <div
  //         key={i}
  //         className="relative break-inside-avoid mb-4 p-2 rounded-xl bg-slate-400/80 shadow-sm mx-4 opacity-25"
  //       >
  //         <div className="flex w-full items-center justify-end">
  //           <div className="skeleton h-4 w-6"></div>
  //         </div>

  //         <div className="flex flex-col items-start justify-center gap-2">
  //           <div className="skeleton h-6 w-28"></div>
  //           <div className="skeleton h-4 w-16"></div>
  //           <div className="skeleton h-4 w-16"></div>
  //           <div
  //             className="skeleton h-40 w-full"
  //             style={{
  //               minWidth: "100%",
  //             }}
  //           ></div>
  //         </div>
  //       </div>
  //     );
  //   }

  //   if (divs !== null) {
  //     setSkeleton(divs);
  //   }
  // }, [loading]);

  // useEffect(() => {
  //   const divs: any = [];
  //   for (let i = 0; i < 16; i++) {
  //     divs.push(
  //       <div
  //         key={i}
  //         className="relative break-inside-avoid mb-4 p-2 rounded-xl bg-slate-400/80 shadow-sm opacity-25 mx-4"
  //       >
  //         <div className="flex w-full items-center justify-end">
  //           <div className="skeleton h-4 w-6"></div>
  //         </div>

  //         <div className="flex flex-col items-start justify-center gap-2">
  //           <div className="skeleton h-6 w-28"></div>
  //           <div className="skeleton h-4 w-16"></div>
  //           <div className="skeleton h-4 w-16"></div>
  //           <div
  //             className="skeleton h-40 w-full"
  //             style={{
  //               minWidth: "100%",
  //             }}
  //           ></div>
  //         </div>
  //       </div>
  //     );
  //   }

  //   if (divs !== null) {
  //     setSkeletonMore(divs);
  //   }
  // }, [loadingMore]);

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

        {/*loading ? (
          // <Masonry gutter="5" columnsCount={3}>
          //   {skeleton}
          // </Masonry>
        // ) : ( */}
        <Masonry gutter="5" columnsCount={3}>
          {data &&
            data.list &&
            data.list.map((item: any, key: any) => {
              return (
                <div
                  key={key}
                  className={`relative break-inside-avoid mb-4 p-2 rounded-xl bg-slate-400/80 shadow-sm mx-4 animate-fadeIn`}
                >
                  {id === item.id ? (
                    <div className="aboslute top-0 left-0 w-full h-full z-20">
                      <div className="flex w-full items-center justify-end">
                        <div className="skeleton h-4 w-6"></div>
                      </div>

                      <div className="flex flex-col items-start justify-center gap-2">
                        <div className="skeleton h-6 w-28"></div>
                        <div className="skeleton h-4 w-16"></div>
                        <div className="skeleton h-4 w-16"></div>
                        <div
                          className="skeleton h-40 w-full"
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
                                    className="flex items-center justify-start w-full hover:bg-slate-300  duration-700 rounded-md bg-white px-2"
                                  >
                                    <FiEdit />
                                    EDIT
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setId(item.id);
                                      Delete.open();
                                    }}
                                    className="flex items-center justify-start w-full hover:bg-slate-200  duration-700 rounded-md bg-white px-2"
                                  >
                                    <RiDeleteBin6Line fill="red" />
                                    DELETE
                                  </button>
                                </>
                              ) : (
                                <Button
                                  label="Report"
                                  type="button"
                                  onClick={() => {
                                    reportValue.setId(item.id);
                                    Report.open();
                                  }}
                                />
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

                      <div className="font-bold text-2xl break-words text-justify line-clamp-2 text-ellipsis w-full 2xl:text-3xl xl:text-3xl">
                        {item.title}
                      </div>
                      <div>{item.focus}</div>
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
                        className="bg-slate-100 rounded-tl-xl rounded-tr-xl p-5 flex items-start flex-col gap-5 overflow-auto hover:cursor-pointer"
                      >
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

                        {item.image && (
                          <img src={item.image} alt="image content" />
                        )}
                      </div>

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
                            setSelect(item.id);
                            if (selected && selected === item.id) {
                              open();
                              engage(selected);
                            }
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
                    </>
                  )}
                </div>
              );
            })}

          {!loading && !loadingMore && noMore ? (
            <div className="w-full h-full flex items-center justify-center font-semibold opacity-75">
              <div className="bg-white rounded-lg px-2 text-xl flex items-center">
                Nothing to Load
              </div>
            </div>
          ) : (
            <div className="relative break-inside-avoid mb-4 p-2 rounded-xl bg-slate-400/80 shadow-sm mx-4 opacity-25">
              <div className="flex w-full items-center justify-end">
                <div className="skeleton h-4 w-6"></div>
              </div>

              <div className="flex flex-col items-start justify-center gap-2">
                <div className="skeleton h-6 w-28"></div>
                <div className="skeleton h-4 w-16"></div>
                <div className="skeleton h-4 w-16"></div>
                <div
                  className="skeleton h-40 w-full"
                  style={{
                    minWidth: "100%",
                  }}
                ></div>
              </div>
            </div>
          )}
        </Masonry>

        {/* 
        {loadingMore && (
          <Masonry gutter="5" columnsCount={3}>
            {skeletonMore}
          </Masonry>
        )}
      */}

        {/* {!loading && !loadingMore && noMore ? (
          <div className="w-full flex items-center justify-center font-semibold opacity-75">
            <div className="bg-white rounded-lg px-2 text-xl">
              Nothing to Load
            </div>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center font-semibold opacity-75">
            <span className="loading loading-dots loading-lg"></span>
          </div>
        )} */}
      </>
    )
  );
};

export default DisplayPost;
